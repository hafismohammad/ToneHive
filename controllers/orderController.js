const { model } = require("mongoose");
const Order = require('../models/orderModel')
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
        const statusDetails = req.params.id
        const { orderId, status, nextButtonValue } = req.body;

        console.log(req.body);

        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });

       
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

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

        res.render('admin/page-viewProductsDetails', { orderedItems: orderedItems });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};


module.exports = {
    orderList,
    adminOrderStatus,
    orderProductView
}