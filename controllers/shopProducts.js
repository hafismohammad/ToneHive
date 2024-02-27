const Products = require('../models/productModel');
const User = require("../models/userModel")
const Category = require("../models/categoryModel")

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

           

            res.render("user/page-shopProduct", { userName, category, productData, activeProducts });
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