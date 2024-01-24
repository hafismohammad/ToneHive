const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')

const adminControllers = require("../controllers/adminController")
const { route } = require('./userRoutes');

// admin dashboard
router.get("/" ,adminAuth.isLogout,adminControllers.dashboardLoad);

// customers side
router.get("/customers",adminAuth.isLogout,adminControllers.customerLoad)
router.get('/edituser',adminAuth.isLogout,adminControllers.edituserload)
router.get('/blockuser/:userid',adminControllers.blockuser);
router.get('/unblockuser/:userid',adminControllers.unblockuser);

// category 
router.get("/productCatrgory",adminControllers.productCatrgory)
router.post("/createCategory",adminControllers.addProductCategory)
router.get("/editCategory",adminControllers.editCategoryLoad)
router.post("/editCategory",adminControllers.editedCategory)
router.get("/deletecategory",adminControllers.deletecategory)
router.get("/list-Category/:catid",adminControllers.listedCategory)
router.get("/unlist-Category/:catid",adminControllers.unlistedCategory)


// product list 
router.get("/products",adminControllers.productsLoad)
router.get("/addproduct",adminControllers.addProductLoad)
router.post('/addproduct', adminControllers.upload.array("image"), adminControllers.addProducts);


















module.exports = router