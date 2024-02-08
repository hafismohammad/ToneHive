const User = require("../models/userModel");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



// // Generate a random OTP
// function generateRandomOtp() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Create an email transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'hafismhdthaleekara764@gmail.com',
//         pass: 'ofzx kkgh klon lnht',
//     },
// });


// const forgottPasswordOtp = async (req, res) => {
//     try {
//         const otp = generateRandomOtp();
//         console.log(otp);
//         const userData = await User.findOne();
//         const email = userData.email;


//         function sendOtpEmail(email, otp) {
//             const mailOptions = {
//                 from: 'hafismhdthaleekara764@gmail.com',
//                 to: email,
//                 subject: 'OTP Verification In Register Side',
//                 text: `Your OTP is: ${otp}`
//             };

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error("Error sending OTP email", error.message);
//                 } else {
//                     console.log("Forgottpassword Side OTP mail sent", info.response);
//                 }
//             });
//         }
//         sendOtpEmail(email, otp);

//         // Store OTP in session
//         req.session.otp = otp;
//         req.session.email = email;  
//        // req.session.otpExpirationTime = Date.now() + 20 * 1000

       

//         res.render("user/page-OtpForgottPassword",{ email })

//     } catch (error) {
//         console.log(error);
//     }
  
// }

// const forgottPasswordOtpPost = (req, res) => {
//     try {
//         const userEnteredOtp = req.body.otp;
//         const storedOtp = req.session.otp;

//         if (userEnteredOtp === storedOtp) {// ===
//             res.render("user/page-forgottpassword");
//         } else {
//             res.redirect("/forgottPassword",{message: "Invalid OTP"});
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };



// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hafismhdthaleekara764@gmail.com',
        pass: 'ofzx kkgh klon lnht',
    }
});

// Function to send reset password email
async function sendResetPasswordEmail(email, resetLink) {
    try {
        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from:  'hafismhdthaleekara764@gmail.com',
            to: email,
            subject: 'Reset Your Password',
            text: `Click the following link to reset your password: ${resetLink}`,
            html: `<h5>Change your password, Click the link below.</h5><br><a href=${resetLink}>Click the link </a>`
        });

        console.log('Email sent: ', info.messageId);
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw error;
    }
}

module.exports = { sendResetPasswordEmail };




const JWT_SECRET = 'some super secret...'

const forgotPasswordLoad = (req, res) => {
    res.render("user/page-forgottpassword")
}
const forgotPasswordPost = async (req, res) => {
    const { email } = req.body;
    try {
        const userData = await User.findOne({ email });

        if (userData) {
            const secret = JWT_SECRET + userData.password;
            const payload = {
                email: userData.email,
                id: userData._id
            };
            const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            const resetLink = `http://localhost:3000/resetPassword/${userData._id}/${token}`;

            // Send reset password email
            await sendResetPasswordEmail(userData.email, resetLink);

            res.render("user/page-forgottpassword",{message: 'Password reset link has been sent to your email...'});
        } else {
            res.send('User not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};


const resetPasswordLoad = async (req, res) => {
    const { _id, token } = req.params;
    const email = req.body.email;


    try {
        const userData = await User.findById(_id);


        if (!userData) {
            res.send("Invalid user");
            return;
        }

        const secret = JWT_SECRET + userData.password;
        const payload = jwt.verify(token, secret);
        res.render('user/page-resetPassword', { _id, token, email  });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};



const resetPasswordPost = async (req, res) => {
    const { _id, token } = req.params;
    const newPassword = req.body.password;

    try {
        if (!newPassword) {
            res.status(400).send("New password is required");
            return;
        }

        const userData = await User.findById(_id);

        if (!userData) {
            res.status(404).send("User not found");
            return;
        } 

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userData.password = hashedPassword;
        await userData.save();


        const email = userData.email;


        res.render("user/page-resetPassword", {
            _id: _id,
            token: token,
            email: email,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};



module.exports =  {
   // forgottPasswordOtp,
  //  forgottPasswordOtpPost,
    forgotPasswordLoad,
    forgotPasswordPost,
    resetPasswordLoad,
    resetPasswordPost,
    sendResetPasswordEmail
}