const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel");
const Products = require("../models/productModel")
const multer = require('multer');
const session = require("express-session");
const { set } = require("mongoose");

//const categoryHelper = require("../helpers/categoryHelper")

const dashboardLoad = async (req, res) => {
    try {

        res.render("admin/page-adminDashboard")
    } catch (error) {
        console.log(error);
    }
}



const customerLoad = async (req, res) => {
    try {
        const userData = await User.find({ isAdmin: 0 });
        res.render("admin/page-customers", { user: userData })
    } catch (error) {
        console.log(error);
    }
}

const edituserload = async function (req, res) {

    const id = req.query.userid;
    req.session.id = id
    // console.log(id)
    const userData = await User.findById({ _id: id });
    res.render('admin/page-editUser', { user: userData })
}

const blockuser = async (req, res) => {
    const userId = req.params.userid;
    console.log(userId);
    try {
        await User.findByIdAndUpdate(userId, { $set: { isBlocked: true } });
        res.json({ success: true });
        // console.log(`User blocked successfully.`);
    } catch (error) {
        console.log(error);

    }
}

const unblockuser = async (req, res) => {
    const userId = req.params.userid;
    try {
        console.log(`Unblocking user with ID: ${userId}`);
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.json({ success: true });
        // console.log(`User unblocked successfully.`);

    } catch (error) {
        console.log(error);
    }
}


// product category
const productCatrgory = async (req, res) => {
    try {
        const data = req.query.success;
        const category = await Category.find();
        res.render("admin/page-category", { data: data, category: category })
    } catch (error) {
        console.log(error);
    }
}

const addProductCategory = async (req, res) => {
    try {
        const { categoryName, list } = req.body;

        const existingCategory = await Category.findOne({ name: categoryName });

        if (existingCategory) {

            return res.redirect("/adminhome/productCatrgory?error=DuplicateCategory");
        }


        const category = await Category.create({
            name: categoryName,
            list: list
        });
        res.redirect("/adminhome/productCatrgory?success=Category Added")
        //console.log(category);
    } catch (error) {
        console.log(error);
    }
}


const editCategoryLoad = async (req, res) => {
    try {
        const id = req.query.CategoryId;
        req.session.id = id
        const catData = await Category.findById({ _id: id })
        res.render("admin/page-editCategory", { editCat: catData });
    } catch (error) {
        console.log(error);
    }
}


const editedCategory = async (req, res) => {
    try {
        const name = req.body.name;
        // console.log(name);
        // console.log(req.session.id );
        const updatedCat = await Category.findOneAndUpdate({ _id: req.body.catId }, { $set: { name: name } })
        console.log('Request body:', req.body);


        res.redirect("/adminhome/productCatrgory")
    } catch (error) {
        console.log(error);
    }
}


const deletecategory = async (req, res) => {
    try {
        const id = req.query.catId
        const deleteCat = await Category.deleteOne({ _id: id })
        res.redirect("/adminhome/productCatrgory")
    } catch (error) {
        console.log(error);
    }
}

const unlistedCategory = async (req, res) => {
    const catId = req.params.catid;
    try {
        const isList = await Category.findByIdAndUpdate(catId, { $set: { isList: true } });
        console.log(isList);
        res.json({ success: true })
    } catch (error) {
        console.log(error);
    }
}

const listedCategory = async (req, res) => {
    const catId = req.params.catid;
    try {
        await Category.findByIdAndUpdate(catId, { isList: false })
        res.json({ success: true });


    } catch (error) {
        console.log(error);
    }
}


// products & image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
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
        const productData = await Products.find()
        res.render("admin/page-productList", { data: Pdata, productData: productData })

    } catch (error) {
        console.log(error);
    }
}


const addProductLoad = async (req, res) => {
    try {
        res.render("admin/page-addProduct")
    } catch (error) {
        console.log(error);
        res.render("admin/page-addProduct")
    }
}

const addProducts = async (req, res) => {
    try {
        console.log("hello opera");
        const {
            name,
            description,
            CategoryId,
            price,
            quantity,
            discount,

        } = req.body;
        const image = req.files.map(el=>el.filename)
        console.log(image)
        console.log(req.body.name,req.body.description);

        const product = {
            name:name,
            description:description,
            CategoryId:CategoryId,
            price:price,
            quantity:quantity,
            image:image,
        }
console.log("image",product.image);
        // Check if the product already exists
        const existingProduct = await Products.findOne({name:name,});
    
        if (existingProduct) {
            return res.redirect("/adminhome/products?error=Duplicate Product");
        }
        else{
            const newProduct = await Products.create(product);
            res.redirect("/adminhome/products?success=Product Added");
        }
        // If the product doesn't exist, add it to the database
    
    } catch (error) {
        console.error("Error adding product:", error);
        res.render("admin/page-addProduct", { error: "Error adding product. Please try again later." });
    }
};







module.exports = {
    dashboardLoad,
    customerLoad,
    edituserload,
    blockuser,
    unblockuser,
    productCatrgory,
    addProductCategory,
    productsLoad,
    editCategoryLoad,
    editedCategory,
    deletecategory,
    listedCategory,
    unlistedCategory,
    addProductLoad,
    addProducts,
    upload,
}