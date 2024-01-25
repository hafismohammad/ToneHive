const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')

const adminControllers = require("../controllers/adminController")
const customerController = require("../controllers/customerController")
const categoryControllers = require("../controllers/categoryControllers")
const productControllers = require("../controllers/productControllers")
const { route } = require('./userRoutes');




// admin dashboard
router.get("/" ,adminAuth.isLogout,adminControllers.dashboardLoad);

// customers side
router.get("/customers",adminAuth.isLogout,customerController.customerLoad)

router.get('/edituser',adminAuth.isLogout,customerController.edituserload)

router.get('/blockuser/:userid',customerController.blockuser);

router.get('/unblockuser/:userid',customerController.unblockuser);

// category 
router.get("/productCatrgory",categoryControllers.productCatrgory)

router.post("/createCategory",categoryControllers.addProductCategory)

router.get("/editCategory",categoryControllers.editCategoryLoad)

router.post("/editCategory",categoryControllers.editedCategory)

router.get("/deletecategory",categoryControllers.deletecategory)

router.get("/list-Category/:catid",categoryControllers.listedCategory)

router.get("/unlist-Category/:catid",categoryControllers.unlistedCategory)

// product list 
router.get("/products",productControllers.productsLoad)

router.get("/addproduct",productControllers.addProductLoad)

router.post('/addproduct', productControllers.upload.array("image"), productControllers.addProducts);

// router.get("/list-Product/:prodid",productControllers.listProducts);

// router.get("/unlist-Product/:prodid",productControllers.unlistProduts)

router.patch('/list-product/:prodid',productControllers.listOrUnlistProducts);

router.get("/editproduct/:id",productControllers.editProductLoad)

router.post("/editprodut",productControllers.editedProduct)



















module.exports = router