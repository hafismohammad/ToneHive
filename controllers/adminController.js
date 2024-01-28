const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const multer = require('multer');
const session = require("express-session");
const { set } = require("mongoose");

//const categoryHelper = require("../helpers/categoryHelper")

const dashboardLoad = async (req, res) => {
    try {

        res.render("admin/page-adminDashboard")
    } catch (error) {
        console.log(error);
    }
}








module.exports = {
    dashboardLoad,
   
}