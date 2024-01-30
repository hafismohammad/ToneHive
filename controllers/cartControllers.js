const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Products = require('../models/productModel')

// const addToCart = (req, res) => {

//      const productId  = req.body.productId;
//      console.log( req.body.productId);
//      console.log('Product added to cart. Product ID:', productId);
//      res.status(200).send('Product added to cart successfully');

    // try {
    //     let cart = await Cart.findOne({ userId });

    //     if (!cart) {
    //         cart = new Cart({ userId, items: [] });
    //     }

    //     const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

    //     if (itemIndex !== -1) {
    //         cart.items[itemIndex].quantity++;
    //     } else {
    //         cart.items.push({ productId, quantity: 1, price });
    //     }

    //     await cart.save(); // Added parentheses to correctly call save function
    // } catch (error) {
    //     console.error(error);
    //     throw new Error('Error adding item to cart');
    // }
// }

const addToCart = async (req, res) => {
    const productId  = req.body.productId;
    try {
        let productId = req.params.id;
        let user = req.session.user;
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        console.log('Product added to cart:', product);
        return res.status(200).send('Product added to cart successfully');
    } catch (error) {
        console.log(error);
    }
}

const cartLoad = (req, res) => {
    try {
        // Assuming you have the cart data available in req.cart
       // const cart = req.cart;
        res.render("user/page-cart");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
}


// const addToCartController = async (req, res) => {
    // const { userId, productId, price } = req.body;

    // try {
    //     await addToCart(userId, productId, price); // Call addToCart function
    //     res.status(200).json({ message: 'Item added to cart successfully' });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Internal server error' });
    // }





module.exports = {
    cartLoad,
    addToCart,
  
}