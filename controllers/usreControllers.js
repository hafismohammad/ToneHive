const { render } = require("ejs");
const User = require("../models/userModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');

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
        if (req.session.user) {
            res.render("user/page-userHome")
        } else {
            redirect("/")
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const loginLoad = function (req, res) {
    if (req.session.user) {
        res.redirect("/userHome");
    } else if (req.session.admin) {
        res.redirect("/")//?
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
                    req.session.admin = id
                    res.redirect("/adminhome")
                } else {
                    req.session.user = id
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
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect("/userhome")
    }
}


// Generate a random OTP
function generateRandomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create an email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hafismhdthaleekara764@gmail.com',
        pass: 'ofzx kkgh klon lnht',
    },
});

// Send OTP email


const verifyOTPLoad = async (req, res) => {
    try {
        
        // Generate a random OTP
        const otp = generateRandomOtp();
        const uOtp = otp;

        req.session.otp = otp;

        //   setTimeout(() => {
        //     console.log("OTP Expired" + req.session.otp);
        //     req.session.destroy()
        //     if (req.session){
        //      console.log(req.session.otp);
        //     }
        // },20000)
        

        const userData = await User.findOne({ _id: req.session.user });
        const email = userData.email;
        


        function sendOtpEmail(email, uOtp) {
            const mailOptions = {
                from: 'hafismhdthaleekara764@gmail.com',
                to: email,
                subject: 'OTP Verification',
                text: `Your OTP is: ${uOtp}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending OTP email:', error.message);
                } else {
                    console.log('OTP email sent:', info.response);
                }
            });
        }
      


        // Send the OTP to the user's email
        sendOtpEmail(email, uOtp);

        // Render the "user/page-verify-otp" page with necessary data
        res.render("user/page-verify-otp", { email });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}



const verifiedUser = async (req, res) => {
    try {
        const userEnteredOtp = req.body.otp;
        console.log(userEnteredOtp);
        
       const user = await User.findOne(req.session.email)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (userEnteredOtp === req.session.otp) {
  
           res.redirect("/userHome"); // Pass user data to the view if needed
        } else {
            res.redirect("/verify-otp").status(400).json({ valid: false, message: 'Invalid OTP' });

           // res.redirect("/verify-otp");
            // Optionally, you can also send a JSON response
            // res.status(401).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    verifyOTPLoad,
    verifiedUser
}