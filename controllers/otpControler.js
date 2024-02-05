const User = require("../models/userModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');


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
    if (req.query.message) {
        res.render('user/page-verify-otp',{message:req.query.message});

    }
    else {
        try {

            // Generate a random OTP
            const otp = generateRandomOtp();
            const uOtp = otp;

            req.session.otpExpirationTime = Date.now() + 20 * 1000

            req.session.otp = otp;
            console.log(otp);
           


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
}



const verifiedUser = async (req, res) => {
    try {
        const userEnteredOtp = req.body.otp;
        //const user = await User.findOne(req.session.email)

        const email = req.body.email; // Assuming email is sent in the request body
        const userData = await User.findOne({ email: email }); // Constructing the filter object correctly
          if(userEnteredOtp !== req.session.otp){ // ===
          res.redirect("/userHome")
          }else{
            res.render("user/page-verify-otp",{message: 'Invalid OTP'})
          }

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const  resendOtp = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.user });
        const email = userData.email;

        // Generate a new random OTP
        const newOtp = generateRandomOtp();

        // Update session with the new OTP and reset expiration time
        req.session.otp = newOtp;
        req.session.otpExpirationTime = Date.now() + 20 * 1000;

        // Send the new OTP to the user's email
        sendOtpEmail(email, newOtp);

        // Redirect to the verify OTP page or handle it as needed
        res.redirect("/verify-otp");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const otpRegisterLoad = async (req, res) => {
    try {
         res.render("user/page-otpRegister");
    } catch (error) {
        console.log(error);
    }
};

const otpRegisterPost = async(req, res) => {
    try {
        const userEnteredOtp = req.body.otp;
        const storedOtp = req.session.otp;
       
                
                if (userEnteredOtp === storedOtp) {
                  
                    const userData = req.session.userData; 
                    const newUser = new User(userData);
                    await newUser.save(); 
                    // Redirect the user to the homepage with a success message
                    req.flash("message", "Registered Successfully");
                     res.redirect("/");
                } else {
                    req.flash("message", "Invalid OTP");
            res.redirect("/",);
        }
    } catch (error) {
        console.log(error);
    }
};



module.exports ={
    verifyOTPLoad,
    verifiedUser,
    resendOtp,
    otpRegisterLoad,
    otpRegisterPost
    
}

