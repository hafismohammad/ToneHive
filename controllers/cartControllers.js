const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Products = require('../models/productModel')
const mongoose = require('mongoose');
const offerModel = require('../models/offerModel')

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

        if (product.quantity === 1) {
            return res.status(400).send('Quantity exceeds available stock');
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
        return res.status(200).send('Product added to cart successfully');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error');
    }
}


const cartLoad = async (req, res) => {
    try {
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).send('Unauthorized');
        }

        const userId = req.session.user._id;

        const userInfo = await User.findOne({ _id: userId });

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
            }
        ]);

        const activeOffer = await offerModel.findOne({ status: true });

        // Calculate offer price for each product in the cart
        const populatedCartItems = cartItems.map(cartItem => {
            const product = cartItem.productDetails[0]; // Get the product data from the cart item
            let offerPrice = parseInt(product.price); // Default to product price
            let appliedDiscount = 0; // Track the highest applied discount

            // Check if there is an active product offer
            if (activeOffer && activeOffer.productOffer && activeOffer.productOffer.product.toString() === product._id.toString()) {
                const productDiscount = activeOffer.productOffer.discount;
                const discountedPrice = (offerPrice * productDiscount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                    appliedDiscount = discountedPrice;
                }
            }

            // Check if there is an active category offer
            if (activeOffer && activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === product.category.toString()) {
                const categoryDiscount = activeOffer.categoryOffer.discount;
                const discountedPrice = (offerPrice * categoryDiscount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                    appliedDiscount = discountedPrice;
                }
            }

            // Check if product discount is greater than applied discount
            if (product.discount > appliedDiscount) {
                const discountedPrice = (offerPrice * product.discount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                }
            }

            product.offerPrice = parseInt(Math.round(offerPrice));

            // Calculate subtotal for the cart item
            const subtotal = product.offerPrice * cartItem.items.quantity;

            return {
                ...cartItem,
                productDetails: product,
                subtotal: subtotal
            };
        });

        // Calculate total cart price
        const totalCartPrice = populatedCartItems.reduce((total, cartItem) => total + cartItem.subtotal, 0);

        return res.render("user/page-cart", { userInfo: userInfo, cartItems: populatedCartItems, totalCartPrice, cartCount: cartItems.length });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};


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