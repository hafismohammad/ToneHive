const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const bcrypt = require("bcryptjs");
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



const gustUser = async (req, res) => {
    try {
    

        
        // Define the category variable here
        const category = await Category.find({ isList: false });
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
          // Fetch active offer
          const activeOffer = await offerModel.findOne({ status: true });

          // Fetch products
          const products = await Products.find({ product_status: true }).populate("category");

     
          // Calculate offer price for each product
          for (const product of productData) {
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
              if (activeOffer && activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === product.category[0]._id.toString()) {
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

        // Pass the category variable along with other data when rendering the EJS template
        res.render("user/page-userHome", {  
            userName:req.session.user,
            category,
            products: productData,
            productsPrice: products
            // wishlistCount,
            // cartTotalCount
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const homeLoad = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        const userName = user.name;

        if (req.session.user) {
            const category = await Category.find({ isList: false });
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

            // Fetch active offer
            const activeOffer = await offerModel.findOne({ status: true });

            // Fetch products
            const products = await Products.find({ product_status: true }).populate("category");

            // Calculate offer price for each product
            for (const product of productData) {
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
                if (activeOffer && activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === product.category[0]._id.toString()) {
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

            // Fetch cart items and calculate total count
            const cartItems = await Cart.find({ userId });
            let cartTotalCount = 0;
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length;
            });

            // Fetch wishlist info and calculate total count
            const wishlistInfo = await wishlistModel.find({ user });
            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });

            // Render the view with data
            res.render("user/page-userHome", { userName, category, products: productData, cartTotalCount, wishlistCount, productsPrice: products });
        } else {
            res.redirect("/");
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
        res.render("user/page-login", { message: message[0], error: error });
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
                    return res.redirect("/login?error=User is blocked");
                }
            } else {
                return res.redirect("/login?error=Incorrect password");
            }
        } else {
            return res.redirect("/login?error=User not found");
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

const resendOtpNew = (req, res) => {
    try {

        const otp = generateRandomOtp();
        console.log(otp);
        const email = req.session.email

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


         console.log("This is resended otp: ",otp);
        // Store OTP in session
        req.session.otp = otp;
        
        req.session.otpExpirationTime = Date.now() + 20 * 1000
        res.redirect("/otpRegister")
    } catch (error) {
        console.log(error);
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
        const user = req.session.user;
        const userInfo = await User.findById(user);

        const id = req.query.id;

        // Fetch the product data
        const productData = await Products.findOne({ _id: id });

        // Check if the product is active
        if (productData.product_status) {
            // Fetch cart items and calculate total count
            const cartItems = await Cart.find({ userId: user });
            let cartTotalCount = 0;
            cartItems.forEach(cart => {
                cartTotalCount += cart.items.length;
            });

            // Fetch wishlist info and calculate total count
            const wishlistInfo = await wishlistModel.find({ user: user });
            let wishlistCount = 0;
            wishlistInfo.forEach(wishlist => {
                wishlistCount += wishlist.products.length;
            });

            // Fetch active offer
            const activeOffer = await offerModel.findOne({ status: true });

            // Calculate offer price for the product
            let offerPrice = parseInt(productData.price); // Default to product price
            let appliedDiscount = 0; // Track the highest applied discount

            // Check if there is an active product offer
            if (activeOffer && activeOffer.productOffer && activeOffer.productOffer.product.toString() === productData._id.toString()) {
                const productDiscount = activeOffer.productOffer.discount;
                const discountedPrice = (offerPrice * productDiscount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                    appliedDiscount = discountedPrice;
                }
            }

            // Check if there is an active category offer
            if (activeOffer && activeOffer.categoryOffer && activeOffer.categoryOffer.category.toString() === productData.category.toString()) {
                const categoryDiscount = activeOffer.categoryOffer.discount;
                const discountedPrice = (offerPrice * categoryDiscount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                    appliedDiscount = discountedPrice;
                }
            }

            // Check if product discount is greater than applied discount
            if (productData.discount > appliedDiscount) {
                const discountedPrice = (offerPrice * productData.discount) / 100;

                if (discountedPrice > appliedDiscount) {
                    offerPrice -= discountedPrice;
                    appliedDiscount = discountedPrice;
                }
            }

            // Assign the calculated offer price to the product
            productData.offerPrice = parseInt(Math.round(offerPrice));

            // Render the view with product data and user information
            res.render("user/page-viewProduct", { products: productData, userInfo: userInfo, cartTotalCount: cartTotalCount, wishlistCount: wishlistCount });
        } else {
            // Redirect to userHome if product is not active
            res.redirect("/userHome");
        }
    } catch (error) {
        console.log(error);
        // Handle error appropriately
        res.status(500).send("Internal Server Error");
    }
}


const searchProduct = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        const userName = user?.name;
        const searchQuery = req.query.search;

       
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

        // Fetch active offer
        const activeOffer = await offerModel.findOne({ status: true });

        // Fetch products
        const products = await Products.find({ product_status: true }).populate("category");

        // Calculate offer price for each product
        for (const product of productData) {
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
            if (activeOffer && activeOffer.categoryOffer && product.category && product.category[0] && activeOffer.categoryOffer.category.toString() === product.category[0]._id.toString()) {
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


// const pageNotFound = (req, res) => {
//     try {
        
//      res.render('user/page-404',{user:req.session.user})
//     } catch (error) {
//         console.log(error);
//     }
// }


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
    gustUser,
    resendOtpNew,
   // pageNotFound
    
}