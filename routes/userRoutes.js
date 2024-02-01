const express = require('express')
const router = express.Router()
const userAuth = require('../middleware/userAuth')
const userControllers = require("../controllers/usreControllers")
const otpControllers = require("../controllers/otpControler")
const cartControllers = require("../controllers/cartControllers")
const forgottPassworControl = require("../controllers/forgottPasswordController")
const userCheckng = require('../middleware/userChecking') 




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

router.get("/userProfile",userControllers.userProfile)

// otp register
router.get("/otpRegister", otpControllers.otpRegisterLoad)

router.post("/otpRegister", otpControllers.otpRegisterPost)

// cart
router.get("/cart",cartControllers.cartLoad)

router.get("/addToCart/:id",cartControllers.addToCart)






module.exports = router