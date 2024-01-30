
const isLogin = async(req,res,next)=>{
    try {
       if(req.session.admin){
        res.redirect('/adminhome')
       }else{
        next()
       }
    } catch (error) {
     console.log(error)   
    }
}
const isLogout = async(req,res,next)=>{
    try {
       if(req.session.admin){
        next()
       } else{ 
        res.redirect('/')
       }
    } catch (error) {
      console.log(errror)  
    }
}

const adminAuthenticationChecking=async (req,res,next)=>{
    try{
        console.log(req.session.admin,"try");
        if(req.session.admin){ 
            res.redirect("/admin/dashboard");
        }else{
            next()
        }
    }catch(error){
        res.status(500).send("Internal error occured")
    }
}
module.exports = {
    isLogin,
    isLogout,
    adminAuthenticationChecking
}