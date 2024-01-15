const { render } = require("ejs");
const User = require("../models/userModel")
const bcrypt = require("bcrypt");
const session = require("express-session");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash

    } catch (error) {
        console.log(error);
    }
}

const homeLoad = (req, res) => {
    try {
        if(req.session.user){
            res.render("user/page-userHome")
        }else{
            redirect("/")
        }    
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const loginLoad = function(req, res) {
    if(req.session.user) {
      res.redirect("/userHome");
    }else if(req.session.admin) {
      res.redirect("/")
    } else {
      res.render("user/page-login")
    }
  };

const logedUser = async (req, res) => {
    const logEmail = req.body.email;
    const logPassword = req.body.password;
    try {

        const logedUser = await User.findOne({
            email: logEmail
        });
        const id = logedUser._id

        if (logedUser) {
            const comparePass = await bcrypt.compare(logPassword, logedUser.password);
            if (comparePass) {
                console.log(req.body);
                if (logedUser.isAdmin === 1) {
                    req.session.admin=id
                    res.redirect("/page-adminHome")
                } else {
                    req.session.user=id
                    res.redirect("/verify-otp")
                }

            } else {
                res.render("user/page-login", { error: "Failed to login" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}


const registerLoad = (req, res) => {
    if (req.session.user) {
        res.redirect("/page-userHome");
    } else if (req.session.admin) {
        res.redirect("/page-adminHome")
    } else {
        res.render("user/page-register")
    }
}
const registeredUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        // console.log(req.body);
        const userIn = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            isAdmin: 0,
        }
        const result = await User.create(userIn);
        if (result) {
            res.render("user/page-login", { message: "Registered succesfully" })
        }

    } catch (error) {
        console.log(error);
        res.render("user/page-register", { message: "Registration failed" })
    }
}

const userLogout = (req, res) => {
    if (req.session.user || req.session.admin) {
        req.session.destroy((error) => {
            if (error) {
                res.redirect("/userhome")               
            }else{
                res.redirect('/')
            }
        })
    } else {
        res.redirect("/userhome")
    }
}

const verifyOTPLoad = (req, res) => {
    try {
       res.render("user/page-verify-otp")
    } catch (error) {
        console.log(error);
    }
} 


module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    verifyOTPLoad
}