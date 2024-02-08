const AddreddModel = require('../models/addressModel');
const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const mongoose =require('mongoose')

const checkoutLoad = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
           
            throw new Error('User ID not found in session');
        }
        const userId = req.session.user._id

        const userAddress = await AddreddModel.find({userId:userId})

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
            totalCartPrice
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
        const userAddress = await AddreddModel.findOne({_id:id})
  
        res.render("user/page-editAddress", { userAddress });
    } catch (error) {
        console.log(error);
    }
};

const edittedAddress = async (req, res) => {
    try {
     
     const id = req.params.id
     const { fname, lname, mobile, email, address, country, state, city, pincode } = req.body;

      const userAddress = await A.findByIdAndUpdate(id, {
        fname,
        lname,
        mobile,
        email,
        address,
        country,
        state,
        city,
        pincode
      })
      
      res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
       await AddreddModel.deleteMany({_id:id})

    
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    checkoutLoad,
    addAddress,
    editAddressLoad,
    edittedAddress,
    deleteAddress
}