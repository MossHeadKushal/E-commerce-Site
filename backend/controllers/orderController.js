// Placing orders using COD methos

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import axios from "axios";

// Placing orders using COD methos
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
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

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      status: "Pending",
      date: Date.now(),
      discountApplied: req.body.discountApplied || null,
    };

    for (const item of items) {
      await productModel.updateOne(
        { _id: item._id, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": -item.quantity } }
      );
    }

    const newOrder = new orderModel(orderData);
    await newOrder.save();

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
          Authorization: process.env.KHALTI_SECRET_KEY, // SECRET KEY
          "Content-Type": "application/json",
        },
      }
    );

    const body = response.data;

    if (body.payment_url) {
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
        discountApplied: req.body.discountApplied || null,
      });

      await newOrder.save();

      for (const item of items) {
        await productModel.updateOne(
          { _id: item._id, "sizes.size": item.size },
          { $inc: { "sizes.$.stock": -item.quantity } }
        );
      }

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

// Get tracking information for an order
const getTracking = async (req, res) => {
    try {
        const { orderId } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        // Mock real-time location updates (in production, this would come from GPS tracking)
        const mockLocations = [
            { lat: 27.7172, lng: 85.3240, address: 'Kathmandu, Nepal' },
            { lat: 27.7200, lng: 85.3300, address: 'Near Thamel, Kathmandu' },
            { lat: 27.7150, lng: 85.3200, address: 'Downtown Kathmandu' }
        ]

        const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]

        // Update tracking info
        order.tracking = order.tracking || {}
        order.tracking.currentLocation = randomLocation
        order.tracking.estimatedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now

        // Add to tracking history
        order.tracking.trackingHistory = order.tracking.trackingHistory || []
        order.tracking.trackingHistory.push({
            status: order.status,
            location: randomLocation,
            timestamp: new Date()
        })

        await order.save()

        res.json({
            success: true,
            tracking: {
                currentLocation: order.tracking.currentLocation,
                estimatedDelivery: order.tracking.estimatedDelivery,
                status: order.status,
                trackingHistory: order.tracking.trackingHistory
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update tracking location (for admin/delivery personnel)
const updateTracking = async (req, res) => {
    try {
        const { orderId, lat, lng, address } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        order.tracking = order.tracking || {}
        order.tracking.currentLocation = { lat, lng, address }
        order.tracking.trackingHistory = order.tracking.trackingHistory || []
        order.tracking.trackingHistory.push({
            status: order.status,
            location: { lat, lng, address },
            timestamp: new Date()
        })

        await order.save()
        res.json({ success: true, message: 'Tracking updated successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        const userId = req.body.userId

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        // Check if the order belongs to the user
        if (order.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized to cancel this order' })
        }

        // Check if order can be cancelled (not shipped or delivered)
        if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.json({ success: false, message: 'Order cannot be cancelled at this stage' })
        }

        // Update order status to cancelled
        order.status = 'Cancelled'
        await order.save()

        // If payment was made, you might want to process refund here
        // For COD orders, no refund needed
        // For Khalti payments, you would need to process refund through Khalti API

        res.json({ success: true, message: 'Order cancelled successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {placeOrder, placeOrderKhalti, allOrders, userOrders, updateStatus, getTracking, updateTracking, cancelOrder}