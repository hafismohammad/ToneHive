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
    category:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Category',
       required:true,
        
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,  
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    discount:
    {
        type:Number,
        required:true,

    },
    offerPrice:{
        type:Number,
        default:null
    },
   
    product_status:{
        type:Boolean,
        default:true
    },
})
const Products =  mongoose.model("Products", productSchema);
module.exports = Products;