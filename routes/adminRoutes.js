const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')
const adminControllers = require("../controllers/adminController")
const customerController = require("../controllers/customerController")
const categoryControllers = require("../controllers/categoryControllers")
const productControllers = require("../controllers/productControllers")
const orderControllers = require("../controllers/orderController")
const couponsControllers = require("../controllers/couponsControllers")
const offerControllers = require("../controllers/offerControllers")
const { route } = require('./userRoutes');

// admin login
router.get("/", adminAuth.isLogin, adminControllers.adminLogin)

router.post("/adminLogin", adminControllers.adminPost)

router.get("/logoutAdmin", adminAuth.isLogout, adminControllers.userLogout)

//router.get("/" ,adminAuth.isLogout,adminControllers.dashboardLoad);
router.get("/dashboard", adminAuth.isLogout, adminControllers.dashboardLoad);

// customers side
router.get("/customers", customerController.customerLoad)

//router.get('/edituser',adminAuth.isLogout,customerController.edituserload)

router.get('/blockuser/:userid',adminAuth.isLogout, customerController.blockuser);

router.get('/unblockuser/:userid', customerController.unblockuser);

// category 
router.get("/productCatrgory", adminAuth.isLogout, categoryControllers.productCatrgory)

router.post("/createCategory", categoryControllers.addProductCategory)

router.get("/editCategory", adminAuth.isLogout, categoryControllers.editCategoryLoad)

router.post("/editCategory", categoryControllers.editedCategory)



router.get("/list-Category/:catid", adminAuth.isLogout, categoryControllers.listedCategory)

router.get("/unlist-Category/:catid", adminAuth.isLogout, categoryControllers.unlistedCategory)

// product list 
router.get("/products", adminAuth.isLogout, productControllers.productsLoad)

router.get("/addproduct/", adminAuth.isLogout, productControllers.addProductLoad)

router.post('/addproduct/', productControllers.upload.array("image", 4), productControllers.addProducts);

// router.get("/list-Product/:prodid",productControllers.listProducts);

// router.get("/unlist-Product/:prodid",productControllers.unlistProduts)

router.patch('/list-product/:prodid', productControllers.listOrUnlistProducts);

router.get("/editproduct/:id", adminAuth.isLogout, productControllers.editProductLoad)

router.post("/editprodut/:id", productControllers.editedProduct)

router.get("/orderDetails", adminAuth.isLogout, orderControllers.orderList)

router.post("/orderStatus", orderControllers.adminOrderStatus)

router.get("/viewProductsDetails/:id", adminAuth.isLogout, orderControllers.orderProductView)

router.get("/coupons", couponsControllers.couponsLoad)

router.get("/addCoupon", couponsControllers.addCouponLoad)

router.post("/addCoupon", couponsControllers.postCoupon);

router.delete("/deleteCoupon/:id", couponsControllers.deleteCoupon)

router.get("/editCoupon/:id", couponsControllers.editCouponLoad)

router.post("/editCoupon/:id", couponsControllers.editCouponPost)

router.get("/productOffer", offerControllers.productOfferLoad)

router.get("/AddOffer", offerControllers.AddOffer)

router.post("/PostOffer", offerControllers.postOffer)

router.patch("/offerStatus/:id", offerControllers.listUnlistStatus)

router.get('/editOffer/:id', offerControllers.editOffer)

module.exports = router