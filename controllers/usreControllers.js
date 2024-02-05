const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');
const Products=require('../models/productModel');
const Cart = require("../models/cartModel");


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
        if (req.session.user) {
        const category = await Category.find({isList:false})
       
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
            if (category  && category.isList) {
                
            const category = item.category[0]
                if(item.product_status){
                    return item
                }
            }else {
                return null;
            }   
        }).filter(Boolean)
     // console.log(activeProducts);
    

        res.render("user/page-userHome", {category:category,products:productData,activeProducts:activeProducts})
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
        res.render("user/page-login", { message:message[0] }); // Pass the message to the template
        console.log(message);
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
                 if(logedUser.isBlocked==false){
                    req.session.user = id
                    res.redirect("/userHome")
                }else{
                    console.log("This user not exist");
                    res.render("user/page-login",{error:"This user does not exist"})
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
    } else if (req.session.admin) {
        res.redirect("/page-adminDashboard")
    } else {
        res.render("user/page-register")
    }
}

const registeredUser = async (req, res) => {
    try {
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
        const email=userIn.email;

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
        const id=req.query.id
       
        const productData = await Products.findOne({_id:id})
        res.render("user/page-viewProduct",{products:productData})
    } catch (error) {
        
    }
}

const userProfile = async (req, res) => {
    try {
    let userId = req.session.user._id   
        const userData = await User.findById({_id:userId});
        if (!userData) {
          
            return res.status(404).send('User not found');
        }
        res.render("user/page-userProfile", { user: userData });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
};



module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    productViews,
    userProfile,
    generateRandomOtp
}