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
        
        if(req.session.admin){
            res.redirect("admin/dashboard")
        }else{
            const error = req.query.error
            res.render("admin/page-adminLogin",{error:error})
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
const getChartDetails = async () => {
    try {
        const orders = await Order.aggregate([
            {
                $match: { orderStatus: 'delivered' }
            },
            {
                $project: {
                    _id: 0,
                    orderDate: "$createdAt"
                }
            }
        ]);

        let monthlyData = Array(12).fill(0); // Initialize monthly data array with zeros for each month
        let dailyData = Array(7).fill(0); // Initialize daily data array with zeros for each day of the week

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Convert to monthly order array
        orders.forEach((order) => {
            const date = new Date(order.orderDate);
            const month = date.getMonth(); // Get the month index

            // Count the number of orders in each month
            monthlyData[month] += 1;
        });

        // Convert to daily order array
        orders.forEach((order) => {
            const date = new Date(order.orderDate);
            const dayOfWeek = date.getDay(); // Get the day of the week index

            // Count the number of orders on each day of the week
            dailyData[dayOfWeek] += 1;
        });

        // Return the monthlyData and dailyData
        return { monthlyData, dailyData };
    } catch (error) {
        // Handle errors
        console.error("Error in getChartDetails:", error);
        throw error;
    }
};

const getDashboardDetails = async () => {
    try {
        let response = {};
        let revenueTotal, revenueMonthly, totalProducts;

        revenueTotal = await Order.aggregate([
            {
                $match: { orderStatus: 'delivered' }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        response.revenueTotal = revenueTotal[0]?.revenue;

        revenueMonthly = await Order.aggregate([
            {
                $match: {
                    orderStatus: 'delivered',
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        response.revenueMonthly = revenueMonthly[0]?.revenue;

        totalProducts = await Products.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toInt: "$product_quantity" } } // Sum the converted product_quantity values
                }
            }
        ]);

        response.totalProducts = totalProducts[0]?.total;

        response.totalOrders = await Order.find({ orderStatus: 'confirmed' }).count();

        response.numberOfCategories = await Category.find({}).count();

        return response;
    } catch (error) {
        console.error("Error in getDashboardDetails:", error);
        throw error;
    }
};

const dashboardLoad = async (req, res) => {
    try {
        // Call the getChartDetails function to retrieve chart data
        const { monthlyData, dailyData } = await getChartDetails();

        // Call the getDashboardDetails function to retrieve other dashboard details
        const dashboardDetails = await getDashboardDetails();

        // Retrieve other necessary data
        const salesDetails = await Order.find();
        const products = await Products.find();
        const category = await Category.find();

        // Render the dashboard template with the retrieved data
        res.render("admin/page-adminDashboard", {
            salesDetails: salesDetails,
            products: products,
            category: category,
            monthlyData: monthlyData,
            dailyData: dailyData,
            orderStatus: dashboardDetails.orderStatus,
            chartData: dashboardDetails.chartData,
            dashboardDetails: dashboardDetails.dashboardData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};





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




// const pageNotFound = (req, res) => {
//     try {
        
//      res.render('admin/page-404')
//     } catch (error) {
//         console.log(error);
//     }
// }


module.exports = {
    dashboardLoad,
    adminLogin,
    adminPost,
    userLogout,
    getChartDetails,
  //  pageNotFound
   
}