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

const resendOtp = async (req, res) => {
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
//        // Implement logic to generate and send a new OTP
//   const newOTP = generateRandomOtp(); // You need to define this function
//   const email = req.body.email; // Assuming you have a way to get the user's email
//   sendOtpEmail(email, newOTP); // Implement this function to send the new OTP

//   // Respond to the client indicating that the OTP has been resent
//   res.status(200).json({ message: 'OTP resent successfully' });
// }
}



module.exports ={
    verifyOTPLoad,
    verifiedUser,
    resendOtp,
}

