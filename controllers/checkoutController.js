const AddreddModel = require('../models/addressModel');
const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const ObjectId =require('mongoose').Types.ObjectId
const Order = require('../models/orderModel')
const moment = require('moment');
const mongoose = require('mongoose')

const checkoutLoad = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
           
            throw new Error('User ID not found in session');
        }
        const userId = req.session.user._id
        const userInfo = await User.findOne(userId)
        const userAddress = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$address" },
            {
                $project: {
                    "address.name": 1,
                    "address.house": 1,
                    "address.city": 1,
                    "address.state": 1,
                    "address.country": 1,
                    "address.pincode": 1,
                    "address.mobile": 1 ,
                    "address._id" : 1
                }
            }
        ]);
        

        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: '$items'
            },
            {
                $project: {
                    items: 1 
                }
            },
            {
                $lookup: {
                    from: 'products', 
                    localField: 'items.productId', 
                    foreignField: '_id', 
                    as: 'productDetails' 
                }
            },
           
        ]);

        let totalCartPrice = 0;
        const populatedCartItems = cartItems.map(cartItem => {
            const product = cartItem.productDetails[0];
            const subtotal = product.price * cartItem.items.quantity;
            totalCartPrice += subtotal;
            return {
                ...cartItem,
                productDetails: product,
                subtotal: subtotal
            };
        });
   
        res.render("user/page-checkout",
        {
            userId:userId,
            userAddress:userAddress,
            cartItems:populatedCartItems,
            totalCartPrice,
            userInfo:userInfo
        })
    } catch (error) {
        console.log(error);
    }
}

const addAddress = async (req, res) => {
    try {
       
        const {
            fname,
            lname,
            mobile,
            email,
            address,
            country,
            state,
            city,
            pincode,
            userId
        } = req.body

        const getAddress = {
            fname:fname, lname:lname, mobile:mobile,
            email:email, address:address,country:country, 
            state:state, city:city, pincode:pincode, userId:userId       
        }

        const findAddress = await AddreddModel.findOne({email:email})
        const saveAddress = await AddreddModel.create(getAddress)

        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}


const editAddressLoad = async (req, res) => {
    try {
        const id = req.params.id
        const userId=req.session.user._id;
        const userAddress = await User.findOne({_id:userId,"address._id":id},{"address.$":1,_id:0});
       
        
        res.render("user/page-editAddress", { userAddress });
    } catch (error) {
        console.log(error);
    }
};
const edittedAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addressId = req.params.id;
        const { name, house, city, state, country, pincode, mobile } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { 
                _id: userId, 
                "address._id": addressId 
            }, 
            { 
                $set: {
                    "address.$.name": name,
                    "address.$.house": house,
                    "address.$.city": city,
                    "address.$.state": state,
                    "address.$.country": country,
                    "address.$.pincode": pincode,
                    "address.$.mobile": mobile
                }
            },
            { 
                new: true 
            }
        );

        if (updatedUser) {
       
            res.redirect('/checkout');
        } else {
            console.log("User address update failed.");
            res.status(404).send("User address update failed.");
        }
    } catch (error) {
        console.error("Error updating user address:", error);
        res.status(500).send("Error updating user address. Please try again later.");
    }
};


// const deleteAddress = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log(id);
//        await AddreddModel.deleteMany({_id:id})

    
//         res.status(200).json({ message: "Address deleted successfully" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

const placeOrderPost = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { address, paymentMethod } = req.body;
        const userAddressId = new mongoose.Types.ObjectId(address);
    
        const addressData = await User.findOne({_id: userId, 'address._id': address}, {'address.$': 1, _id: 0});
      
        const cartItems = await Cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$items' },
            { $project: { items: 1 } },
            { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'productDetails' } }
        ]);


        let totalCartPrice = 0;
        const populatedCartItems = cartItems.map(cartItem => {
            const product = cartItem.productDetails[0];
            const subtotal = product.price * cartItem.items.quantity;
            totalCartPrice += subtotal;
            return { ...cartItem, productDetails: product, subtotal: subtotal };
        });
 const cartProducts = await Cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'productDetails' } },
            { 
              $project: {
                productId: "$items.productId", 
                quantity: "$items.quantity", 
                price: "$items.price", 
                _id: 0
              } 
            }
          ]);
          console.log(cartProducts);
        

        const status = paymentMethod === 'COD' ? 'confirmed' : 'pending';

        const date = new Date();
        const momentDate = moment(date);
        const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');

        await Order.create({
            address: addressData.address[0],
            userId: userId,
            paymentMethod: paymentMethod,
            products: cartProducts,
            totalPrice: totalCartPrice,
            orderStatus: status,
            createdAt: formattedDate
        });

        await Cart.deleteOne({ userId: userId });

        res.redirect('/orderSuccess'); // Redirect the user to the '/orderSuccess' page
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to place the order.' });
    }
}

const orderPlace = (req, res) => {
    try {
        res.render('user/page-orderSuccess')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    checkoutLoad,
    addAddress,
    editAddressLoad,
    edittedAddress,
    // deleteAddress,
    placeOrderPost,
    orderPlace,
}; 
