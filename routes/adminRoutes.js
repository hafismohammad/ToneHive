const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')

const adminControllers = require("../controllers/adminController")
const customerController = require("../controllers/customerController")
const categoryControllers = require("../controllers/categoryControllers")
const productControllers = require("../controllers/productControllers")
const orderControllers = require("../controllers/orderController")
const { route } = require('./userRoutes');

// admin login
 router.get("/",adminAuth.isLogin,adminControllers.adminLogin)
 router.post("/adminLogin",adminControllers.adminPost)

// admin dashboard
//router.get("/" ,adminAuth.isLogout,adminControllers.dashboardLoad);
router.get("/dashboard",adminAuth.isLogout,adminControllers.dashboardLoad);

// customers side
router.get("/customers",customerController.customerLoad)

//router.get('/edituser',adminAuth.isLogout,customerController.edituserload)

router.get('/blockuser/:userid',customerController.blockuser);

router.get('/unblockuser/:userid',customerController.unblockuser);

// category 
router.get("/productCatrgory",adminAuth.isLogout,categoryControllers.productCatrgory)

router.post("/createCategory",categoryControllers.addProductCategory)

router.get("/editCategory",adminAuth.isLogout,categoryControllers.editCategoryLoad)

router.post("/editCategory",categoryControllers.editedCategory)



router.get("/list-Category/:catid",adminAuth.isLogout,categoryControllers.listedCategory)

router.get("/unlist-Category/:catid",adminAuth.isLogout,categoryControllers.unlistedCategory)

// product list 
router.get("/products",adminAuth.isLogout,productControllers.productsLoad)

router.get("/addproduct/",adminAuth.isLogout,productControllers.addProductLoad)

router.post('/addproduct/', productControllers.upload.array("image",4), productControllers.addProducts);

// router.get("/list-Product/:prodid",productControllers.listProducts);

// router.get("/unlist-Product/:prodid",productControllers.unlistProduts)

router.patch('/list-product/:prodid',productControllers.listOrUnlistProducts);

router.get("/editproduct/:id",adminAuth.isLogout,productControllers.editProductLoad)

router.post("/editprodut/:id",productControllers.editedProduct)

router.get("/orderDetails",adminAuth.isLogout,orderControllers.orderList)

router.post("/orderStatus",orderControllers.adminOrderStatus)

router.get("/viewProductsDetails/:id",adminAuth.isLogout,orderControllers.orderProductView)




module.exports = router