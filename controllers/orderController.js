const { model } = require("mongoose");
const Order = require('../models/orderModel');
const { param } = require("../routes/userRoutes");
const Products = require("../models/productModel");

const orderList = async (req, res) => {
    try {
        const pages = req.query.page || 1
        const size = 5
        const pageSkip = (pages-1)*size
        const orderCount =  await Order.find().populate('userId').count()
        const numOfPages = Math.ceil(orderCount/size)
        const orderDetails = await Order.find().populate('userId').skip(pageSkip).limit(size)

        const currentPage = parseInt(pages,10)
        res.render("admin/page-orderList", { orderDetails: orderDetails ,numOfPages,currentPage});
    } catch (error) {
        console.log(error);
    }
};
const adminOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        
        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

     
        order.products.forEach(async (product) => {
        if (product.orderStatus !== 'cancelled') {
                await Order.updateOne(
                    { _id: orderId, 'products._id': product._id },
                    { $set: { 'products.$.orderStatus': status } }
                );
            }
            });

        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


const orderProductView = async (req, res) => {
    try {
        const orderId = req.params.id;

        const orderedItems = await Order.findById(orderId).populate('products.productId');

        if (!orderedItems) {
            return res.status(404).send('Order not found');
        }
        orderedItems.offerPrice = orderedItems.products[0].productId.price - ((orderedItems.products[0].productId.price * orderedItems.products[0].productId.discount) / 100)
        console.log(orderedItems);
        
        res.render('admin/page-viewProductsDetails', { orderedItems: orderedItems });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

const acceptReturn = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const productId = req.params.productId;
    
   
        const order = await Order.findById(orderId);
        const product = order.products.find(product => product._id.toString() === productId)

        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found in the order" });
        }
       
            if (product.orderStatus === "delivered") {
                product.orderStatus = "return pending";
      
            } else if (product.orderStatus === "return pending") {
                product.orderStatus = "returned";
            }
        await order.save();
        
    } catch (error) {
        console.log(error);
    }
};

const salesReports = async (req, res) => {
    try {
                                         // only render delivered orders
        const orders = await Order.find({ orderStatus: 'delivered' }).populate('userId products.productId').sort({createdAt:-1})

        res.render('admin/page-salesReport', { orders: orders });
    } catch (error) {
        console.log(error);
    }
}

const { format } = require('date-fns');

const orderReortDateWise = async (req, res) => {
    try {
        let { startingDate, endingDate } = req.body;
        startingDate = new Date(startingDate);
        endingDate = new Date(endingDate);
       console.log(startingDate, endingDate);
        const salesReport = await Order.find({ createdAt: { $gte: startingDate, $lte: endingDate }, orderStatus: 'delivered' }).populate('userId')
        // for (let i = 0; i < salesReport.length; i++) {
        //     salesReport[i].createdAt = dateFormat(salesReport[i].createdAt);
        //     salesReport[i].createdAt = format(salesReport[i].createdAt, 'yyyy-MM-dd HH:mm:ss');
        // }
        console.log(salesReport);
        res.status(200).json({ sales: salesReport }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};


module.exports = {
    orderList,
    adminOrderStatus,
    orderProductView,
    acceptReturn,
    salesReports,
    orderReortDateWise

}