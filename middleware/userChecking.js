const User = require('../models/userModel')
const checkBlockedStatus = async (req, res, next) => {
    try {
      const user = await User.findById(req.session.user);
  
      if (user && user.isBlocked) {
        // Clear session, token, or take appropriate action
        req.session.user = null  // Example for clearing a session in Passport.js
        res.redirect('/')
      } else {
        console.log("h")
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

  module.exports = {
    checkBlockedStatus
  }