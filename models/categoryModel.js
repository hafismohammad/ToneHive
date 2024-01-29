const mongoose = require("mongoose");

const categoryModel = mongoose.Schema({
    name:{
        type:String,
        unique: true,
        return:true
      
    },
  
 
    isList:{
        type:Boolean,
        default:true
    },

})
//module.exports = new mongoose.model("Category",categoryModel)


const Category = mongoose.model("Category", categoryModel);
 module.exports = Category
