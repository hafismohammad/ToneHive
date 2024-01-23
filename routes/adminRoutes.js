const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')
const adminControllers = require("../controllers/adminController")
const { route } = require('./userRoutes');


router.get("/" ,adminAuth.isLogout,adminControllers.dashboardLoad);
// router.put("/",adminControllers)


// customers side
router.get("/customers",adminAuth.isLogout,adminControllers.customerLoad)
router.get('/edituser',adminAuth.isLogout,adminControllers.edituserload)
router.post('/edituser',adminControllers.edituser)
router.get('/deleteuser',adminAuth.isLogout,adminControllers.deleteUser)
router.get('/blockuser/:userid',adminControllers.blockuser);
router.get('/unblockuser/:userid',adminControllers.unblockuser);

// category 
router.get("/productCatrgory",adminControllers.productCatrgory)
router.post("/createCategory",adminControllers.addProductCategory)
router.get("/editCategory",adminControllers.editCategoryLoad)
router.post("/editCategory",adminControllers.editedCategory)
router.get("/deletecategory",adminControllers.deletecategory)
router.get("/listedcategory/:catid",adminControllers.listedCategory)
router.get("/unlistedcategory/:catid",adminControllers.unlistedCategory)


// product list 
router.get("/products", adminControllers.productsLoad)

















module.exports = router