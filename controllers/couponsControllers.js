const { create } = require("../models/userModel");
const couponModel = require("../models/couponModel")

// couponsControllers.js
const couponsLoad = async (req, res) => {
    try {
        const couponData = await couponModel.find()
        res.render("admin/page-coupons",{couponData:couponData});
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const addCouponLoad =  (req, res) => {
    try {
   
        res.render("admin/page-addCoupon")
        
    } catch (error) {
        console.log(error);
    }
}
const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

const voucher = require('voucher-code-generator');

const postCoupon = async (req, res) => {
    try {
        const { name, discount, expiryDate } = req.body;

        // Generate a unique coupon code
        const code = voucher.generate({ length: 6, count: 1 })[0];

        // Create the coupon with the generated code
        const createCoupon = await couponModel.create({
            name,
            discount,
            expiryDate,
            code
        });

        res.status(201).json({ coupon: createCoupon });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming you have user information stored in req.session.user
        const { totalCartPrice, couponCode } = req.body; // Assuming totalCartPrice and couponCode are sent in the request body
        console.log(totalCartPrice, couponCode);
        
        // Call the applyCoupon function with userId and couponCode
        const result = await couponModel(userId, couponCode); // Assuming applyCouponLogic is the correct function to call

        // You can access the discount and cart properties from the result
        const { discount, cart, status, message } = result;

        // Send the response back to the client
        res.json({ discount, newTotalCartPrice: cart.totalAmount, status, message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}

module.exports = {
    couponsLoad,
    addCouponLoad,
    postCoupon,
    generateCouponCode,
    applyCoupon
};
