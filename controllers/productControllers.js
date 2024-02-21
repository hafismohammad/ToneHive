const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const multer = require('multer');

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
        const images = []; // Array to store filenames of edited images

        // Push filenames of edited images into the images array
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        // Retrieve the product by ID
        const product = await Products.findById(id);

        // Check for duplicate product name
        const duplicateProd = await Products.findOne({ name: name });
        if (!duplicateProd || duplicateProd._id.toString() === id) {
            // Extract other form fields
            const category = req.body.category;
            const description = req.body.description;
            const price = req.body.price;
            const quantity = req.body.quantity;
            const discount = req.body.discount;

            // Construct updateFields object
            const updateFields = {
                name: name, 
                category: category,
                description: description,
                price: price,
                quantity: quantity,
                discount: discount
            };

            // Handle image update
            if (req.files && req.files.length > 0) {
                // Delete old images if they exist
                if (product.image && product.image.length > 0) {
                    for (let i = 0; i < product.image.length; i++) {
                        try {
                            fs.unlinkSync("public/uploads/" + product.image[i]);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
                // Update images in updateFields
                updateFields.image = images;
            }

            // Update the product in the database
            const updatedProduct = await Products.findByIdAndUpdate(id, { $set: updateFields });

            // Check if the update operation was successful
            if (updatedProduct) {
                req.flash("message", "Product Edited");
                res.redirect(`/admin/products`);
            } else {
                throw new Error("Failed to update product");
            }
        } else {
            req.flash("message", "Duplicate Product");
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log(error);
        req.flash("message", "Error editing product");
        res.redirect("/admin/products");
    }
};




module.exports = {
    productsLoad,
    addProductLoad,
    addProducts,
    upload,
    listOrUnlistProducts,
    editProductLoad,
    editedProduct

}