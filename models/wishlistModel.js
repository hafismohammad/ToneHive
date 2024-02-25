const mongoose = require("mongoose")
const wishlistSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user' ,required:true
    },
    products:[
        {
            productItems:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'product', required:true,unique: true 
            }
        },
        
    ]
},
{
    timestamps:true
})

const wishlistModel = mongoose.model('wishlistModel',wishlistSchema)
module.exports = wishlistModel 