const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    address: [{
        name: { type: String },
        house: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: Number } ,
        mobile: { type: Number }
    }],
  
    isBlocked:{
        type:Boolean,
        default: false ,  
    },
   
})

const User = mongoose.model("User", userSchema);
module.exports = User;