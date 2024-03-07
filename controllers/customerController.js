const User = require("../models/userModel")


const customerLoad = async (req, res) => {
    try {
        const pages = req.query.page || 1
        const size = 5
        const pageSkip = (pages-1)*size
        const orderCount = await User.find().count()
        const numOfPages = Math.ceil(orderCount/size)
        const userData = await User.find().skip(pageSkip).limit(size)

        const currentPage = parseInt(pages,10)
        res.render("admin/page-customers", { user: userData,numOfPages,currentPage })
    } catch (error) {
        console.log(error);
    }
}

// const edituserload = async function (req, res) {

//     const id = req.query.userid;
//     req.session.id = id
//     // console.log(id)
//     const userData = await User.findById({ _id: id });
//     res.render('admin/page-editUser', { user: userData })
// }

const blockuser = async (req, res) => {
    const userId = req.params.userid;
    console.log(userId);
    try {
     const user = await User.findById(userId);
     user.isBlocked=!user.isBlocked;
     await user.save()
        if(user.isBlocked){
           
             delete req.session.user 
        }
        res.json({ success: true });
        // console.log(`User blocked successfully.`);
        
    } catch (error) {
        console.log(error);

    }
}

const unblockuser = async (req, res) => {
    const userId = req.params.userid;
    try {
        console.log(`Unblocking user with ID: ${userId}`);
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.json({ success: true });
        // console.log(`User unblocked successfully.`);

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    customerLoad,
   // edituserload,
    blockuser,
    unblockuser
}