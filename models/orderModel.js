const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        name: { type: String },
        house: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: Number } ,
        mobile: { type: String  }
    },
    paymentMethod: {
        type: String,
        required: true
    },
    products: [{
       productId: {
        type:mongoose.Types.ObjectId,
        ref: 'Products'
       },
       quantity: {
        type:Number,
       },
       productPrice: {
        type : Number
       }
    }],
    
    totalPrice: {
        type: Number,
        required: true
    },
    coupon:{
        type: Number,
        default: 0 
    },
    orderStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'shipped',
            'outForDelivery',
            'delivered',
            'cancelled',
            'return pending',
            'returned',
        ],
        default: 'pending',
    },
    createdAt: {
        type: Date,
    
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
