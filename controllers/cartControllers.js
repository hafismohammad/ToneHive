const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Products = require('../models/productModel')
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const addToCart = async (req, res) => {
    const prodId = req.params.id;
    try {
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).send('Unauthorized');
        }

        const userId = req.session.user._id;

        const product = await Products.findById(prodId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Create a new Cart item with productId, quantity, and price
        const cartItem = {
            productId: prodId,
            quantity: 1,
            price: product.price
        };

        let useCart = await Cart.findOne({ userId: userId });

        if (useCart) {
            // Update existing cart
            const prodId = new mongoose.Types.ObjectId(req.params.id);
            let prodExist = useCart.items.findIndex(item => item.productId.equals(prodId));

            if (prodExist !== -1) {
                await Cart.updateOne(
                    { userId: useCart.userId, 'items.productId': prodId },
                    { $inc: { 'items.$.quantity': 1 } }
                );
            } else {
                useCart.items.push(cartItem);
            }
        } else {
            // Create new cart with initial cart item
            useCart = new Cart({
                userId: userId,
                items: [cartItem]
            });
        }

        // Calculate totalCartPrice
        let totalCartPrice = 0;
        useCart.items.forEach(cartItem => {
            const subtotal = cartItem.price * cartItem.quantity;
            totalCartPrice += subtotal;
        });
    

        // Set totalPrice in the cart
        useCart.totalPrice = totalCartPrice;

        // Save the cart
        await useCart.save();

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error');
    }
}


const cartLoad = async (req, res) => {

    if (!req.session || !req.session.user || !req.session.user._id) {
        return res.status(401).send('Unauthorized');
    }

    const userId = req.session.user._id;

    try {
        const userInfo = await User.findOne(userId)

        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: '$items'
            },
            {
                $project: {
                    items: 1
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

        ]);

        let totalCartPrice = 0;
        const populatedCartItems = cartItems.map(cartItem => {
            const product = cartItem.productDetails[0];
            const subtotal = product.price * cartItem.items.quantity;
            totalCartPrice += subtotal;
            return {
                ...cartItem,
                productDetails: product,
                subtotal: subtotal
            };
        });


        let cartTotalCount = 0;
        const cartItemss = await Cart.find({ userId: userId });
        const cartCount = cartItems.length;

        // Now you can use cartCount to display the count in your cart icon or perform other operations



        return res.render("user/page-cart", { userInfo: userInfo, cartItems: populatedCartItems, totalCartPrice, cartCount: cartCount });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
}

const updateCartQuantity = async (req, res) => {
    try {
        const { cartItemId, productId, delta } = req.params;

        const useCart = req.useCart;

        if (!useCart || !useCart.userId) {
            return res.status(400).json({ error: 'User cart not found' });
        }

        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const targetProductId = new ObjectId(productId);

        // Find the item in the cart items array
        const currentItem = useCart.items.find(item => item.productId.equals(targetProductId));

        // Check if the currentItem exists and get its quantity
        const currentQuantity = currentItem ? currentItem.quantity : 0;

        // Calculate the new quantity after applying the delta
        const newQuantity = parseInt(delta);
        const requestedQuantity = currentQuantity + newQuantity;

        // Check if the requested quantity exceeds the available stock
        if (requestedQuantity > product.quantity) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        // Update the cart item quantity
        // Update the cart item quantity and total price
        await Cart.updateOne(
            { userId: useCart.userId, 'items.productId': targetProductId },
            {
                $inc: { 'items.$.quantity': newQuantity },
                $set: { 'totalPrice': product.price * (currentQuantity + newQuantity) }
            }
        );


        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const removeFormCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
        const productid = new mongoose.Types.ObjectId(req.params.id);


        const findCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productid } } }
        );

        if (!findCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.status(200).json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





module.exports = {
    cartLoad,
    addToCart,
    updateCartQuantity,
    removeFormCart

}