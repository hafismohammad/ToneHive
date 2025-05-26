const AddreddModel = require("../models/addressModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require("../models/orderModel");
const moment = require("moment");
const mongoose = require("mongoose");
const Products = require("../models/productModel");
const couponModel = require("../models/couponModel");
const offerModel = require("../models/offerModel");
const wishlistModel = require("../models/wishlistModel");
const { v4: uuidv4 } = require("uuid");

const { KEY_ID, KEY_SECRET } = process.env;

const Razorpay = require("razorpay");
const { log } = require("node:console");

var razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const amount = parseInt(req.body.totalPrice);

    console.log("amount", amount);

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: req.session.user,
    });
    console.log("order", order);

    res.json({ orderId: order });
  } catch (error) {
    console.log(error);
  }
};

const checkoutLoad = async (req, res) => {
  try {
    const message = req.query.message;
    const success = req.query.success;

    if (!req.session.user || !req.session.user._id) {
      throw new Error("User ID not found in session");
    }

    const userId = req.session.user._id;

    // Fetch user information
    const userInfo = await User.findOne({ _id: userId });

    // Fetch user addresses
    const userAddress = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$address" },
      {
        $project: {
          "address.name": 1,
          "address.house": 1,
          "address.city": 1,
          "address.state": 1,
          "address.country": 1,
          "address.pincode": 1,
          "address.mobile": 1,
          "address._id": 1,
        },
      },
    ]);

    // Fetch cart items
    const cartItems = await Cart.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$items" },
      { $project: { items: 1 } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    // Fetch active offer
    const activeOffer = await offerModel.findOne({ status: true });

    // Calculate offer price for each product in the cart
    let totalCartAmount = 0;
    const populatedCartItems = cartItems
      .map((cartItem) => {
        const product = cartItem.productDetails[0];
        let offerPrice = parseInt(product?.price || 0);
        if (product && product.price) {
          let appliedDiscount = 0;

          // Apply product offer
          if (
            activeOffer?.productOffer &&
            activeOffer.productOffer.product.toString() ===
              product._id.toString()
          ) {
            const productDiscount = activeOffer.productOffer.discount;
            const discountedPrice = (offerPrice * productDiscount) / 100;
            if (discountedPrice > appliedDiscount) {
              offerPrice -= discountedPrice;
              appliedDiscount = discountedPrice;
            }
          }

          // Apply category offer
          if (
            activeOffer?.categoryOffer &&
            activeOffer.categoryOffer.category.toString() ===
              product.category.toString()
          ) {
            const categoryDiscount = activeOffer.categoryOffer.discount;
            const discountedPrice = (offerPrice * categoryDiscount) / 100;
            if (discountedPrice > appliedDiscount) {
              offerPrice -= discountedPrice;
              appliedDiscount = discountedPrice;
            }
          }

          // Apply product discount
          if (product.discount > appliedDiscount) {
            const discountedPrice = (offerPrice * product.discount) / 100;
            if (discountedPrice > appliedDiscount) {
              offerPrice -= discountedPrice;
              appliedDiscount = discountedPrice;
            }
          }

          const subtotal = Math.round(offerPrice * cartItem.items.quantity);
          totalCartAmount += subtotal;

          return {
            ...cartItem,
            productDetails: product,
            subtotal: subtotal,
          };
        } else {
          console.error("Product or product price is undefined:", product);
          return null;
        }
      })
      .filter(Boolean); // remove null items

    // Get cart for total price and applied coupon
    const useCart = await Cart.findOne({ userId: userId });

    let totalCartPrice = 0;
    let appliedCoupon = null;

    if (useCart) {
      totalCartPrice = useCart.totalPrice || 0;
      appliedCoupon = useCart.coupon || null;
    } else {
      console.error("useCart is null or totalPrice undefined");
    }

    // Get active coupons
    const currentDate = new Date();
    let coupons = await couponModel
      .find({
        startDate: { $lte: currentDate },
        expiryDate: { $gte: currentDate },
        isActive: "Active",
      })
      .sort({
        expiryDate: 1,
        discount: -1,
      });

    // Ensure applied coupon is included in list even if already used
    if (appliedCoupon) {
      const applied = await couponModel.findOne({ code: appliedCoupon });
      if (applied && !coupons.some((c) => c.code === applied.code)) {
        coupons.push(applied);
      }
    }

    // Calculate cart item count
    const cartCount = cartItems.length;

    // Wishlist count
    const user = await User.findById(userId);
    const wishlistInfo = await wishlistModel.find({ user });
    let wishlistCount = 0;
    wishlistInfo.forEach((wishlist) => {
      wishlistCount += wishlist.products.length;
    });

    // Render checkout page
    res.render("user/page-checkout", {
      userId,
      useCart,
      userAddress,
      cartItems: populatedCartItems,
      totalCartPrice: totalCartAmount,
      totalPrice: totalCartPrice,
      userInfo,
      coupons,
      cartCount,
      message,
      success,
      wishlistCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, house, city, state, country, pincode, mobile } = req.body;
    const userId = req.session.user._id;

    const newAddress = {
      name: name,
      house: house,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
      mobile: mobile,
    };

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found");
    }
    user.address.push(newAddress);

    await user.save();

    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

const editAddressLoad = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user._id;
    const userAddress = await User.findOne(
      { _id: userId, "address._id": id },
      { "address.$": 1, _id: 0 }
    );

    res.render("user/page-editAddress", { userAddress });
  } catch (error) {
    console.log(error);
  }
};
const edittedAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.params.id;
    const { name, house, city, state, country, pincode, mobile } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.name": name,
          "address.$.house": house,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.pincode": pincode,
          "address.$.mobile": mobile,
        },
      },
      {
        new: true,
      }
    );

    if (updatedUser) {
      res.redirect("/checkout");
    } else {
      console.log("User address update failed.");
      res.status(404).send("User address update failed.");
    }
  } catch (error) {
    console.error("Error updating user address:", error);
    res
      .status(500)
      .send("Error updating user address. Please try again later.");
  }
};

function generateOrderId() {
  // Generate a random 6-digit number
  const generatedId = Math.floor(100000 + Math.random() * 900000); // Random number between 100000 and 999999

  return generatedId.toString();
}

const placeOrderPost = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { address, paymentMethod } = req.body;

    const userAddressId = new mongoose.Types.ObjectId(address);
    const userInfo = await User.findOne({ _id: userId });
    // Fetch user address
    const addressData = await User.findOne(
      { _id: userId, "address._id": address },
      { "address.$": 1, _id: 0 }
    );

    // Fetch cart items
    const cartItems = await Cart.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$items" },
      { $project: { items: 1 } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    const cartCoupon = await Cart.findOne({ userId: userId });
    // Initialize total cart price
    let totalCartPrice = 0;

    // Calculate offer price for each product in the cart
    for (const cartItem of cartItems) {
      const product = cartItem.productDetails[0];
      let offerPrice = product.price; // Initialize offer price with product price
      let appliedDiscount = 0; // Track the highest applied discount

      // Check if there is an active offer
      const activeOffer = await offerModel.findOne({ status: true });

      // Apply offer discount based on active offer
      if (activeOffer) {
        // Apply discount if product-specific offer exists and matches the current product
        // Apply discount if product-specific offer exists and matches the current product
        if (
          activeOffer.productOffer &&
          activeOffer.productOffer.product.toString() === product._id.toString()
        ) {
          const productDiscount = activeOffer.productOffer.discount;
          const discountedPrice = Math.round(
            (offerPrice * productDiscount) / 100
          ); // Round the discounted price

          if (discountedPrice > appliedDiscount) {
            offerPrice -= discountedPrice;
            appliedDiscount = discountedPrice;
          }
        }

        // Apply discount if category-specific offer exists and matches the current product category
        if (
          activeOffer.categoryOffer &&
          activeOffer.categoryOffer.category.toString() ===
            product.category.toString()
        ) {
          const categoryDiscount = activeOffer.categoryOffer.discount;
          const discountedPrice = Math.round(
            (offerPrice * categoryDiscount) / 100
          ); // Round the discounted price

          if (discountedPrice > appliedDiscount) {
            offerPrice -= discountedPrice;
            appliedDiscount = discountedPrice;
          }
        }
      }

      // Apply product discount
      if (product.discount > appliedDiscount) {
        const productDiscountedPrice = Math.round(
          (offerPrice * product.discount) / 100
        );

        if (productDiscountedPrice > appliedDiscount) {
          offerPrice -= productDiscountedPrice;
          appliedDiscount = productDiscountedPrice;
        }
      }

      // Calculate subtotal for the product
      const subtotal = Math.round(offerPrice * cartItem.items.quantity);
      totalCartPrice += subtotal;

      if (paymentMethod === "COD" && totalCartPrice > 1000) {
        return res
          .status(400)
          .json({
            error: "COD is not allowed for orders greater than 1000 rupees.",
          });
      }
      // Update the product details with offer price and subtotal
      cartItem.productDetails[0].offerPrice = offerPrice;
      cartItem.subtotal = subtotal;

      cartItem.productDetails[0].productPrice = product.offerPrice;
      console.log(product.offerPrice);
      cartItem.productDetails[0].productName = product.name;
      cartItem.productDetails[0].buyerName = userInfo.name;
    }
    const cartPrice = await Cart.findOne({ userId: userId });

    if (cartPrice.coupon !== null) {
      // Iterate through each item in the cart and update the product price
      cartPrice.items.forEach((item) => {
        // Check if product details exist
        if (item.productDetails) {
          // Update the product price with the total price from the cart
          item.productDetails.productPrice = cartPrice.totalPrice;
        }
      });
    }

    // console.log('Total Price:', cartPrice.totalPrice);

    // Decrease product quantity
    for (const cartItem of cartItems) {
      await Products.updateOne(
        { _id: cartItem.productDetails[0]._id },
        { $inc: { quantity: -cartItem.items.quantity } }
      );
    }

    // Define order status
    let status = paymentMethod === "COD" ? "confirmed" : "confirmed";

    const generatedId = generateOrderId();

    const failureStatus = req.body.status;
    if (failureStatus) {
      status = "payment pending";
    }
    // console.log(cartItems);
    cartItems.forEach((item) => {
      item.productDetails.forEach((product) => {
        product.orderStatus = status;
        console.log("Order status updated:", product.orderStatus);
      });
    });

    await Order.create({
      address: addressData.address[0],
      orderId: generatedId,
      userId: userId,
      paymentMethod: paymentMethod,
      products: cartItems.map((item) => ({
        productId: item.productDetails[0]._id,
        quantity: item.items.quantity,
        price: item.productDetails[0].price,
        productPrice: item.productDetails[0].offerPrice,
        productName: item.productDetails[0].productName,
        buyerName: item.productDetails[0].buyerName,
        orderStatus: status,
      })),
      totalPrice: totalCartPrice,
      couponPrice: cartCoupon ? cartCoupon.totalPrice : 0,
      orderStatus: status,
      createdAt: new Date(),
      coupon: cartCoupon ? cartCoupon.coupon : null,
    });

    // Clear the cart after placing the order
    await Cart.deleteOne({ userId: userId });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to place the order." });
  }
};

const orderPlace = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const lastOrder = await Order.findOne({ userId: userId }).sort({
      createdAt: -1,
    });

    res.render("user/page-orderSuccess", { lastOrder });
  } catch (error) {
    console.log(error);
  }
};
const paymentSuccess = async (req, res) => {
  try {
    const {
      paymentid,
      razorpayorderid,
      signature,
      orderId,
      address,
      paymentMethod,
      cartItems,
      totalCartPrice,
      cartCoupon,
    } = req.body;

    const { createHmac } = require("node:crypto");

    const hash = createHmac("sha256", "XViGIX1i2HyMgTUc0xt8xAir")
      .update(orderId + "|" + paymentid)
      .digest("hex");

    if (hash === signature) {
      console.log("Payment successful");
      res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      console.log(
        "Payment failed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      );

      res.status(200).json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const failedOrder = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const lastOrder = await Order.findOne({ userId: userId }).sort({
      createdAt: -1,
    });
    res.render("user/page-orderFailure", { lastOrder: lastOrder });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkoutLoad,
  addAddress,
  editAddressLoad,
  edittedAddress,
  generateOrderId,
  placeOrderPost,
  orderPlace,
  createOrder,
  paymentSuccess,
  failedOrder,
};
