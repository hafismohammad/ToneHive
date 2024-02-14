const Category = require("../models/categoryModel");


// product category
const productCatrgory = async (req, res) => {
    try {
        const data = req.query.success;
        const error = req.query.error || ''
       
        const category = await Category.find()
        res.render("admin/page-category", {  data: data,error:error, category: category })
    } catch (error) {
        console.log(error);
    }
}

const addProductCategory = async (req, res) => {
    try {
        const { categoryName, list } = req.body;

        const existingCategory = await Category.findOne({ name: categoryName })

        if (existingCategory) {

            return res.redirect("/admin/productCatrgory?error=DuplicateCategory");

        }


        const category = await Category.create({
            name: categoryName,
            list: list
        });
        
        res.redirect("/admin/productCatrgory?success=Category Added")
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
        const catId = req.body.catId;

        // Check if the new category name already exists
        const existingCat = await Category.findOne({ name: name });
        if (existingCat) {
            return res.redirect("/admin/productCatrgory?error=Duplicate Category");
        }

        // Update the category
        const updatedCat = await Category.findByIdAndUpdate(catId, { name: name }, { new: true });
        console.log(existingCat);
        console.log(updatedCat);
        res.redirect("/admin/productCatrgory");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
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
    unlistedCategory,
    listedCategory



}