const mongoose = require("mongoose");

const categoryModel = mongoose.Schema({
    name:{
        type:String,
        unique: true,
        maxlength: 20, // Limiting the name to 20 characters
        required: true // Assuming name is required
    },
    offerPrice:{
        type:Number,
        default:null
    },
   
    isList:{
        type:Boolean,
        default:false
    }
});

const Category = mongoose.model("Category", categoryModel);
module.exports = Category;
