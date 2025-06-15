const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    discount: {
        type: Number, // percentage (e.g., 10 means 10%)
        required: true,
        min: 0,
        max: 100 
    },
    maxDiscountAmount: {
        type: Number, // e.g., max ₹3000 off
        required: true
    },
    minPurchaseAmount: {
        type: Number, // e.g., minimum ₹2000 required
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        }
    ],
    isActive: {
        type: String,
        enum: ['Active', 'Expired'],
        default: 'Active'
    }
});

// Optional: ensure startDate and expiryDate are stored as Date
couponSchema.pre('save', function(next) {
    if (typeof this.expiryDate === 'string') {
        this.expiryDate = new Date(this.expiryDate);
    }
    if (typeof this.startDate === 'string') {
        this.startDate = new Date(this.startDate);
    }
    next();
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;




