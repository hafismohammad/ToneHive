// const { resolve } = require("path");
// const categoryModel = require("../models/categoryModel");
// const categorySema = require("../models/categoryModel");
// const { rejects } = require("assert");

// module.exports = {



// addCatagoryToDb: (body) => {
//     return new Promise( async (resolve, reject) => {
//         try {
            
//             let name = body.categoryName;
//             let oldcategory = await categorySema.findOne({name: body.categoryName});
//             if(oldcategory){
//                 resolve({ status: false });
//             }else{
//                 const newCategory = new categorySema({
//                     name: body.categoryName,
//                     description: body.categoryDescriptin
//                 });
//                 await newCategory.save();
//                 resolve({ status: true })

//             }

//         } catch (error) {
//             console.log(error);
//         }

//     })
// },

// getAllcategory: () => {
// return new Promise(async (resolve, reject) => {
//     await categorySema.findOne()
//     .then((result) => {
//         resolve(result)
//     })
// })
// },

// softDeleteCategory: async (categoryId) => {
//     return new Promise( async (resolve, reject) => {
//        let catogery = await categorySema.findById({_id: categoryId});


//        catogery.status = !catogery.status;
//        category.save()
//        resolve(category)
//     })
// }



// }