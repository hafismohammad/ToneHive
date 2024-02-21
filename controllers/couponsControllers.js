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

const listCoupon = (req, res ) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    couponsLoad,
    addCouponLoad,
    postCoupon,
    generateCouponCode,
    listCoupon
};
