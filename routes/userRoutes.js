const express = require('express')
const router = express.Router()
const userAuth = require('../middleware/userAuth')
const userControllers = require("../controllers/usreControllers")
const otpControllers = require("../controllers/otpControler")




router.get("/",userAuth.isLogin,userControllers.loginLoad)

router.post("/", userControllers.logedUser)

router.get("/register", userAuth.isLogin,userControllers.registerLoad)

router.post("/register", userControllers.registeredUser)

router.get("/userHome",userAuth.isLogout,userControllers.homeLoad)

router.get("/logout", userControllers.userLogout)

// otp login
router.get("/verify-otp",otpControllers.verifyOTPLoad)

router.post("/verify-otp",userAuth.otpTimeOut, otpControllers.verifiedUser)

router.get("/resend-otp",otpControllers.resendOtp)

router.get("/productView/",userControllers.productViews)

// otp register
//router.get("/verify-otp", userControllers.verifyOTPLoad)
//router.post("/verify-otp", userControllers.verifiedUser)






module.exports = router