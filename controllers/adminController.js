const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const Admins = require('../models/adminModel')
const multer = require('multer');
const session = require("express-session");
const { set } = require("mongoose");
const Order = require("../models/orderModel");



//const categoryHelper = require("../helpers/categoryHelper")
//admin login 
const adminLogin = (req, res) => {
    try {

        if (req.session.admin) {
            res.redirect("admin/dashboard")
        } else {
            const error = req.query.error
            res.render("admin/page-adminLogin", { error: error })
        }
    } catch (error) {
        console.log(error);
    }
}
const adminPost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminData = await Admins.findOne({ email: email });

        if (adminData) {

            if (adminData.password === password) {
                req.session.admin = adminData;
                res.redirect("/admin/dashboard");
            } else {

                res.redirect('/admin?error=Incorrect password');
            }
        } else {

            res.redirect('/admin?error=Email not found');
        }
    } catch (error) {
        console.log(error);

        res.redirect('/admin?error=An error occurred');
    }
}

const dashboardLoad = async (req, res) => {
    try {
        // Fetch all orders
        const salesDetails = await Order.find();

        // Fetch all products and categories
        const products = await Products.find();
        const categories = await Category.find();

        // Aggregate to find the top selling products
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$products" }, // Split orders into individual products
            { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } }, // Group by productId and sum quantities
            { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
            { $limit: 10 } // Limit to top 10 products
        ]);

        // Extract product IDs of top selling products
        const productIds = topSellingProducts.map(product => product._id);

        // Fetch details of top selling products
        const productsData = await Products.find({ _id: { $in: productIds } }, { name: 1, image: 1 });

        // Aggregate to find the top selling categories
        const topSellingCategories = await Order.aggregate([
            { $unwind: "$products" }, // Split orders into individual products
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product"
                }
            }, // Lookup products collection to get product details
            { $unwind: "$product" }, // Unwind the product array
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            }, // Lookup categories collection to get category details
            { $unwind: "$category" }, // Unwind the category array
            { $group: { _id: "$category._id", totalQuantity: { $sum: "$products.quantity" } } }, // Group by categoryId and sum quantities
            { $sort: { totalQuantity: -1 } }, // Sort by total quantity descending
            { $limit: 10 } // Limit to top 10 categories
        ]);

        // Fetch details of the top selling categories
        const topSellingCategoriesData = await Category.find({ _id: { $in: topSellingCategories.map(cat => cat._id) } });
console.log(topSellingCategoriesData);
        res.render("admin/page-adminDashboard", {
            salesDetails: salesDetails,
            products: products,
            categories: categories, // Pass categories to the rendering context
            productsData: productsData,
            topSellingCategories: topSellingCategoriesData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



const showChart = async (req, res) => {
    try {
        const cartData = await Order.find()
        res.render('admin/page-adminDashboard', { cartData: JSON.stringify(cartData) })
    } catch (error) {
        console.log(error);
    }
}



const userLogout = (req, res) => {
    if (req.session.user || req.session.admin) {
        req.session.destroy((error) => {
            if (error) {
                res.redirect("/dashboard")
            } else {
                res.redirect('/admin')
            }
        })
    } else {
        res.redirect("/admin")
    }
}






module.exports = {
    dashboardLoad,
    adminLogin,
    adminPost,
    userLogout,
    showChart
    //  pageNotFound

}