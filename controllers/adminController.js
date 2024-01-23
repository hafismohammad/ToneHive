const { render } = require("ejs");
const User = require("../models/userModel")
const Category = require("../models/categoryModel");
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
     // const userData = await User.find({isAdmin:0})
      const userData =await User.find();
        res.render("admin/page-customers",{user:userData})
    } catch (error) {
        console.log(error);
    }
}

const edituserload = async function(req, res) {
    
    const id=req.query.userid;
    req.session.id=id
    // console.log(id)
    const userData = await User.findById({_id:id});
    res.render('admin/page-editUser',{user:userData})
}

const edituser = async function(req, res) {
    try {
      
        id = req.session.id
        console.log(id);
        const name = req.body.name
        const email = req.body.email
        const updateduser = await User.findOneAndUpdate({email:email},{$set:{name:name , email:email }})

        res.redirect('/adminhome/customers')
    }
   
    catch (error) {
      console.log(error);
    }
    } 

    const deleteUser = async function(req, res) {
        try {
         const id = req.query.userid
         const deleteuser = await User.deleteOne({_id:id})
         res.redirect('/adminhome/customers')
        } catch (error) {
         console.log(error);
        }
     }
const blockuser = async (req, res) => {
    const userId = req.params.userid;
    console.log(userId);
try {
    await User.findByIdAndUpdate(userId,{$set:{isBlocked:true}});
    res.json({success:true});
   // console.log(`User blocked successfully.`);
} catch (error) {   
    console.log(error);

}}

const  unblockuser = async (req, res) => {
    const userId = req.params.userid;
    try {
        console.log(`Unblocking user with ID: ${userId}`);
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.json({success:true});
       // console.log(`User unblocked successfully.`);

    } catch (error) {
        console.log(error);
    }
}


// product category
const productCatrgory = async(req, res) =>{
try {
    const data = req.query.success;
    const category = await Category.find();
    res.render("admin/page-category", {data:data,category:category})
} catch (error) {
    console.log(error);
}
}

const  addProductCategory = async (req, res) => {
  try {
    const { categoryName, description, list} = req.body;
    console.log( categoryName, description, list);
    const existingCategory = await Category.findOne({ name: categoryName });

    if (existingCategory) {
       
        return res.redirect("/adminhome/productCatrgory?error=DuplicateCategory");
    }


    const category = await Category.create({
        name:categoryName,
        description, description,
        list:list
    });
    res.redirect("/adminhome/productCatrgory?success=Category Added")
    console.log(category);
  } catch (error) {
    console.log(error);
  }
}


const editCategoryLoad = async (req, res) => {
   try {
    const id = req.query.CategoryId;
    req.session.id=id
    const catData = await Category.findById({_id:id})
    res.render("admin/page-editCategory", {editCat:catData});
   } catch (error) {
    console.log(error);
   }
}


const editedCategory = async (req, res) => {
    try {
        id = req.session.id 
        const name = req.body.name;
        console.log(name);
        console.log(req.session.id );
       const updatedCat = await Category.findOneAndUpdate({_id:req.body.catId},{$set:{name:name}})
       console.log('Request body:', req.body);
     
   
       res.redirect("/adminhome/productCatrgory")
    } catch (error) {
        console.log(error);
    }
}


const deletecategory = async (req, res) =>{
    try {
    const id = req.query.catId
        const deleteCat = await Category.deleteOne({_id:id})
        res.redirect("/adminhome/productCatrgory")
    } catch (error) {
        console.log(error);
    }
}

const listedCategory = async (req, res) => {
    const catId = req.params.catid;
try {
    await Category.findByIdAndUpdate(catId,{$set:{isList:false}})
    res.json({success:true});
     
    
} catch (error) {
    console.log(error);
}
} 

const unlistedCategory = async (req, res) => {
    const catId = req.params.catid;
    try {
        await Category.findByIdAndUpdate(catId,{isList:true})
        res.json({success:true})
    } catch (error) {
        console.log(error);
    }
}


// products
const productsLoad = async (req, res) => {
    try {
        // const id = req.query.CategoryId;
        // req.session.id=id;
        // const categoryData = await Category.findById({_id:id})
        // console.log(categoryData);
        //  res.render("admin/page-editCategory", {cat:categoryData}) 
        
    } catch (error) {
        console.log(error);
    }
}
   


module.exports = {
    dashboardLoad,
    customerLoad,
    edituserload,
    edituser,
    deleteUser,
    blockuser,
    unblockuser,
    productCatrgory,
    addProductCategory,
    productsLoad,
    editCategoryLoad,
    editedCategory,
    deletecategory,
    listedCategory,
    unlistedCategory
}