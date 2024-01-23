const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
    name:{
        type:String,
        return:true
    },
    email:{
        type:String,
        return:true
    },
    mobile:{
        type:String,
        return:true
    },
    password:{
        type:String,
        return:true
    },
    isAdmin:{
        type:Number,
        return:true
    },
    isBlocked:{
        type:Boolean,
        default: false ,
        return:true
    },
   
    
})

const User = mongoose.model("User", userSchema);
module.exports = User;