import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    discountApplied: {
      code: { type: String },
      amount: { type: Number }
    },
    tracking: {
        currentLocation: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String }
        },
        estimatedDelivery: { type: Date },
        trackingHistory: [{
            status: { type: String },
            location: {
                lat: { type: Number },
                lng: { type: Number },
                address: { type: String }
            },
            timestamp: { type: Date, default: Date.now }
        }]
    }
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;