
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
module.exports = {
    isLogin,
    isLogout
}