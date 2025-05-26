const { create } = require("../models/userModel");
const couponModel = require("../models/couponModel")
const Cart = require('../models/cartModel')

// couponsControllers.js
const couponsLoad = async (req, res) => {
    try {
        const pages = req.query.page || 1
        const size = 5
        const pageSkip = (pages-1)*size
        const message = req.query.message
        const orderCount = await couponModel.find().count()
        const numOfPages = Math.ceil(orderCount/size)
        const couponData = await couponModel.find().skip(pageSkip).limit(size)
        const currentPage = parseInt(pages,10)
        res.render("admin/page-coupons", { couponData: couponData, message: message,numOfPages,currentPage });
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
const Order = require("../models/orderModel");
const offerModel = require("../models/offerModel");

// const postCoupon = async (req, res) => {
//     try {
//         const { name, discount, expiryDate } = req.body;

//         // Generate a unique coupon code
//         const code = voucher.generate({ length: 6, count: 1 })[0];

//         // Create the coupon with the generated code
//         const createCoupon = await couponModel.create({
//             name,
//             discount,
//             expiryDate,
//             code
//         });

//         // Redirect the user after successfully creating the coupon
//         res.redirect("/admin/coupons?message=Coupon added successfully");
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const postCoupon = async (req, res) => {
    try {
        const { name, discount, expiryDate, startDate, maxDiscountAmount, minPurchaseAmount } = req.body;

        // Generate a unique coupon code
        const code = voucher.generate({ length: 6, count: 1 })[0];

        // Create the coupon with all required fields
        const createCoupon = await couponModel.create({
            name,
            discount,
            expiryDate,
            startDate,
            maxDiscountAmount,
            minPurchaseAmount,
            code
        });

        res.redirect("/admin/coupons?message=Coupon added successfully");
    } catch (error) {
        console.log("Error adding coupon:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// const applyCoupon = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const { totalCartPrice, couponCode } = req.body;
//         const coupon = await couponModel.findOne({ code: couponCode });

//         if (coupon && coupon.isActive === 'Active') {
//             const isCouponUsed = coupon.usedBy.includes(userId);

//             if (!isCouponUsed) {
//                 let cart = await Cart.findOne({ userId: userId });
                
//                 if (cart) {
//                     const discountAmount = (totalCartPrice * coupon.discount) / 100;
//                     const discountedPrice = totalCartPrice - discountAmount;
//                     cart.totalPrice = discountedPrice;
//                     cart.discountAmount = discountAmount;
//                     cart.coupon = couponCode;
                   
//                     await cart.save();

//                     coupon.usedBy.push(userId);
//                     await coupon.save();
//                     res.json({ success: "Coupon applied successfully" });
//                 } else {
//                     res.status(404).redirect("/checkout?message=Cart not found for the user");
//                 }
//             } else {
//                 res.json({ message: "This coupon is already used" });
//             }
//         } else {
//             res.status(400).redirect("/checkout?message=Coupon is not active or invalid");
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: false, message: "Internal server error" });
//     }
// }

const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { totalCartPrice, couponId } = req.body;

        console.log("Applying coupon ID:", couponId, "for user:", userId);

        // Find coupon by ID
        const coupon = await couponModel.findById(couponId);
        console.log("Coupon details:", coupon);

        if (!coupon) {
            return res.status(400).json({ message: "Coupon not found" });
        }

        if (coupon.isActive !== 'Active') {
            return res.status(400).json({ message: "Coupon is not active" });
        }

        const isCouponUsed = coupon.usedBy.some(id => id.toString() === userId);
        console.log("Has user used this coupon before?", isCouponUsed);

        if (isCouponUsed) {
            return res.status(400).json({ message: "This coupon has already been used" });
        }

        // Optional: Minimum purchase amount check
        if (totalCartPrice < coupon.minPurchaseAmount) {
            return res.status(400).json({ 
                message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}` 
            });
        }

        const cart = await Cart.findOne({ userId });
        console.log("User cart:", cart);

        if (!cart) {
            return res.status(404).json({ message: "Cart not found for the user" });
        }

        // Calculate discount
        let discountAmount = (totalCartPrice * coupon.discount) / 100;
        if (discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }

        const discountedPrice = totalCartPrice - discountAmount;

        // Update cart with discount details
        cart.totalPrice = discountedPrice;
        cart.discountAmount = discountAmount;
        cart.coupon = coupon.code;
        cart.couponId = coupon._id; // ✅ Now storing couponId
        await cart.save();

        // Mark coupon as used by this user
        coupon.usedBy.push(userId);
        await coupon.save();

        console.log(`Coupon ${coupon.code} applied. Discount: ₹${discountAmount}. New total: ₹${discountedPrice}`);

        return res.json({ 
            success: "Coupon applied successfully",
            discountedPrice,
            discountAmount,
            couponCode: coupon.code
        });

    } catch (error) {
        console.error("Apply coupon error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const removeCoupon = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartTotalPrice = req.params.tPrice;

        const userCart = await Cart.findOne({ userId: userId });

        if (!userCart) {
            return res.status(404).json({ error: 'User cart not found.' });
        }
        const oldPrice = userCart.totalPrice + userCart.discountAmount;

        await Cart.findOneAndUpdate(
            { userId: userId },
            { $set: { totalPrice: oldPrice }, $unset: { discountAmount: 1, coupon: 1 } }
        );

        await couponModel.findOneAndUpdate(
            { code: userCart.coupon },
            { $pull: { usedBy: userId } }
        );

        return res.status(200).json({ message: 'Coupon removed successfully.', oldPrice: oldPrice });
    } catch (error) {
        console.error(error);
        // Handle any unexpected errors and send an error response
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


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
// const editCouponPost = async (req, res) => {
//     try {
//         const couponId = req.params.id;
//         console.log('couponId', couponId);
//         const { name, discount, expiryDate } = req.body;
        

//         const updatedCoupon = await couponModel.findByIdAndUpdate(couponId, { name, discount, expiryDate }, { new: true });

//         if (!updatedCoupon) {
            
//             return res.status(404).json({ error: "Coupon not found" });
//         }

//         res.redirect("/admin/coupons?message=Coupon updated successfully")
     
//     } catch (error) {

//         console.error(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


const editCouponPost = async (req, res) => {
  try {
    const couponId = req.params.id;
    const {
      name,
      discount,
      maxDiscountAmount,
      minPurchaseAmount,
      startDate,
      expiryDate,
    } = req.body;

    // Prepare update data, converting fields as necessary
    const updateData = {
      name: name.trim(),
      discount: Number(discount),
      maxDiscountAmount: Number(maxDiscountAmount),
      minPurchaseAmount: Number(minPurchaseAmount),
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
    };

    // Update coupon by ID
    const updatedCoupon = await couponModel.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Redirect with success message
    res.redirect("/admin/coupons?message=Coupon updated successfully");
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
    editCouponPost,
    removeCoupon
};
