const Products = require('../models/productModel');
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Cart = require("../models/cartModel");
const wishlistModel = require("../models/wishlistModel");
const offerModel = require('../models/offerModel')

const shopProducts = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user : undefined
  

            const user = await User.findById(userId);
            const userName = user?.name;

            const category = await Category.find({ isList: false });

            const productData = await Products.find({product_status:true}).populate("category");
            const activeProducts = productData
                .map((item) => {
                    const category = item.category[0];
                    if (category && category.isList) {
                        if (item.product_status) {
                            return item;
                        }
                    }
                    return null;
                })
                .filter(Boolean);

            const cartItems = await Cart.find({ userId: userId });
            let cartTotalCount = 0;
            cartItems.forEach((cart) => {
                cartTotalCount += cart.items.length;
            });

            const wishlistInfo = await wishlistModel.find({ user: user });

            let wishlistCount = 0;
            wishlistInfo.forEach((wishlist) => {
                wishlistCount += wishlist.products.length;
            });

           // Fetch active offer
           const activeOffer = await offerModel.findOne({ status: true });

           // Fetch products
           const products = await Products.find({ product_status: true }).populate("category");

      
           // Calculate offer price for each product
           for (const product of productData) {
               let offerPrice = parseInt(product.price); // Default to product price
               let appliedDiscount = 0; // Track the highest applied discount

               // Check if there is an active product offer
               if (activeOffer && activeOffer.productOffer && product && product._id &&
                activeOffer.productOffer.product.toString() === product._id.toString()) {
                   const productDiscount = activeOffer.productOffer.discount;
                   const discountedPrice = (offerPrice * productDiscount) / 100;

                   if (discountedPrice > appliedDiscount) {
                       offerPrice -= discountedPrice;
                       appliedDiscount = discountedPrice;
                   }
               }

               // Check if there is an active category offer
               if (activeOffer && activeOffer.categoryOffer && product && product.category &&
                product.category[0] && product.category[0]._id &&
                activeOffer.categoryOffer.category.toString() === product.category[0]._id.toString()) {
            
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

               // Assign the calculated offer price to the product
               product.offerPrice = parseInt(Math.round(offerPrice));
           }
           
       
            res.render("user/page-shop", {userId, userName, category, products: productData, activeProducts, cartTotalCount, wishlistCount, productsPrice: productData });
   
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};


const sortProductCategory = async (req, res) => {
    try {
        const categoryId = req.query.id
        const userId = req.session.user
         
       
            const user = await User.findById(userId);
            const userName = user?.name;
            const category = await Category.find({ isList: false });
            const productsItems = await Products.find({ category: categoryId,product_status: true  }).populate("category")
         
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
          // console.log(productData);
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

                product.offerPrice = parseInt(Math.round(offerPrice))
              
            }
            console.log(productData);
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