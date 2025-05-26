const express = require('express')
const router = express.Router()
const userAuth = require('../middleware/userAuth')
const userControllers = require("../controllers/userControllers")
const otpControllers = require("../controllers/otpControler")
const cartControllers = require("../controllers/cartControllers")
const forgottPassworControl = require("../controllers/forgottPasswordController")
const userCheckng = require('../middleware/userChecking') 
const setUserCart = require('../middleware/cartProdQuantity')
const checkoutControllers = require('../controllers/checkoutController')
const userProfileController= require('../controllers/userProfileController')
const couponsControllers = require("../controllers/couponsControllers")
const wishlistControllers = require("../controllers/wishlistControllers")
const shopProductsControllers = require("../controllers/shopProducts")
const walletControllers = require("../controllers/walletControllers")

router.get("/" ,userAuth.isLogin,userControllers.gustUser)

router.get("/login",userAuth.isLogin,userControllers.loginLoad)

router.post("/login", userControllers.logedUser)

// router.get("/register", userAuth.isLogin,userControllers.registerLoad)

// router.post("/register", userControllers.registeredUser)

router.route("/register")
  .get(userAuth.isLogin, userControllers.registerLoad)
  .post(userControllers.registeredUser);


router.get("/userHome",userAuth.isLogout,userControllers.homeLoad)

router.get("/logout",userAuth.isLogout, userControllers.userLogout)

// router.get("/RecoverForgottPassword",forgottPassworControl.forgotPasswordLoad)
// router.post("/RecoverForgottPassword",forgottPassworControl.forgotPasswordPost)
router.route("/RecoverForgottPassword")
  .get(forgottPassworControl.forgotPasswordLoad)
  .post(forgottPassworControl.forgotPasswordPost);

// router.get("/resetPassword/:_id/:token",forgottPassworControl.resetPasswordLoad)
// router.post("/resetPassword/:_id/:token",forgottPassworControl.resetPasswordPost)
router.route("/resetPassword/:_id/:token")
  .get(forgottPassworControl.resetPasswordLoad)
  .post(forgottPassworControl.resetPasswordPost);


// otp login
router.get("/verify-otp",userAuth.isLogout,otpControllers.verifyOTPLoad)

router.post("/verify-otp",userAuth.otpTimeOut, otpControllers.verifiedUser)

 router.get("/resend-otp1",userControllers.resendOtpNew)

router.get("/productView/",userControllers.productViews)

router.get("/userProfile",userAuth.isLogout,userProfileController.userProfile)

// router.post("/userProfileAddress",userProfileController.AddressPost)
// router.get("/userProfileAddress/:id",userAuth.isLogout,userProfileController.profileEditAddressLoad)
router.route("/userProfileAddress/:id")
  .get(userAuth.isLogout, userProfileController.profileEditAddressLoad);



router.post("/porfileAddress/:id",userProfileController.editProfileAddress)

router.post("/profileAddresspost/:id",userProfileController.profileAddressEditpost)

router.delete("/deleteAddress/:id",userProfileController.userProfileAddressDelete)

router.post("/accountDetails",userProfileController.changePassword)

// otp register
router.get("/otpRegister", otpControllers.otpRegisterLoad)

router.post("/otpRegister", otpControllers.otpRegisterPost)

// cart
router.get("/cart",userAuth.isLogout,cartControllers.cartLoad)

router.patch("/cart/:cartItemId/:productId/:delta",setUserCart.setUserCart, cartControllers.updateCartQuantity);

router.get("/addToCart/:id",userAuth.isLogout,cartControllers.addToCart)

router.delete("/removeCartItem/:id",cartControllers.removeFormCart)

// checkout
router.get("/checkout",userAuth.isLogout,checkoutControllers.checkoutLoad)

router.post("/addressPost",checkoutControllers.addAddress)

// router.get("/editAddress/:id",userAuth.isLogout,checkoutControllers.editAddressLoad)
// router.post("/editAddress/:id",checkoutControllers.edittedAddress)
router.route("/editAddress/:id")
  .get(userAuth.isLogout, checkoutControllers.editAddressLoad)
  .post(checkoutControllers.edittedAddress);


//router.delete("/deleteAddress/:id", checkoutControllers.deleteAddress);

router.post("/placeOrder",checkoutControllers.placeOrderPost)

router.get("/orderSuccess",userAuth.isLogout,checkoutControllers.orderPlace)

router.get("/viewDetails",userAuth.isLogout,userProfileController.viewOrderDetails)

router.patch("/cancelOrder/:orderId/:productId",userProfileController.orderCancel)

router.patch("/cancelAllProducts/:orderId", userProfileController.cancelAllProduct)

router.patch("/returnOrder/:orderId/:productId", userProfileController.orderReturn)

router.get("/vewProductDetails/:id",userAuth.isLogout,userAuth.isLogout,userProfileController.viewProducrDetails)

router.post("/applyCoupon", couponsControllers.applyCoupon)

router.patch("/removeCoupon/:userId/:tPrice", couponsControllers.removeCoupon)

router.get("/view-Wishlist",userAuth.isLogout,userAuth.isLogout,wishlistControllers.wishlistLoad)

router.get("/addWishlist/:id",userAuth.isLogout,wishlistControllers.addWishlist)

router.delete("/removeWishlist/:id",wishlistControllers.removeWishlist)

router.get("/shopProducts", shopProductsControllers.shopProducts)

router.get("/search", userControllers.searchProduct)

router.get("/productCategorySort",userAuth.isLogout, shopProductsControllers.sortProductCategory);

router.post("/ProductsPriceRange", shopProductsControllers.priceRange)

router.post('/createorder', checkoutControllers.createOrder)

router.post('/paymentSuccess', checkoutControllers.paymentSuccess)

// router.get("/wallet",userAuth.isLogout, walletControllers.walletLoad)

router.post("/wallet", userProfileController.walletPost)

router.get("/orderFailed", checkoutControllers.failedOrder)
// router.get("/*",userControllers.pageNotFound)

router.post("/createRazorpayOrder", userProfileController.retryPayment)

module.exports = router 