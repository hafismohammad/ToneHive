const User = require("../models/userModel")


const customerLoad = async (req, res) => {
    try {
        const userData = await User.find({ isAdmin: 0 });
        res.render("admin/page-customers", { user: userData })
    } catch (error) {
        console.log(error);
    }
}

const edituserload = async function (req, res) {

    const id = req.query.userid;
    req.session.id = id
    // console.log(id)
    const userData = await User.findById({ _id: id });
    res.render('admin/page-editUser', { user: userData })
}

const blockuser = async (req, res) => {
    const userId = req.params.userid;
    console.log(userId);
    try {
        await User.findByIdAndUpdate(userId, { $set: { isBlocked: true } });
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
    edituserload,
    blockuser,
    unblockuser
}