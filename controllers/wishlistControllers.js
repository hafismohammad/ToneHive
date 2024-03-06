const User = require("../models/userModel")
const wishlistModel = require("../models/wishlistModel")
const Products = require('../models/productModel');
const Cart = require("../models/cartModel");
const offerModel = require("../models/offerModel")


const wishlistLoad = async (req, res) => {
    try {
        const userId = req.session.user._id;
        
        // Fetch the user information
        const userInfo = await User.findOne({ _id: userId });

        // Fetch the wishlist data using the aggregation pipeline
        const wishlist = await wishlistModel.aggregate([
            { $match: { user: userId } },
            { $unwind: '$products' },
            { $project: { products: 1 } },
            {
                $lookup: {
                    from: 'products', 
                    localField: 'products.productItems',
                    foreignField: '_id',
                    as: 'product'
                }
            }
        ]);

        // Fetch active offer
        const activeOffer = await offerModel.findOne({ status: true });

        // Calculate offer price for each product in the wishlist
        for (const item of wishlist) {
            const product = item.product[0]; // Get the product data from the wishlist item

            // Check if product is defined and has a price
            if (product && product.price) {
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
                        appliedDiscount = discountedPrice;
                    }
                }

                // Assign the calculated offer price to the product in the wishlist
                item.product[0].offerPrice = parseInt(Math.round(offerPrice));
            } else {
                // Handle the case where product or product price is undefined
                console.error('Product or product price is undefined:', product);
                // For example, you can skip processing this product or set a default offer price
            }
        }

        const wishlistCount = wishlist.length;
    
        const cartItems = await Cart.find({ userId });
        let cartCount = 0; 
        cartItems.forEach(cart => {
            cartCount += cart.items.length; 
        });

        // Pass the userId and wishlist data to the view
        res.render("user/page-view-wishlist", { userId: userInfo, wishlist: wishlist, wishlistCount: wishlistCount, cartCount: cartCount });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error"); // Add proper error handling for the response
    }
}

const addWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const prodId = req.params.id;

        // Find the product by its ID
        const product = await Products.findById(prodId);

        // Find the wishlist document for the user
        let wishlist = await wishlistModel.findOne({ user: userId });

        if (!wishlist) {
            // If wishlist doesn't exist, create a new one with the product
            wishlist = await wishlistModel.create({ user: userId, products: [{ productItems: product._id }] });
            return res.json({ message: "Item added to wishlist successfully", productId: prodId });
        }

        // Check if the product exists in the wishlist
        const productExists = wishlist.products.some(item => item.productItems.equals(product._id));

        if (productExists) {
            return res.status(400).json({ error: "Product already exists in the wishlist" });
        }

        // Add the product to the wishlist
        wishlist.products.push({ productItems: product._id });

        await wishlist.save();

        res.json({ message: "Item added to wishlist successfully", productId: prodId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error adding item to wishlist" });
    }
}
const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const prodId = req.params.id;
        console.log(prodId);

        // Update the query to find and delete the specific product item from the wishlist
        const wishlist = await wishlistModel.findOneAndUpdate(
            { user: userId },
            { $pull: { products: { productItems: prodId } } },
            { new: true }
        );

        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found" });
        }

        res.status(200).json({ message: "Item removed from wishlist successfully", wishlist });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error removing item from wishlist" });
    }
}




module.exports = {
    wishlistLoad,
    addWishlist,
    removeWishlist
}