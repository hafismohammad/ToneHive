const Category = require("../models/categoryModel");


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
       // console.log('Request body:', req.body);


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
       // console.log(isList);
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

module.exports ={
    productCatrgory,
    addProductCategory,
    editCategoryLoad,
    editedCategory,
    deletecategory,
    unlistedCategory,
    listedCategory



}