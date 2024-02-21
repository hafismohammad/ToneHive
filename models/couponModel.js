const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
    code : {
        type : String,
        require : true,
        unique : true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    expiryDate: {
        type: Date,
        required: true
    }
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
