const { render } = require("ejs");
const User = require("../models/userModel")
const session = require("express-session");

const dashboardLoad = async (req, res) => {
    try {
       
        res.render("admin/page-adminDashboard")
    } catch (error) {
        console.log(error);
    }
}



const customerLoad = async (req, res) => {
    try {
     // const userData = await User.find({isAdmin:0})
      const userData =await User.find();
        res.render("admin/page-customers",{user:userData})
    } catch (error) {
        console.log(error);
    }
}

const edituserload = async function(req, res) {
    
    const id=req.query.userid;
    req.session.id=id
    // console.log(id)
    const userData = await User.findById({_id:id});
    res.render('admin/page-editUser',{user:userData})
}

const edituser = async function(req, res) {
    try {
        // const id = req.query.userid
        // console.log(id);
        id = req.session.id
        console.log(id);
        const name = req.body.name
        const email = req.body.email
        const updateduser = await User.findOneAndUpdate({email:email},{$set:{name:name , email:email }})

        res.redirect('/adminhome/customers')
    }
   
    catch (error) {
      console.log(error);
    }
    } 

    const deleteUser = async function(req, res) {
        try {
         const id = req.query.userid
         const deleteuser = await User.deleteOne({_id:id})
         res.redirect('/adminhome/customers')
        } catch (error) {
         console.log(error);
        }
     }
const blockuser = async (req, res) => {
    const userId = req.query.userid;
try {
    await User.findByIdAndUpdate(userId, { isBlocked: true });
    res.redirect('/adminhome/customers');
    console.log(`User blocked successfully.`);
} catch (error) {
    console.log(error);

}}

const  unblockuser = async (req, res) => {
    const userId = req.query.userid;
    try {
        console.log(`Unblocking user with ID: ${userId}`);
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.redirect('/adminhome/customers');
        console.log(`User unblocked successfully.`);

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    dashboardLoad,
    customerLoad,
    edituserload,
    edituser,
    deleteUser,
    blockuser,
    unblockuser
}