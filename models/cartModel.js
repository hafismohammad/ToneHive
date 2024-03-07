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
    createAt:{ type:Date, default:Date.now },
    
    totalPrice:{
        type:Number,
       
    },
    discountAmount:{
        type:Number,
    },
     
    // discountedPrice:{
    //     type:Number,
    //     required:true
    // },
    coupon:{
        type:String,
        default:null  
    },
}) 


const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart