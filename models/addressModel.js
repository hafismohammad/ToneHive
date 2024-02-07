const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user', required:true,
    },
    fname: String,
    lname: String,
    mobile: Number,
    email: String,
    address: String,
    country: String,
    city: String,
    state: String,
    pincode: Number,
    
})

const AddreddModel =  mongoose.model('Address',addressSchema) 
module.exports = AddreddModel