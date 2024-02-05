const Cart = require('../models/cartModel');


const setUserCart = async (req, res, next) => {
    try {
        // Retrieve useCart from the database or session
        const userId = req.session.user._id; // Assuming you have user session
        const useCart = await Cart.findOne({ userId });

        // Set useCart in the request object
        req.useCart = useCart;

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error retrieving user cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    setUserCart,
    
}