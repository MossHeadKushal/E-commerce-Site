import express from 'express'
import {placeOrder, placeOrderKhalti, allOrders, userOrders, updateStatus, getTracking, updateTracking, cancelOrder} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/update-tracking', adminAuth, updateTracking)

// payment features
orderRouter.post('/place', authUser, placeOrder )
orderRouter.post('/khalti', authUser, placeOrderKhalti)

//user featuress
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/tracking', authUser, getTracking)
orderRouter.post('/cancel', authUser, cancelOrder)

export default orderRouter