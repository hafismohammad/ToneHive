const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({

   name:{
        type:String,
        required:true
    },
    description:{
        type:String,
       //   required:true
    },
    category_id:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'category',
        
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Intl,  
        required:true
    },
    image:[{
        type:String,
    }],
    discount:{
        type:String,
    },
    product_status:{
        type:Boolean,
        default:true
    },
})
const Products =  mongoose.model("Products", productSchema);
module.exports = Products;