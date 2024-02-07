const AddreddModel = require('../models/addressModel');
const addressModel = require('../models/addressModel')
const User = require('../models/userModel')


const checkoutLoad = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
           
            throw new Error('User ID not found in session');
        }
        const userId = req.session.user._id

        const userAddress = await addressModel.aggregate([{
            $match:{userId:userId}
        }])
   
        res.render("user/page-checkout",{userId:userId,userAddress:userAddress})
    } catch (error) {
        console.log(error);
    }
}

const addAddress = async (req, res) => {
    try {
       
        const {
            fname,
            lname,
            mobile,
            email,
            address,
            country,
            state,
            city,
            pincode,
            userId
        } = req.body

        const getAddress = {
            fname:fname, lname:lname, mobile:mobile,
            email:email, address:address,country:country, 
            state:state, city:city, pincode:pincode, userId:userId       
        }

        const findAddress = await addressModel.findOne({email:email})
        const saveAddress = await addressModel.create(getAddress)

        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}

const editAddressLoad = async (req, res) => {
    try {

    const id = req.params._id;
console.log(id);
        const userAddress = await AddreddModel.find({_id:id})

       res.render("user/page-editAddress",{userAddress, addressId:userAddress._id})
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    checkoutLoad,
    addAddress,
    editAddressLoad
}