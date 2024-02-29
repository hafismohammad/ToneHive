const Products = require('../models/productModel');
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Cart = require("../models/cartModel");
const wishlistModel = require("../models/wishlistModel");
const offerModel = require('../models/offerModel')

const shopProducts = async (req, res) => {
    try {
        const userId = req.session.user;

        if (userId) {
            const user = await User.findById(userId);
            const userName = user.name;

            const category = await Category.find({ isList: false });

            const productData = await Products.aggregate([{

                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                }
            },
            {
                $match: {
                    "category.isList": false,
                    "product_status": true
                }
            }
            ])
            const activeProducts = productData
            .map((item) => {
                const category = item.category[0]
                if (category && category.isList) {

                    const category = item.category[0]
                    if (item.product_status) {
                        return item
                    }
                } else {
                    return null;
                }
            }).filter(Boolean)

            const cartItems = await Cart.find({userId:userId});
            let cartTotalCount = 0; 
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length; 
            });
           
            const wishlistInfo = await wishlistModel.find({ user: user });

            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });
            for(const product of productData){
                product.offerPrice = parseInt(Math.round(
                    parseInt(product.price) - (parseInt(product.price)* product.discount) / 100
                ))
            }
  
            const activeOffer = await offerModel.find({ status: true });

         
            
            const products = await Products.find({ product_status: true })
            for (const product of products) {
                const ProductOffer = activeOffer.find((offer) => {
                    return offer.productOffer.product.equals(product._id);
                });
            
                let categoryOffer;
                if (product.category[0] && product.category[0]._id) { // Add a check for category existence and _id property
                    categoryOffer = activeOffer.find((offer) => {
                        return offer.categoryOffer.category.equals(product.category[0]._id);
                    });
                }
            
                let offerPrice;
            
                if (ProductOffer && categoryOffer) {
                    if (ProductOffer.productOffer.discount > categoryOffer.categoryOffer.discount) {
                        offerPrice = product.price - (product.price * ProductOffer.productOffer.discount) / 100;
                    } else {
                        offerPrice = product.price - (product.price * categoryOffer.categoryOffer.discount) / 100;
                    }
                } else if (ProductOffer) {
                    offerPrice = product.price - (product.price * ProductOffer.productOffer.discount) / 100;
                } else if (categoryOffer) {
                    offerPrice = product.price - (product.price * categoryOffer.categoryOffer.discount) / 100;
                } else {
                    offerPrice = product.price;
                }
            
                product.offerPrice = parseInt(Math.round(offerPrice));
            }
            res.render("user/page-shopProduct", { userName, category, productData, activeProducts, cartTotalCount, wishlistCount,productsPrice:products  });
        } else {
            console.log('User not found');
            // Handle the case where the user is not logged in
            // You might want to redirect them to a login page or handle it in another way
            res.redirect('/login'); // Example: Redirect to login page
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    shopProducts
}