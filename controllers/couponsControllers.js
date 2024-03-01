const { create } = require("../models/userModel");
const couponModel = require("../models/couponModel")
const Cart = require('../models/cartModel')

// couponsControllers.js
const couponsLoad = async (req, res) => {
    try {
        const message = req.query.message
        const couponData = await couponModel.find()
        res.render("admin/page-coupons", { couponData: couponData, message: message });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const addCouponLoad = (req, res) => {
    try {

        res.render("admin/page-addCoupon")

    } catch (error) {
        console.log(error);
    }
}
// const generateCouponCode = () => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let code = '';
//     for (let i = 0; i < 6; i++) {
//         code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return code;
// };

const voucher = require('voucher-code-generator');
const { render } = require("ejs");

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

        // Redirect the user after successfully creating the coupon
        res.redirect("/admin/coupons?message=Coupon added successfully");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { usedBy, totalCartPrice, couponCode } = req.body;

        const coupon = await couponModel.findOne({ code: couponCode });

        if (coupon && coupon.isActive === 'Active') {
            if (!coupon.usedBy.includes(userId)) {
                let cart = await Cart.findOne({ userId: userId });


                if (cart.coupon !== null) {
                    res.redirect("/checkout?message=One or more items in the cart already have a coupon applied");
                    return; // Exit the function early
                }
                

             
                const discountAmount = (cart.totalPrice * coupon.discount) / 100;
                console.log(cart);
             
                const discountedPrice = cart.totalPrice - discountAmount;

                cart.totalPrice = discountedPrice;

                cart.coupon = couponCode;
                
                await cart.save();

                coupon.usedBy.push(userId);
                await coupon.save();

                res.redirect("/checkout?success=Coupon applied successfully");
            } else {
                res.redirect("/checkout?message=This coupon is already used");
            }
        } else {
            res.redirect("/checkout?message=Coupon is not active or invalid");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}


const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.id;
        const coupon = await couponModel.findByIdAndDelete(couponId);
        if (coupon) {
            // Coupon was found and deleted successfully
            res.status(200).json({ message: 'Coupon deleted successfully' });
        } else {
            // Coupon with the provided ID was not found
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

   const editCouponLoad = async (req, res) => {
    try {
        const couponId = req.params.id;
        const couponData = await couponModel.findById({_id:couponId})
        
        res.render("admin/page-editCoupon",{couponData:couponData}); 
    } catch (error) {
        console.log(error);
    }
};
const editCouponPost = async (req, res) => {
    try {
        const couponId = req.params.id;
        console.log('couponId', couponId);
        const { name, discount, expiryDate } = req.body;
        

        const updatedCoupon = await couponModel.findByIdAndUpdate(couponId, { name, discount, expiryDate }, { new: true });

        if (!updatedCoupon) {
            
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.redirect("/admin/coupons?message=Coupon updated successfully")
     
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    couponsLoad,
    addCouponLoad,
    postCoupon,
    //generateCouponCode,
    applyCoupon,
    deleteCoupon,
    editCouponLoad,
    editCouponPost
};
