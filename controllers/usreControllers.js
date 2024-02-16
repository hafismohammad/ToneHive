const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');
const Products = require('../models/productModel');
const Cart = require("../models/cartModel");
const flash = require("express-flash");


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash

    } catch (error) {
        console.log(error);
    }
}

const homeLoad = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const userName = user.name;


        if (req.session.user) {
            const category = await Category.find({ isList: false })

            // const products = await Product.find({product_status:false})
            const productData = await Products.aggregate([{

                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                }
            },
            {
                $match: {
                    "category.isList": false,
                    "product_status": true
                }
            }
            ])


            const activeProducts = productData
                .map((item) => {
                    const category = item.category[0]
                    if (category && category.isList) {

                        const category = item.category[0]
                        if (item.product_status) {
                            return item
                        }
                    } else {
                        return null;
                    }
                }).filter(Boolean)
            // console.log(activeProducts);

            const cartItems = await Cart.find({userId:userId});
            let cartTotalCount = 0; 
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length; 
            });
           
           
            // Now you can use cartCount to display the count in your cart icon or perform other operations


            res.render("user/page-userHome", { userName: userName, category: category, products: productData, activeProducts: activeProducts,cartTotalCount:cartTotalCount })
        } else {
            redirect("/")
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const loginLoad = function (req, res) {
    if (req.session.user) {
        res.redirect("/userHome");
    } else {
        const message = req.flash('message');
        res.render("user/page-login", { message: message[0] });
    }
};

const logedUser = async (req, res) => {
    const logEmail = req.body.email;
    const logPassword = req.body.password;
    // console.log(logEmail);
    try {

        const logedUser = await User.findOne({
            email: logEmail
        });
        const id = logedUser._id

        if (logedUser) {
            const comparePass = await bcrypt.compare(logPassword, logedUser.password);
            if (comparePass) {
                //  console.log(req.body);
                // if (logedUser.isAdmin === 1) {
                //     req.session.admin = id
                //     res.redirect("/adminhome")
                if (logedUser.isBlocked == false) {
                    req.session.user = id
                    res.redirect("/userHome")
                } else {
                    console.log("This user not exist");
                    res.render("user/page-login", { error: "This user does not exist" })
                }

            } else {
                res.render("user/page-login", { error: "Failed to login" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}


// Generate a random OTP
function generateRandomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create an email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hafismhdthaleekara764@gmail.com',
        pass: 'ofzx kkgh klon lnht',
    },
});



const registerLoad = (req, res) => {
    if (req.session.user) {
        res.redirect("/page-userHome");
    } else {
        const message = req.flash('message');
        const error = req.flash('error');

        res.render("user/page-register", { message: message, error: error })
    }
}

const registeredUser = async (req, res) => {
    try {

        const userEmail = req.body.email;
        const existingUser = await User.findOne({ email: userEmail });

        console.log(existingUser);
        if (existingUser) {
            req.flash('error', "Email already exists.");
            return res.redirect("/register?error=Email already exists");
        }


        const spassword = await securePassword(req.body.password)
        // console.log(req.body);
        const userIn = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,

        }
        req.session.userData = userIn

        const otp = generateRandomOtp();
        console.log(otp);
        const email = userIn.email;

        const mailOptions = {
            from: 'hafismhdthaleekara764@gmail.com',
            to: email,
            subject: 'OTP Verification In Register Side',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending OTP email", error.message);
            } else {
                console.log("Register Side OTP mail sent", info.response);
            }
        });



        // Store OTP in session
        req.session.otp = otp;
        req.session.email = email;
        req.session.otpExpirationTime = Date.now() + 20 * 1000

        res.redirect('/otpRegister')

    } catch (error) {
        console.log(error);
        res.redirect('/register')
    }
}

const userLogout = (req, res) => {
    if (req.session.user || req.session.admin) {
        req.session.destroy((error) => {
            if (error) {
                res.redirect("/userhome")
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect("/")
    }
}



const productViews = async (req, res) => {
    try {
        const user = req.session.user
        const userInfo = await User.findById({ _id: user })

        const id = req.query.id
        const productData = await Products.findOne({ _id: id });
        if (productData.product_status) {

            const cartItems = await Cart.find({userId:user});
            let cartTotalCount = 0; 
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length; 
            });
    
   
            res.render("user/page-viewProduct", { products: productData, userInfo: userInfo,cartTotalCount:cartTotalCount })
        }
        res.redirect("/userHome")
    } catch (error) {

    }
}




module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    productViews,
    generateRandomOtp
}