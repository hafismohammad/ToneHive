const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Products = require('../models/productModel')
const mongoose = require('mongoose');
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
    const prodId = req.params.id; // Get the product ID from the request parameters
    try {
        // Check if user is authenticated and user information is available in session
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).send('Unauthorized');
        }

        const userId = req.session.user._id; // Get the user ID from the session

        const product = await Products.findById(prodId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Create a new Cart item with productId, quantity, and price
        const cartItem = {
            productId: prodId,
            quantity: 1, // Default quantity
            price: product.price // Assign price from the product
        };

        // Find the user's cart or create a new one if it doesn't exist
        let useCart = await Cart.findOne({ userId: userId });
        if (useCart) {    
            const prodId = new mongoose.Types.ObjectId(req.params.id); 
            let proExist = useCart.items.findIndex(item => item.productId.equals(prodId));
            console.log(proExist);
            
            // useCart.items.push(cartItem);
        } else {
        
            // console.log(proExist);
            // If cart exists, push the new item to the items array
           
            useCart = new Cart({
                userId: userId,
                items: [cartItem] // Add the Cart item to the items array
            });
            
        }

        // Save the cart to the database
        await useCart.save();

        // console.log('Product added to cart:', product);
        return res.status(200).send('Product added to cart successfully');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error');
    }
}



const cartLoad = async (req, res) => {
    // Check if the user is authenticated
    if (!req.session || !req.session.user || !req.session.user._id) {
        return res.status(401).send('Unauthorized');
    }

    const userId = req.session.user._id;
    console.log('user',userId);
    try {
        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId } 
            },
            {
                $lookup:{
                    from: 'products',
                    let: { prodList: '$items.productId' },
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $in:['$_id', "$$prodList"]
                                }
                            }
                        }
                    ],
                    as: 'matchedProducts'
                }
            }
        ]);
        
        console.log('cart items:', cartItems); // Log the cartItems array after aggregation

        // Iterate over each cart item
        cartItems.forEach(cartItem => {
            // Log the cart item
            // console.log('Cart Item:', cartItem);

            // Iterate over matchedProducts array of each cart item
            cartItem.matchedProducts.forEach(product => {
                // Access product details like name, description, price, etc.
                const productName = product.name;
                const productDescription = product.description;
                const productPrice = product.price;

                // Log product details
              
            });
        });

        // Render the page with cartItems
        return res.render("user/page-cart", { cartItems: cartItems });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
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