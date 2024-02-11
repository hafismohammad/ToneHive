const express = require('express')
const router = express.Router()
const userAuth = require('../middleware/userAuth')
const userControllers = require("../controllers/usreControllers")
const otpControllers = require("../controllers/otpControler")
const cartControllers = require("../controllers/cartControllers")
const forgottPassworControl = require("../controllers/forgottPasswordController")
const userCheckng = require('../middleware/userChecking') 
const setUserCart = require('../middleware/cartProdQuantity')
const checkoutControllers = require('../controllers/checkoutController')
const userProfileController= require('../controllers/userProfileController')



router.get("/",userAuth.isLogin,userControllers.loginLoad)

router.post("/", userControllers.logedUser)

router.get("/register", userAuth.isLogin,userControllers.registerLoad)

router.post("/register", userControllers.registeredUser)

router.get("/userHome",userAuth.isLogout,userControllers.homeLoad)

router.get("/logout", userControllers.userLogout)

// forgott password
// router.get("/forgottPassword",userAuth.isLogin,forgottPassworControl.forgottPasswordOtp)

// router.post("/forgottPassword",forgottPassworControl.forgottPasswordOtpPost)

router.get("/RecoverForgottPassword",forgottPassworControl.forgotPasswordLoad)

router.post("/RecoverForgottPassword",forgottPassworControl.forgotPasswordPost)

router.get("/resetPassword/:_id/:token",forgottPassworControl.resetPasswordLoad)
router.post("/resetPassword/:_id/:token",forgottPassworControl.resetPasswordPost)

// otp login
router.get("/verify-otp",otpControllers.verifyOTPLoad)

router.post("/verify-otp",userAuth.otpTimeOut, otpControllers.verifiedUser)

router.get("/resend-otp",otpControllers.resendOtp)

router.get("/productView/",userControllers.productViews)

router.get("/userProfile",userProfileController.userProfile)

router.post("/userProfileAddress",userProfileController.AddressPost)

//router.delete("/deleteAddress/:id",userProfileController.userProfileAddressDelete)

router.post("/changePassword",userProfileController.changePassword)

// otp register
router.get("/otpRegister", otpControllers.otpRegisterLoad)

router.post("/otpRegister", otpControllers.otpRegisterPost)

// cart
router.get("/cart",cartControllers.cartLoad)

router.patch("/cart/:cartItemId/:productId/:delta",setUserCart.setUserCart, cartControllers.updateCartQuantity);

router.get("/addToCart/:id",cartControllers.addToCart)

router.delete("/removeCartItem/:id",cartControllers.removeFormCart)

// checkout
router.get("/checkout",checkoutControllers.checkoutLoad)

router.post("/addressPost",checkoutControllers.addAddress)

router.get("/editAddress/:id",checkoutControllers.editAddressLoad)

router.post("/editAddress/:id",checkoutControllers.edittedAddress)

//router.delete("/deleteAddress/:id", checkoutControllers.deleteAddress);

router.post("/placeOrder",checkoutControllers.placeOrderPost)

router.get("/orderSuccess",checkoutControllers.orderPlace)

router.get("/viewDetails",userProfileController.viewOrderDetails)

router.patch("/cancelOrder/:id",userProfileController.orderCancel)

module.exports = router 