const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');
const Products = require('../models/productModel');
const Cart = require("../models/cartModel");
const flash = require("express-flash");
const wishlistModel = require("../models/wishlistModel");
const offerModel = require('../models/offerModel')

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash

    } catch (error) {
        console.log(error);
    }
}

// const pageNotFound = (req, res) => {
//     try {
//         res.r
//     } catch (error) {
//         console.log(error);
//     }
// }

const homeLoad = async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const userName = user.name;


        if (req.session.user) {
            const category = await Category.find({ isList: false })

            // const products = await Product.find({product_status:false})
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
            // console.log(activeProducts);

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

         
            
            const products = await Products.find({ product_status: true }).populate("category")
         console.log(products);
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
            
           
            res.render("user/page-userHome", { userName: userName, category: category, products: productData, activeProducts: activeProducts,cartTotalCount:cartTotalCount,wishlistCount:wishlistCount,productsPrice:products })
        } else {
            redirect("/")
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const loginLoad = function (req, res) {
    if (req.session.user) {
        res.redirect("/userHome");
    } else {
        const error = req.query.error
        const message = req.flash('message');
        res.render("user/page-login", { message: message[0],error:error });
    }
};

const logedUser = async (req, res) => {
    const logEmail = req.body.email;
    const logPassword = req.body.password;
    
    try {
        const logedUser = await User.findOne({ email: logEmail });
        
        if (logedUser) {
            const comparePass = await bcrypt.compare(logPassword, logedUser.password);
            if (comparePass) {
                if (!logedUser.isBlocked) {
                    req.session.user = logedUser._id;
                    res.redirect("/userHome");
                    return; // Add return statement to exit the function after redirecting
                } else {
                    return res.redirect("/?error=User is blocked");
                }
            } else {
                return res.redirect("/?error=Incorrect password");
            }
        } else {
            return res.redirect("/?error=User not found");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};



// Generate a random OTP
function generateRandomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create an email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hafismhdthaleekara764@gmail.com',
        pass: 'ofzx kkgh klon lnht',
    },
});



const registerLoad = (req, res) => {
    if (req.session.user) {
        res.redirect("/page-userHome");
    } else {
        const message = req.flash('message');
        const error = req.flash('error');

        res.render("user/page-register", { message: message, error: error })
    }
}

const registeredUser = async (req, res) => {
    try {

        const userEmail = req.body.email;
        const existingUser = await User.findOne({ email: userEmail });

        console.log(existingUser);
        if (existingUser) {
            req.flash('error', "Email already exists.");
            return res.redirect("/register?error=Email already exists");
        }


        const spassword = await securePassword(req.body.password)
        // console.log(req.body);
        const userIn = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,

        }
        req.session.userData = userIn

        const otp = generateRandomOtp();
        console.log(otp);
        const email = userIn.email;

        const mailOptions = {
            from: 'hafismhdthaleekara764@gmail.com',
            to: email,
            subject: 'OTP Verification In Register Side',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending OTP email", error.message);
            } else {
                console.log("Register Side OTP mail sent", info.response);
            }
        });



        // Store OTP in session
        req.session.otp = otp;
        req.session.email = email;
        req.session.otpExpirationTime = Date.now() + 20 * 1000

        res.redirect('/otpRegister')

    } catch (error) {
        console.log(error);
        res.redirect('/register')
    }
}

const userLogout = (req, res) => {
    if (req.session.user || req.session.admin) {
        req.session.destroy((error) => {
            if (error) {
                res.redirect("/userhome")
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect("/")
    }
}



const productViews = async (req, res) => {
    try {
        const user = req.session.user
        const userInfo = await User.findById({ _id: user })

        const id = req.query.id
    
        const productData = await Products.findOne({ _id: id });
        if (productData.product_status) {

            const cartItems = await Cart.find({userId:user});
            let cartTotalCount = 0; 
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length; 
            });


            
            const wishlistInfo = await wishlistModel.find({ user: user });

            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });
           
            productData.offerPrice = parseInt(Math.round(
                parseInt(productData.price) - (parseInt(productData.price)* productData.discount) / 100
            ))
     
            res.render("user/page-viewProduct", { products: productData, userInfo: userInfo,cartTotalCount:cartTotalCount,wishlistCount:wishlistCount })
        }
        res.redirect("/userHome")
    } catch (error) {

    }
}
const searchProduct = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        const userName = user.name;
        const searchQuery = req.query.search;

        if (!userId) {
            return res.redirect('/login');
        }

        const category = await Category.find({ isList: false });

        let filter = { product_status: true };

        if (searchQuery) {
            // Search by name or category using regex for partial matches
            filter.$or = [
                { name: { $regex: new RegExp(searchQuery, "i") } },
                { category: { $regex: new RegExp(searchQuery, "i") } }
            ];
        }

        const searchResults = await Products.aggregate([{ $match: filter }]);
      
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

        const cartItems = await Cart.find({ userId });
        const cartTotalCount = cartItems.reduce((totalCount, cart) => totalCount + cart.items.length, 0);

        const wishlistInfo = await wishlistModel.find({ user });
        const wishlistCount = wishlistInfo.reduce((totalCount, wishlist) => totalCount + wishlist.products.length, 0);

        for (const product of productData) {
            product.offerPrice = parseInt(Math.round(
                parseInt(product.price) - (parseInt(product.price) * product.discount) / 100
            ));
        }

        const activeOffer = await offerModel.find({ status: true });

        const products = await Products.find({ product_status: true });
        for (const product of products) {
            const ProductOffer = activeOffer.find((offer) => offer.productOffer.product.equals(product._id));

            let categoryOffer;
            if (product.category[0] && product.category[0]._id) {
                categoryOffer = activeOffer.find((offer) => offer.categoryOffer.category.equals(product.category[0]._id));
            }

            let offerPrice;
            if (ProductOffer && categoryOffer) {
                offerPrice = Math.min(
                    product.price - (product.price * ProductOffer.productOffer.discount) / 100,
                    product.price - (product.price * categoryOffer.categoryOffer.discount) / 100
                );
            } else if (ProductOffer) {
                offerPrice = product.price - (product.price * ProductOffer.productOffer.discount) / 100;
            } else if (categoryOffer) {
                offerPrice = product.price - (product.price * categoryOffer.categoryOffer.discount) / 100;
            } else {
                offerPrice = product.price;
            }

            product.offerPrice = parseInt(Math.round(offerPrice));
        }

        res.render('user/page-userHome', {
            products: searchResults,
            userName,
            category,
            productData,
            activeProducts: productData.filter(item => item.category[0] && item.category[0].isList),
            cartTotalCount,
            wishlistCount,
            productsPrice: products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {
    loginLoad,
    logedUser,
    homeLoad,
    registerLoad,
    registeredUser,
    userLogout,
    productViews,
    generateRandomOtp,
     searchProduct,
   // pageNotFound
}