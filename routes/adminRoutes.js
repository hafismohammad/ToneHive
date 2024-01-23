const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userStatus = require('../middleware/userChecking')
const adminControllers = require("../controllers/adminController")
const { route } = require('./userRoutes');


router.get("/", adminControllers.dashboardLoad);
// router.put("/",adminControllers)

router.get("/customers",adminControllers.customerLoad)

router.get('/edituser',adminAuth.isLogout,adminControllers.edituserload)
router.post('/edituser', adminControllers.edituser)

router.get('/deleteuser', adminAuth.isLogout,adminControllers.deleteUser)

router.get('/blockuser', adminControllers.blockuser)
router.get('/unblockuser', adminControllers.unblockuser)













module.exports = router