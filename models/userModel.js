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
    isAdmin:{
        type:Number,
        required:true,
    },
    isBlocked:{
        type:Boolean,
        default: false ,  
    },
    // verified: {
    //     type: Boolean,
    //     default: false 
    // }  
})

const User = mongoose.model("User", userSchema);
module.exports = User;