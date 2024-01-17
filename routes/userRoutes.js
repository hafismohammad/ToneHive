const express = require('express')
const router = express.Router()
const userControllers = require("../controllers/usreControllers")


router.get("/", userControllers.loginLoad)
router.post("/", userControllers.logedUser)

router.get("/register", userControllers.registerLoad)
router.post("/register", userControllers.registeredUser)

router.get("/userHome", userControllers.homeLoad)

router.get("/logout", userControllers.userLogout)

// otp login
router.get("/verify-otp", userControllers.verifyOTPLoad)
router.post("/verify-otp", userControllers.verifiedUser)

// otp register
//router.get("/verify-otp", userControllers.verifyOTPLoad)
//router.post("/verify-otp", userControllers.verifiedUser)






module.exports = router