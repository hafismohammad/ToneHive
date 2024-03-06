const AddreddModel = require('../models/addressModel');
const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const ObjectId = require('mongoose').Types.ObjectId
const Order = require('../models/orderModel')
const moment = require('moment');
const mongoose = require('mongoose');
const Products = require('../models/productModel');
const couponModel = require("../models/couponModel")
const offerModel = require("../models/offerModel")

const { KEY_ID, KEY_SECRET } = process.env

const Razorpay = require('razorpay');
const { log } = require('node:console');

var razorpay = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET
})

const createOrder = async (req, res) => {
    try {
        const amount = parseInt(req.body.totalPrice);



        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: req.session.user
        })

        res.json({ orderId: order })

    } catch (error) {
        console.log(error);
    }
}

const checkoutLoad = async (req, res) => {
    try {
        const message = req.query.message;
        const success = req.query.success;

        if (!req.session.user || !req.session.user._id) {
            throw new Error('User ID not found in session');
        }

        const userId = req.session.user._id;

        // Fetch user information
        const userInfo = await User.findOne(userId);

        // Fetch user addresses
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
                    "address.mobile": 1,
                    "address._id": 1
                }
            }
        ]);

        // Fetch cart items
        const cartItems = await Cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$items' },
            { $project: { items: 1 } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }
        ]);

        // Fetch wishlist items
        //  const wishlist = await wishlistModel.find({ user: userId });


        // Fetch active offer
        const activeOffer = await offerModel.findOne({ status: true });

        // Calculate offer price for each product in the cart
        let totalCartAmount = 0;
        const populatedCartItems = cartItems.map(cartItem => {
            const product = cartItem.productDetails[0];
            let offerPrice = parseInt(product.price); // Default to product price

            // Check if product is defined and has a price
            if (product && product.price) {
                let appliedDiscount = 0; // Track the highest applied discount

                // Check if there is an active product offer
                if (activeOffer && activeOffer.productOffer && activeOffer.productOffer.product.toString() === product._id.toString()) {
                    const productDiscount = activeOffer.productOffer.discount;
                    const discountedPrice = (offerPrice * productDiscount) / 100;

                    if (discountedPrice > appliedDiscount) {
                        offerPrice -= discountedPrice;
                        appliedDiscount = discountedPrice;
                    }
                }
                // Check if there is an active category offer
                if (activeOffer && activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === product.category.toString()) {
                    const categoryDiscount = activeOffer.categoryOffer.discount;
                    const discountedPrice = (offerPrice * categoryDiscount) / 100;

                    if (discountedPrice > appliedDiscount) {
                        offerPrice -= discountedPrice;
                        appliedDiscount = discountedPrice;
                    }
                }

                // Check if product discount is greater than applied discount
                if (product.discount > appliedDiscount) {
                    const discountedPrice = (offerPrice * product.discount) / 100;

                    if (discountedPrice > appliedDiscount) {
                        offerPrice -= discountedPrice;
                        appliedDiscount = discountedPrice;
                    }
                }

                // Calculate subtotal after applying discounts and round the amounts
                const subtotal = Math.round(offerPrice * cartItem.items.quantity);
                totalCartAmount += subtotal;

                return {
                    ...cartItem,
                    productDetails: product,
                    subtotal: subtotal
                };

            } else {
                // Handle the case where product or product price is undefined
                console.error('Product or product price is undefined:', product);
                // For example, you can skip processing this product or set a default offer price
                return null; // Skip this product
            }
        }).filter(Boolean); // Remove null values from the array

        // Fetch total cart price from the database
        let totalCartPrice = 0; // Initialize totalCartPrice

        // Fetch total cart price from the database
        const useCart = await Cart.findOne({ userId: userId });

        // Check if useCart exists and has the totalPrice property
        if (useCart && useCart.totalPrice !== undefined) {
            // Access the totalPrice property
            totalCartPrice = useCart.totalPrice;
        } else {
            // Handle the case when useCart or totalPrice is null or undefined
            console.error("useCart or totalPrice is null or undefined");
            // For example, you can set a default value for totalCartPrice
        }

        // Fetch coupons
        const coupons = await couponModel.find();

        // Calculate cart total count
        const cartCount = cartItems.length;

        // Render the checkout page with data
        res.render("user/page-checkout", {
            userId: userId,
            userAddress: userAddress,
            cartItems: populatedCartItems,
            totalCartPrice: totalCartAmount, // Pass totalCartAmount instead of totalCartPrice
            userInfo: userInfo,
            coupons: coupons,
            cartCount: cartCount,
            message: message,
            success: success
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};



const addAddress = async (req, res) => {
    try {

        const {
            name,
            house,
            city,
            state,
            country,
            pincode,
            mobile,

        } = req.body
        const userId = req.session.user._id;

        const newAddress = {
            name: name,
            house: house,
            city: city,
            state: state,
            country: country,
            pincode: pincode,
            mobile: mobile,

        };

        const user = await User.findById({ _id: userId })

        if (!user) {
            return res.status(404).send('User not found');
        }
        user.address.push(newAddress)


        await user.save()

        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}


const editAddressLoad = async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.session.user._id;
        const userAddress = await User.findOne({ _id: userId, "address._id": id }, { "address.$": 1, _id: 0 });


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

        // Fetch user address
        const addressData = await User.findOne({ _id: userId, 'address._id': address }, { 'address.$': 1, _id: 0 });

        // Fetch cart items
        const cartItems = await Cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$items' },
            { $project: { items: 1 } },
            { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'productDetails' } }
        ]);

        // Initialize total cart price
        let totalCartPrice = 0;

        // Calculate offer price for each product in the cart
        for (const cartItem of cartItems) {
            const product = cartItem.productDetails[0];
            let offerPrice = product.price; // Initialize offer price with product price
            let appliedDiscount = 0; // Track the highest applied discount

            // Check if there is an active offer
            const activeOffer = await offerModel.findOne({ status: true });

            // Apply offer discount based on the offer type (product or category)
            if (activeOffer) {
                if (activeOffer.productOffer && activeOffer.productOffer.product.toString() === product._id.toString()) {
                    const productDiscount = activeOffer.productOffer.discount;
                    const discountedPrice = (offerPrice * productDiscount) / 100;

                    if (discountedPrice > appliedDiscount) {
                        offerPrice -= discountedPrice;
                        appliedDiscount = discountedPrice;
                    }
                }

                if (activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === product.category.toString()) {
                    const categoryDiscount = activeOffer.categoryOffer.discount;
                    const discountedPrice = (offerPrice * categoryDiscount) / 100;

                    if (discountedPrice > appliedDiscount) {
                        offerPrice -= discountedPrice;
                        appliedDiscount = discountedPrice;
                    }
                }
            }

            if (product.discount > appliedDiscount) {
                const productDiscountedPrice = Math.round((offerPrice * product.discount) / 100);
            
                if (productDiscountedPrice > appliedDiscount) {
                    offerPrice -= productDiscountedPrice;
                    appliedDiscount = productDiscountedPrice;
                }
            }
            

            // Calculate subtotal for the product
            const subtotal = offerPrice * cartItem.items.quantity;
            totalCartPrice += subtotal;

            // Update the product details with offer price and subtotal
            cartItem.productDetails[0].offerPrice = offerPrice;
            cartItem.subtotal = subtotal;

            cartItem.productDetails[0].productPrice = product.price;
            cartItem.productDetails[0].productName = product.name;
            cartItem.productDetails[0].buyerName = req.session.user.name;
            
        }

        // Decrease product quantity
        for (const cartItem of cartItems) {
            await Products.updateOne({ _id: cartItem.productDetails[0]._id }, { $inc: { quantity: -cartItem.items.quantity } });
        }
       

        // Define order status
        const status = paymentMethod === 'COD' ? 'confirmed' : 'pending';

       
        await Order.create({
            address: addressData.address[0],
            userId: userId,
            paymentMethod: paymentMethod,
            products: cartItems.map(item => ({ 
                productId: item.productDetails[0]._id, 
                quantity: item.items.quantity, 
                price: item.productDetails[0].price,
                productPrice: item.productDetails[0].offerPrice,
                productName: item.productDetails[0].productName,
                buyerName: item.productDetails[0].buyerName
            })),
            totalPrice: totalCartPrice,
            orderStatus: status,
            createdAt: new Date(),
            coupon: null 
        });

        // Clear the cart after placing the order
        await Cart.deleteOne({ userId: userId });

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to place the order.' });
    }
};




const orderPlace = async (req, res) => {
    try {
        const userId = req.session.user._id
        const lastOrder = await Order.findOne({ userId: userId }).sort({ createdAt: -1 });

        res.render('user/page-orderSuccess', { lastOrder })
    } catch (error) {
        console.log(error);
    }
}

const paymentSuccess = (req, res) => {
    try {
        const { paymentid, razorpayorderid, signature, orderId } = req.body;
        const { createHmac } = require('node:crypto');

        const hash = createHmac('sha256', 'XViGIX1i2HyMgTUc0xt8xAir')
            .update(orderId + "|" + paymentid)
            .digest('hex');

        if (hash === signature) {
            console.log('success');
            res.status(200).json({ success: true, message: 'Payment successful' });
        } else {
            console.log('error');
            res.status(400).json({ success: false, message: 'Invalid payment details' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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
    createOrder,
    paymentSuccess
}; 
