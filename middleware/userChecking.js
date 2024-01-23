const checkBlockedStatus = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
  
      if (user && user.isBlocked) {
        // Clear session, token, or take appropriate action
        req.logout();  // Example for clearing a session in Passport.js
        res.status(401).send('User is blocked.');
      } else {
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };