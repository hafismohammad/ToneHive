const Category = require("../models/categoryModel")
const Products = require('../models/productModel');
const offerModel = require('../models/offerModel')


const productOfferLoad = async (req, res) => {
    try {
        const offers = await offerModel.find()
      for(const offer of offers) {
        const product = await Products.findById(offer.productOffer.product)
        const category = await Category.findById(offer.categoryOffer.category)

        offer.productName = product ? product.name : 'Product not found';
        offer.categoryName = category ? category.name : 'Category not found'

      }
        res.render('admin/Page-ProductOffers', {offers: offers})
    } catch (error) {
        console.log(error);
    }
}

const AddOffer = async (req, res) => {
    try {
        const category = await Category.find({ isList: false })
        const product = await Products.find({ product_status: true })
        res.render('admin/page-AddOffer', { category: category, product: product })
    } catch (error) {
        console.log(error);
    }
}

const postOffer = async (req, res) => {
    try {
        const { name, startingDate, endingDate, product, productDiscount, category, categoryDiscount } = req.body;

        const productDoc = await Products.findById(product);
        const categoryDoc = await Category.findById(category);

        console.log(categoryDoc);
        if (!productDoc || !categoryDoc) {
            return res.status(400).json({ error: "Invalid product or category ID" });
        }

        // const discountPrice = (productDoc.price * productDiscount) / 100;
        // const offerPrice = productDoc.price - discountPrice;

        const offerObj = {
            name,
            startingDate,
            endingDate,
            productOffer: {
                product: productDoc._id,
                discount: productDiscount
            },
            categoryOffer: {
                category: categoryDoc._id,
                discount: categoryDiscount
            }
        };


        const offerInfo = await offerModel.create(offerObj);
     
           res.redirect("/admin/productOffer")
        // res.status(200).json({ message: "Offer created successfully", offer: offerInfo });
    } catch (error) {

        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}



module.exports = {
    AddOffer,
    productOfferLoad,
    postOffer
}