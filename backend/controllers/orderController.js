// Placing orders using COD methos

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import axios from "axios";

// Placing orders using COD methos
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // 🔹 Step 1: Check stock availability for each item + size
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }

      const sizeEntry = product.sizes.find((s) => s.size === item.size);
      if (!sizeEntry) {
        return res.json({
          success: false,
          message: `Size ${item.size} not found for ${product.name}`,
        });
      }

      if (sizeEntry.stock < item.quantity) {
        return res.json({
          success: false,
          message: `Not enough stock for ${product.name} (${item.size}). Available: ${sizeEntry.stock}`,
        });
      }
    }

    // 🔹 Step 2: Prepare order data
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      status: "Pending", // optional: keep consistency with Khalti
      date: Date.now(),
    };

    // 🔹 Step 3: Reduce stock safely (per size)
    for (const item of items) {
      await productModel.updateOne(
        { _id: item._id, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": -item.quantity } }
      );
    }

    // 🔹 Step 4: Save order
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // 🔹 Step 5: Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Placing orders using Khalti method
const placeOrderKhalti = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      address,
      purchase_order_id,
      purchase_order_name,
      customer_name,
      customer_email,
      customer_phone,
    } = req.body;

    // 🔹 Step 1: Check stock availability per size
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }

      const sizeEntry = product.sizes.find((s) => s.size === item.size);
      if (!sizeEntry) {
        return res.json({
          success: false,
          message: `Size ${item.size} not found for ${product.name}`,
        });
      }

      if (sizeEntry.stock < item.quantity) {
        return res.json({
          success: false,
          message: `Not enough stock for ${product.name} (${item.size}). Available: ${sizeEntry.stock}`,
        });
      }
    }

    // 🔹 Step 2: Initiate Khalti payment
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:5173/orders", // redirect after payment
        website_url: "https://example.com/",
        amount: parseInt(amount) * 100, // Rs -> paisa
        purchase_order_id,
        purchase_order_name,
        customer_info: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
        },
      },
      {
        headers: {
          Authorization: "Key live_secret_key_68791341fdd94846a146f0457ff7b455", // SECRET KEY
          "Content-Type": "application/json",
        },
      }
    );

    const body = response.data;

    if (body.payment_url) {
      // 🔹 Step 3: Save order as "Pending"
      const newOrder = new orderModel({
        userId,
        items,
        address,
        amount,
        paymentMethod: "Khalti",
        payment: false,
        status: "Pending",
        date: Date.now(),
        purchase_order_id,
      });

      await newOrder.save();

      // 🔹 Step 4: Reduce stock safely (per size)
      for (const item of items) {
        await productModel.updateOne(
          { _id: item._id, "sizes.size": item.size },
          { $inc: { "sizes.$.stock": -item.quantity } }
        );
      }

      // Clear user cart
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({
        success: true,
        payment_url: body.payment_url,
        orderId: newOrder._id,
      });
    } else {
      return res.json({
        success: false,
        message: "Failed to initiate Khalti payment",
        body,
      });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
};

// All orders data for Admin panel

const allOrders = async(req,res) =>{
try{
    const orders = await orderModel.find({})

    res.json({success:true, orders})
}
catch(error){
    console.log(error);
    res.json({success:false,message:error.message})
    
}
}

//All orders data for frontend

const userOrders = async(req,res) =>{
    try {
        
        const {userId} = req.body;

        const orders = await orderModel.find({userId})
        res.json({success:true, orders})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
        
    }
}

//update order status from admin panel

const updateStatus = async(req, res) =>{

    try {
        const {orderId, status} = req.body

        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success:true, message:'Ststus Updated'})
    } catch (error) {
         console.log(error);
        res.json({success:false, message:error.message})
    }

}

export {placeOrder, placeOrderKhalti, allOrders, userOrders, updateStatus}