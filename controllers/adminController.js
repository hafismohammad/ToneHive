const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const Admins = require('../models/adminModel')
const multer = require('multer');
const session = require("express-session");
const { set } = require("mongoose");

//const categoryHelper = require("../helpers/categoryHelper")
//admin login 
const adminLogin = (req, res) => {
    try {
        if(req.session.admin){
            res.redirect("admin/dashboard")
        }else{
            res.render("admin/page-adminLogin")
        }
    } catch (error) {
        console.log(error);
    }
}
const adminPost= async (req, res) => {
    try {
        const {email, password } = req.body
        
        const adminData = await Admins.findOne({ email: email });
      
        console.log('admin dataaaa', adminData);
        if (adminData && adminData.password === password) {
            req.session.admin = adminData;
            res.render("admin/page-adminDashboard");
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error);
    }
}

const dashboardLoad = async (req, res) => {
    try {
   
        res.render("admin/page-adminDashboard")
    } catch (error) {
        console.log(error);
    }
}










module.exports = {
    dashboardLoad,
    adminLogin,
    adminPost
   
}