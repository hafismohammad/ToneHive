const mongoose = require("mongoose");

const categoryModel = mongoose.Schema({
    name:{
        type:String,
        unique: true,
        return:true
      
    },
    offerPrice:{
        type:Number,
        default:null
    },
   
    isList:{
        type:Boolean,
        default:false
    },

})
//module.exports = new mongoose.model("Category",categoryModel)


const Category = mongoose.model("Category", categoryModel);
 module.exports = Category
