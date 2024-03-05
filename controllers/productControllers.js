const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const mongoose = require("mongoose");

// products & image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
});


const productsLoad = async (req, res) => {
    try {
        const Pdata = req.query.success;
        const productData = await Products.aggregate([{
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            }
        }])



        res.render("admin/page-productList", { data: Pdata, productData: productData })

    } catch (error) {
        console.log(error);
    }
}


const addProductLoad = async (req, res) => {
    try {
        const category = await Category.find()
        
        res.render("admin/page-addProduct", { category: category })

    } catch (error) {
        console.log(error);
        res.render("admin/page-addProduct")
    }
}



const addProducts = async (req, res) => {
    try {

        const {
            name,
            description,
            category,
            price,
            quantity,
            discount


        } = req.body;
        const image = req.files.map(el => el.filename)
        // console.log(image)
        // console.log(req.body.name, req.body.description);

        const product = {
            name: name,
            description: description,
            category: category,
            price: price,
            quantity: quantity,
            discount: discount,
            image: image,
        }
        //console.log("image",product.image);
        // Check if the product already exists
        const existingProduct = await Products.findOne({ name: name, });

        if (existingProduct) {
            return res.redirect("/admin/products?error=Duplicate Product");
        }
        else {
            const newProduct = await Products.create(product);
            res.redirect("/admin/products?success=Product Added");
        }

    } catch (error) {
        console.error("Error adding product:", error);
        res.render("admin/page-addProduct", { error: "Error adding product. Please try again later." });
    }
};

const listOrUnlistProducts = async (req, res) => {
    const prodId = req.params.prodid;
    try {
        const result = await Products.findOne({ _id: prodId });
        result.product_status = !result.product_status;
        result.save();
        res.json({ success: true });

    } catch (error) {
        console.log(error)
    }

}

const editProductLoad = async (req, res) => {
    try {
        const message=req.flash("message")
        
        const id = req.params.id;
        const category = await Category.find();
        const productData = await Products.findOne({ _id: id });
        res.render("admin/page-editProdut", {message:message, productData: productData, category: category });
    } catch (error) {
        console.log(error);
    }
};


const editedProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const images = req.files ? req.files.map(file => file.filename) : [];

        const product = await Products.findById(id);

        if (!product) {
            throw new Error("Product not found");
        }

        const duplicateProd = await Products.findOne({ name: name, _id: { $ne: id } });
        if (duplicateProd) {
            throw new Error("Duplicate product name");
        }

        const { category, description, price, quantity, discount } = req.body;

        // Check if new images are uploaded, if not, retain existing images
        const updatedImages = images.length > 0 ? images : product.image;

        const updateFields = {
            name: name,
            category: category,
            description: description,
            price: price,
            quantity: quantity,
            discount: discount,
            image: updatedImages
        };

        // Delete old images only if new images are uploaded
        if (req.files && req.files.length > 0) {
            // Remove images that are no longer associated with the product
            product.image.forEach(oldImage => {
                if (!updatedImages.includes(oldImage)) {
                    try {
                        const imagePath = path.join("public/uploads/", oldImage);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        } else {
                            console.log(`File ${imagePath} does not exist.`);
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        }

        const updatedProduct = await Products.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (!updatedProduct) {
            throw new Error("Failed to update product");
        }

        req.flash("message", "Product edited successfully");
        res.redirect(`/admin/products`);
    } catch (error) {
        console.error(error.message);
        req.flash("message", "Error editing product: " + error.message);
        res.redirect("/admin/products");
    }
};




const deleteImages = (req, res) => {
    try {
        const prodId = req.params.prodId;
        const image = req.params.image;

        // Construct the path to the image file
        const imagePath = `public/uploads/${image}`;

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // Delete the file
            fs.unlinkSync(imagePath);
            console.log(`Image ${image} deleted successfully.`);
            res.status(200).send("Image deleted successfully.");
        } else {
            console.log(`Image ${image} does not exist.`);
            res.status(404).send("Image not found.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error.");
    }
};


module.exports = {
    productsLoad,
    addProductLoad,
    addProducts,
    upload,
    listOrUnlistProducts,
    editProductLoad,
    editedProduct,
    deleteImages

}