const Cart = require('../models/cartModel');


const setUserCart = async (req, res, next) => {
    try {
     
        const userId = req.session.user._id; 
        const useCart = await Cart.findOne({ userId });
   
        req.useCart = useCart;

        next();
    } catch (error) {
        console.error('Error retrieving user cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    setUserCart,
    
}