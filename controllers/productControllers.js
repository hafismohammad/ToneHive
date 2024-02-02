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
        const id=req.params.id
        const category=await Category.find();
        const productData = await Products.findOne({_id:id})
        res.render("admin/page-editProdut", {productData:productData,category:category})
    } catch (error) {
        console.log(error);
    }
}

const editedProduct = async (req, res) => {  
    try {
      const name = req.body.name;
      const prodId = req.body.prodId;
      const duplicateProd = await Products.findOne({ name: name });
           if (duplicateProd) {
        return res.redirect("/admin/products"); 
      }
      
      const category = req.body.category;
      const description = req.body.description;
      const price = req.body.price;
      const quantity = req.body.quantity;
      const discount = req.body.discount;
      
      await Products.findByIdAndUpdate(prodId, {
        $set: {
          name: name, 
          category: category,
          description: description,
          price: price,
          quantity: quantity,
          discount: discount
        }
      });
  
      res.redirect("/admin/products");
    } catch (error) {
      console.log(error);
    }
  }
  



module.exports = {
    productsLoad,
    addProductLoad,
    addProducts,
    upload,
    listOrUnlistProducts,
    editProductLoad,
    editedProduct

}