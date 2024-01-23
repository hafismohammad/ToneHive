const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({

   product_name:{
        type:String,
        required:true
    },
    product_description:{
        type:String,
       //   required:true
    },
    product_catagory_id:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Categry',
        
    },
    product_price:{
        type:Number,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    quantity:{
        type:Intl,  
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    image:[{
        type:String,
        required:true
    }],
    reviews:{
        type:Object,
        required:true
    }
})

module.exports = mongoose.model("product", productSchema);