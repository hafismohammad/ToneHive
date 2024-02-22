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
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    expiryDate: {
        type: Date, // Changed to Date type
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
    },
});

// Pre-save middleware to convert expiryDate string to Date object
couponSchema.pre('save', function(next) {
    // Check if expiryDate is a string and convert it to a Date object
    if (typeof this.expiryDate === 'string') {
        this.expiryDate = new Date(this.expiryDate);
    }
    next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

