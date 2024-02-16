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
router.get("/verify-otp",userAuth.isLogout,otpControllers.verifyOTPLoad)

router.post("/verify-otp",userAuth.otpTimeOut, otpControllers.verifiedUser)

router.get("/resend-otp",userAuth.isLogout,otpControllers.resendOtp)

router.get("/productView/",userAuth.isLogout,userControllers.productViews)

router.get("/userProfile",userAuth.isLogout,userProfileController.userProfile)

router.post("/userProfileAddress",userProfileController.AddressPost)

router.get("/userProfileAddress/:id",userAuth.isLogout,userProfileController.profileEditAddressLoad)

router.post("/porfileAddress/:id",userProfileController.editProfileAddress)

router.post("/profileAddresspost/:id",userProfileController.profileAddressEditpost)

router.delete("/deleteAddress/:id",userProfileController.userProfileAddressDelete)

router.post("/accountDetails",userProfileController.changePassword)

// otp register
router.get("/otpRegister",userAuth.isLogout, otpControllers.otpRegisterLoad)

router.post("/otpRegister", otpControllers.otpRegisterPost)

// cart
router.get("/cart",userAuth.isLogout,cartControllers.cartLoad)

router.patch("/cart/:cartItemId/:productId/:delta",setUserCart.setUserCart, cartControllers.updateCartQuantity);

router.get("/addToCart/:id",userAuth.isLogout,cartControllers.addToCart)

router.delete("/removeCartItem/:id",cartControllers.removeFormCart)

// checkout
router.get("/checkout",userAuth.isLogout,checkoutControllers.checkoutLoad)

router.post("/addressPost",checkoutControllers.addAddress)

router.get("/editAddress/:id",userAuth.isLogout,checkoutControllers.editAddressLoad)

router.post("/editAddress/:id",checkoutControllers.edittedAddress)

//router.delete("/deleteAddress/:id", checkoutControllers.deleteAddress);

router.post("/placeOrder",checkoutControllers.placeOrderPost)

router.get("/orderSuccess",userAuth.isLogout,checkoutControllers.orderPlace)

router.get("/viewDetails",userAuth.isLogout,userProfileController.viewOrderDetails)

router.patch("/cancelOrder/:id",userProfileController.orderCancel)

router.get("/vewProductDetails/:id",userAuth.isLogout,userProfileController.viewProducrDetails)





module.exports = router 