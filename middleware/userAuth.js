
const isLogin = async(req,res,next)=>{
    try {
      if(req.session.user){
        res.redirect('/userhome')
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
        next()
      }else{
        res.redirect('/')
      }  
    } catch (error) {
     console.log(error)   
    }
}

module.exports = {
    isLogin,
    isLogout
}