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

const listUnlistStatus = async (req, res) => {
    const offerId = req.params.id;
    
    try {
        const result = await offerModel.findById(offerId);
        if (result) {
            result.status = !result.status;
            await result.save();
            res.status(200).json({ res: "success" });
        } else {
            res.status(404).json({ error: "Offer not found" });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const editOffer = async (req, res) => {
    try {
        const offer_Id = req.params.id;
        const offerData = await offerModel.findById(offer_Id);

        if (!offerData) {
            return res.status(404).send("Offer not found");
        }

        const product = await Products.findById(offerData.productOffer.product);
        const category = await Category.findById(offerData.categoryOffer.category);

        res.render("admin/page-editOffer", { offerData, product, category });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {
    AddOffer,
    productOfferLoad,
    postOffer,
    listUnlistStatus,
    editOffer
}