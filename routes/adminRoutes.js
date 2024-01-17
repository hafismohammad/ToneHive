const express = require('express')
const router = express.Router()
const adminControllers = require("../controllers/adminController")


router.get("/", adminControllers.dashboardLoad);
// router.put("/",adminControllers)

router.get("/customers", adminControllers.customerLoad)

router.get('/edituser', adminControllers.edituserload)
router.post('/edituser', adminControllers.edituser)

router.get('/deleteuser', adminControllers.deleteUser)

router.get('/blockuser', adminControllers.blockuser)
router.get('/unblockuser', adminControllers.unblockuser)













module.exports = router