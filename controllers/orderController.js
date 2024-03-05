const { model } = require("mongoose");
const Order = require('../models/orderModel');
const { param } = require("../routes/userRoutes");
const Products = require("../models/productModel");

const orderList = async (req, res) => {
    try {
   
        const orderDetails = await Order.find().populate('userId');
    
        res.render("admin/page-orderList", { orderDetails: orderDetails });
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
       
        const orders = await Order.find().populate('userId products.productId').sort({createdAt:-1})

        res.render('admin/page-salesReport', { orders: orders });
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    orderList,
    adminOrderStatus,
    orderProductView,
    acceptReturn,
    salesReports

}