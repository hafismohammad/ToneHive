const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startingDate: {
        type: Date,
        required: true
    },
    endingDate: {
        type: Date,
        required: true
    },
    productOffer: {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        discount: { type: Number }
    },
    categoryOffer: {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        discount: { type: Number }
    },
    status: {
        type: Boolean,
        default: true
    },
    calculatedProductOffer: {
        type: Number,
        default: null
    }
});

offerSchema.pre("save", function (next) {
    const currentDate = new Date();
    if (currentDate > this.endingDate) {
        this.status = false; 
    }
    next();
});

const offerModel = mongoose.model('offerModel', offerSchema);
module.exports = offerModel;
