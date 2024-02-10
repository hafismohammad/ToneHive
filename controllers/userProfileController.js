const User = require("../models/userModel")
const AddreddModel = require('../models/addressModel');
const bcrypt = require('bcrypt');
const Order = require("../models/orderModel");
const Cart = require('../models/cartModel');
const Products = require("../models/productModel");
const ObjectId =require('mongoose').Types.ObjectId
const moment = require('moment');


const userProfile = async (req, res) => {
    try {
        let userId = req.session.user._id;


        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).send('User not found');
        }


        const userAddress = await AddreddModel.aggregate([
            { $match: { userId: userId } }
        ]);

    
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
            }
        ]);
   
        const date = new Date();
        const momentDate = moment(date);
        const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');
       


        res.render("user/page-userProfile", {
            user: userData,
            userAddress: userAddress,
            userOrders: userOrders 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};


const AddressPost = async (req, res) => {
    try {

        const id = req.params.id
        const { fname, lname, mobile, email, address, country, state, city, pincode } = req.body;

        const userAddress = await AddreddModel.findByIdAndUpdate(id, {
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

        res.redirect('/userProfile')
    } catch (error) {
        console.log(error);
    }
}

const userProfileAddressDelete = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        await AddreddModel.deleteMany({ _id: id })

    } catch (error) {
        console.log(error);
    }
}


const saltRounds = 10;

const changePassword = async (req, res) => {
    const currentPassword = req.body.password;
    const newPassword = req.body.npassword;
    const confirmedPassword = req.body.cpassword;

    try {
        const userId = req.session.user._id;

        const userData = await User.findOne(userId);

        if (!userData) {
            return res.status(404).send("User not found");
        }
        const passwordMatch = await bcrypt.compare(currentPassword, userData.password);

        if (!passwordMatch) {
            console.log("Current password is incorrect");
            return res.status(400)
        }

        if (newPassword !== confirmedPassword) {

            return res.status(400)
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.updateOne({ _id: userId }, { password: hashedNewPassword });

        console.log("Password changed successfully");

        res.status(200)

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
        }
    ]);
  
    const date = new Date();
    const momentDate = moment(date);
    const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');
    userOrders.createdAt = formattedDate
    


      console.log(userOrders.createdAt);
    res.render('user/Page-viewDetails', {userOrders:userOrders})
} catch (error) {
    console.log(error);
}
}

const orderCancel = async (req, res) => {
    try {
        const order_id = req.params.id
  
        const orderid = new ObjectId(order_id); 

        const result = await Order.findById({ _id: orderid });

        result.orderStatus = "cancelled";
        result.save();


        res.json({ success: true });

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    userProfile,
    AddressPost,
    userProfileAddressDelete,
    changePassword,
    viewOrderDetails,
    orderCancel
}