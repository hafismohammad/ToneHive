const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user', required:true,
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',required:true,
        },
        quantity:{ type:Number, default:1 },
        price:{ type:Number, required:true }
    }],
    createAt:{ type:Date, default:Date.now }
}) 


const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart