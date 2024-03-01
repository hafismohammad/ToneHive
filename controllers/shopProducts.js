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

            const productData = await Products.find().populate("category")
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

         
            const products = await Products.find({ product_status: true });

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
            res.render("user/page-shop",{ userName, category, products:productData, activeProducts, cartTotalCount, wishlistCount,productsPrice:products  });
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

const sortProductCategory = async (req, res) => {
    try {
        const categoryId = req.query.id
        const userId = req.session.user
         
        if (userId) {
            const user = await User.findById(userId);
            const userName = user.name;
            const category = await Category.find({ isList: false });
            const productsItems = await Products.find({ category: categoryId }).populate("category")
         
            const productData = await Products.aggregate([
                {
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
            ]);

            const activeProducts = productData
                .map((item) => {
                    const category = item.category[0];
                    if (category && category.isList) {
                        if (item.product_status) {
                            return item;
                        }
                    } else {
                        return null;
                    }
                })
                .filter(Boolean);

            const cartItems = await Cart.find({ userId: userId });
            let cartTotalCount = 0;
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length;
            });

            const wishlistInfo = await wishlistModel.find({ user: user });
            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });

            for (const product of productData) {
                product.offerPrice = parseInt(Math.round(
                    parseInt(product.price) - (parseInt(product.price) * product.discount) / 100
                ));
            }

            const activeOffer = await offerModel.find({ status: true });

            const products = await Products.find({ product_status: true });

            for (const product of products) {
                const ProductOffer = activeOffer.find((offer) => {
                    return offer.productOffer.product.equals(product._id);
                });

                let categoryOffer;
                if (product.category[0] && product.category[0]._id) {
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

            res.render("user/page-shop", { userName, category, productData,products:productsItems, activeProducts, cartTotalCount, wishlistCount, productsPrice: products });

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const priceRange = async (req, res) => {
    try {
        const productData = JSON.parse(req.body.productData);
        const sortOrder = req.body.sortOrder;
        
        const categoryId = req.query.id;
        const userId = req.session.user;

        if (userId) {
            const user = await User.findById(userId);
            const userName = user.name;
            const category = await Category.find({ isList: false });
            const productsItems = await Products.find({ category: categoryId }).populate("category");

            if (sortOrder === 'LH') {
                productData.sort((a, b) => a.price - b.price);
            } else if (sortOrder === 'HL') {
                productData.sort((a, b) => b.price - a.price);
            } else {
                throw new Error('Invalid sortOrder. Must be LH or HL.');
            }
           
            const aggregatedProductData = await Products.aggregate([
                {
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
            ]);

            const activeProducts = aggregatedProductData
                .map((item) => {
                    const category = item.category[0];
                    if (category && category.isList) {
                        if (item.product_status) {
                            return item;
                        }
                    } else {
                        return null;
                    }
                })
                .filter(Boolean);

            const cartItems = await Cart.find({ userId: userId });
            let cartTotalCount = 0;
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length;
            });

            const wishlistInfo = await wishlistModel.find({ user: user });
            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });

            for (const product of aggregatedProductData) {
                product.offerPrice = parseInt(Math.round(
                    parseInt(product.price) - (parseInt(product.price) * product.discount) / 100
                ));
            }

            const activeOffer = await offerModel.find({ status: true });

            const products = await Products.find({ product_status: true });

            for (const product of products) {
                const ProductOffer = activeOffer.find((offer) => {
                    return offer.productOffer.product.equals(product._id);
                });

                let categoryOffer;
                if (product.category[0] && product.category[0]._id) {
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
        
            res.render("user/page-shop", { userName, category, productData: aggregatedProductData, products: productData, activeProducts, cartTotalCount, wishlistCount, productsPrice: products });
        }
    } catch (error) {
        console.error("Error fetching sorted products:", error);
        res.status(500).json({ error: "Error fetching sorted products" });
    }
};



module.exports = {
    shopProducts,   
    sortProductCategory,
    priceRange
}