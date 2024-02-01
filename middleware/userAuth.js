
const isLogin = async(req,res,next)=>{
    try {
      if(req.session.user){
        res.redirect('/userHome')
      }else{
        next()
      }
    } catch (error) {
     console.log(error)   
    }
}

const isLogout = async(req,res,next)=>{
    try {
      if(req.session.user){
        console.log("hi")
        next()
      }else{
        res.redirect('/')
      }  
    } catch (error) {
     console.log(error)   
    }
}

// const isVerify = async(req,res,next)=>{
//   try {
//     if(req.session.user){
//       res.redirect('/verify-otp')
//     }else{
//       next()
//     }
//   } catch (error) {
//    console.log(error)   
//   }
// }
const otpTimeOut = (req, res, next) => {
if(Date.now() >= req.session.otpExpirationTime){
  res.redirect(`/verify-otp?message=${"Invalid OTP"}`);
}else{
  next();
}
}

module.exports = {
    isLogin,
    isLogout,
    otpTimeOut,
 

}