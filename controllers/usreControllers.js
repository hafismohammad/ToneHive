const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');
const Products=require('../models/productModel')
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
        }])
        

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
    } else if (req.session.admin) {
        res.redirect("/adminhome")//?
    } else {
        res.render("user/page-login")
    }
};

const logedUser = async (req, res) => {
    const logEmail = req.body.email;
    const logPassword = req.body.password;
    try {

        const logedUser = await User.findOne({
            email: logEmail
        });
        const id = logedUser._id

        if (logedUser) {
            const comparePass = await bcrypt.compare(logPassword, logedUser.password);
            if (comparePass) {
                console.log(req.body);
                if (logedUser.isAdmin === 1) {
                    req.session.admin = id
                    res.redirect("/adminhome")
                } else if(logedUser.isBlocked==false){
                    req.session.user = id
                    res.redirect("/verify-otp")
                }else{
                    console.log("This user not exist");
                    res.redirect("/",{error: "This user not exist"})
                }

            } else {
                res.render("user/page-login", { error: "Failed to login" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}
const registerLoad = (req, res) => {
    if (req.session.user) {
        res.redirect("/page-userHome");
    } else if (req.session.admin) {
        res.redirect("/page-adminHome")
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
            isAdmin: 0,
        }
        const result = await User.create(userIn);
        if (result) {
            res.render("user/page-login", { message: "Registered succesfully" })
        }

    } catch (error) {
        console.log(error);
        res.render("user/page-register", { message: "Registration failed" })
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

module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    productViews
}