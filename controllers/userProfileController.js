const User = require("../models/userModel")
const AddreddModel = require('../models/addressModel');
const bcrypt = require('bcrypt');
const Order = require("../models/orderModel");
const Cart = require('../models/cartModel');
const Products = require("../models/productModel");
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment');
const Wallet = require('../models/walletModel')

const userProfile = async (req, res) => {
    try {
        let userId = req.session.user._id;
        const userInfo = await User.findOne(userId)

        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).send('User not found');
        }


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

        //   const userOrders = await Order.findOne({userId:userId},{'address':1})
        // console.log(userOrders1);
        // const userOrders = await Order.aggregate([
        //     {
        //         $match: { userId: userId }
        //     },
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'address',
        //             foreignField: '_id',
        //             as: 'lookedUpAddress'
        //         }
        //     },
        //     {
        //         $unwind: '$products'
        //     },

        // ]);
        const userOrders = await Order.find({ userId: userId })


        const cartItems = await Cart.find({ userId: userId });
        let cartTotalCount = 0;
        cartItems.forEach(cart => {
            cartTotalCount += cart.items.length;
        });



        const date = new Date();
        const momentDate = moment(date);
        const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');

        const wallet = await Wallet.findOne({ user: userId });
        console.log(wallet);

        // const message = req.flash('message');
        const message = req.flash('message');
        res.render("user/page-userProfile", {
            userId: userData,
            userAddress: userAddress,
            userOrders: userOrders,
            message: message,
            userInfo: userInfo,
            cartTotalCount: cartTotalCount,
            wallet: wallet

        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

const AddressPost = async (req, res) => {
    try {
        const {
            name,
            house,
            city,
            state,
            country,
            pincode,
            mobile
        } = req.body;

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

        req.flash('message', 'New Address Added')
        res.redirect('/userProfile');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

const profileEditAddressLoad = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addressId = req.params.id;

        const userAddress = await User.findOne(
            { _id: userId, "address._id": addressId },
            { "address.$": 1, _id: 0 }
        );

        res.render("user/page-profileEditAddress", { userAddress });
    } catch (error) {
        console.log(error);
    }
};


const editProfileAddress = async (req, res) => {
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


const profileAddressEditpost = async (req, res) => {
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

            res.redirect('/userProfile');
        } else {
            console.log("User address update failed.");
            res.status(404).send("User address update failed.");
        }
    } catch (error) {
        console.error("Error updating user address:", error);
        res.status(500).send("Error updating user address. Please try again later.");
    }
}


const userProfileAddressDelete = async (req, res) => {
    try {
        const userId = req.session.user._id

        const id = req.params.id;



        const result = await User.updateOne(
            { _id: userId },
            { $pull: { address: { _id: id } } }
        );

        if (result) {
            console.log("Address deleted successfully.");
            res.status(200).json({ message: "Address deleted successfully." });
        } else {
            console.log("Address not found or already deleted.");
            res.status(404).json({ message: "Address not found or already deleted." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const saltRounds = 10;
const changePassword = async (req, res) => {
    try {
        const {
            name, email, mobile, password, npassword, cpassword
        } = req.body;

        const userId = req.session.user._id;

        // Check if new password matches the confirm password
        if (npassword !== cpassword) {
            return res.status(400).send("New password and confirm password do not match");
        }

        // Find the user document by userId
        const userData = await User.findOne({ _id: userId });

        if (!userData) {
            return res.status(404).send("User not found");
        }

        // Verify the current password
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(400).send("Current password is incorrect");
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(npassword, saltRounds);

        // Update user details including the password
        await User.updateOne({ _id: userId }, {
            $set: {
                name: name,
                email: email,
                mobile: mobile,
                password: hashedNewPassword
            }
        });

        console.log("User account details and password changed successfully");
        res.status(200).send("User account details and password changed successfully");

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};


const viewOrderDetails = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const userOrders = await Order.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: 'lookedUpAddress'
                }
            },

        ]);

        const cartItems = await Cart.find({ userId: userId });
        let cartTotalCount = 0;
        cartItems.forEach(cart => {
            cartTotalCount += cart.items.length;
        });

        const date = new Date();
        const momentDate = moment(date);
        const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');
        userOrders.createdAt = formattedDate



        res.render('user/Page-viewDetails', { userOrders: userOrders, cartTotalCount: cartTotalCount })
    } catch (error) {
        console.log(error);
    }
}

const orderCancel = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orderId = req.params.orderId;
        const productId = req.params.productId;

        const order = await Order.findById(orderId);
        const product = order.products.find(product => product._id.toString() === productId);

        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found in the order" });
        } else {
            product.orderStatus = 'cancelled';
        }

        await order.save();

        if (order.paymentMethod === 'Razorpay') {
            const wallet = await Wallet.findOne({ user: userId })
            if (wallet) {
                wallet.balance += order.totalPrice
                wallet.walletData.push({
                    amount: order.totalPrice,
                    date: Date.now(),
                    paymentMethod: 'Razorpay'
                })
                await wallet.save()
            } else {
                const newWallet = new Wallet({
                    user: userId,
                    balance: order.totalPrice,
                    walletData: [{
                        amount: order.totalPrice,
                        date: Date.now(),
                        paymentMethod: 'Razorpay'
                    }]
                });

                await newWallet.save();
            }
        }
        res.json({ success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};





const viewProducrDetails = async (req, res) => {
    try {
        const user = req.session.user._id

        const userId = await User.findById({ _id: user })
        const orderId = req.params.id

        const orderedItems = await Order.findById(orderId).populate(
            'products.productId'
        )
       
        // orderedItems.offerPrice = orderedItems.products[0].productId.price - ((orderedItems.products[0].productId.price * orderedItems.products[0].productId.discount) / 100)
        // console.log(orderedItems);

        const cartItems = await Cart.find({ userId: user });
        let cartTotalCount = 0;
        cartItems.forEach(cart => {
            cartTotalCount += cart.items.length;
        });


        res.render("user/Page-viewDetails", { orderedItems: orderedItems, userId: userId, cartTotalCount: cartTotalCount })
    } catch (error) {
        console.log(error);
    }
}


const orderReturn = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const productId = req.params.productId


        const order = await Order.findById(orderId);
        const product = order.products.find(product => product._id.toString() === productId)

        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found in the order" });
        }

        if (product.orderStatus === "delivered") {
            product.orderStatus = "return pending";

        } else if (product.orderStatus === "return pending") {
            product.orderStatus = "returned";
        }
        await order.save();

        res.json({ success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

const walletPost = (req, res) => {
    try {

    } catch (error) {
        console.log(errror);
    }
}


module.exports = {
    userProfile,
    AddressPost,
    editProfileAddress,
    userProfileAddressDelete,
    changePassword,
    viewOrderDetails,
    orderCancel,
    profileEditAddressLoad,
    editProfileAddress,
    profileAddressEditpost,
    userProfileAddressDelete,
    viewProducrDetails,
    orderReturn,
    walletPost


}