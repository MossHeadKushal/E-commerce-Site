import React, { useContext, useEffect, useState } from 'react'
import { shopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const TrackOrder = () => {
  const { backendUrl, token, currency } = useContext(shopContext);
  const [orderData, setOrderData] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [discounts, setDiscounts] = useState([])
  const [trackingData, setTrackingData] = useState(null)

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        let allOrdersItems = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrdersItems.push(item)
          })
        })
        setOrderData(allOrdersItems.reverse())
      }
    } catch (error) {
      console.log(error)
    }
  }

  const loadDiscounts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/discount/list')
      if (response.data.success) {
        setDiscounts(response.data.discounts)
      }
    } catch (error) {
      console.log('Error loading discounts:', error)
      // Fallback to static data if API fails
      setDiscounts([
        { code: 'WELCOME10', description: '10% off on first order', valid: true },
        { code: 'SUMMER20', description: '20% off on summer collection', valid: false },
      ])
    }
  }

  const getTracking = async (orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/tracking', { orderId }, { headers: { token } })
      if (response.data.success) {
        setTrackingData(response.data.tracking)
      }
    } catch (error) {
      console.log('Error getting tracking:', error)
      toast.error('Failed to load tracking information')
    }
  }

  useEffect(() => {
    loadOrderData()
    loadDiscounts()
  }, [token])

  const copyDiscountCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Discount code ${code} copied to clipboard!`)
    } catch (error) {
      toast.error('Failed to copy discount code')
    }
  }

  const trackOrder = (order) => {
    setSelectedOrder(order)
    getTracking(order.orderId)
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'TRACK'} text2={'ORDER'} />
      </div>

      <div className='my-10'>
        {/* Purchase History Section */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-4'>Purchase History</h3>
          <div>
            {orderData.map((item, index) => (
              <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-start gap-6 text-sm'>
                  <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                  <div>
                    <p className='sm:text-base font-medium'>{item.name}</p>
                    <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                      <p>{currency}{item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>
                    <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                    <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                  </div>
                </div>
                <div className='md:w-1/2 flex justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                    <p className='text-sm md:text-base'>{item.status}</p>
                  </div>
                  <button onClick={() => trackOrder(item)} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discounts Section */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-4'>Available Discounts</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {discounts.map((discount, index) => (
              <div 
                key={index} 
                className='border p-4 rounded cursor-pointer hover:bg-gray-50 transition-colors'
                onClick={() => copyDiscountCode(discount.code)}
              >
                <p className='font-medium'>{discount.code}</p>
                <p className='text-sm text-gray-600'>{discount.description}</p>
                <p className='text-sm'>
                  {discount.discountType === 'percentage' ? `${discount.value}% off` : `Rs. ${discount.value} off`}
                  {discount.minOrderAmount > 0 && ` (Min. Rs. ${discount.minOrderAmount})`}
                </p>
                <p className={`text-sm ${new Date(discount.validUntil) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                  {new Date(discount.validUntil) > new Date() ? 'Valid' : 'Expired'}
                </p>
                <p className='text-xs text-gray-500 mt-2'>Click to copy code</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-4'>Delivery Tracking</h3>
          {selectedOrder && trackingData ? (
            <div>
              <p className='mb-2'>Tracking order: {selectedOrder.name}</p>
              <p className='mb-2'>Status: {trackingData.status}</p>
              <p className='mb-2'>Estimated Delivery: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}</p>
              <div className='w-full h-64 bg-gray-200 rounded flex items-center justify-center'>
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.123456789012!2d${trackingData.currentLocation.lng - 0.01}!3d${trackingData.currentLocation.lat - 0.01}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a!2s${encodeURIComponent(trackingData.currentLocation.address)}!5e0!3m2!1sen!2snp!4v1234567890123!5m2!1sen!2snp`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Delivery Location"
                ></iframe>
              </div>
              <div className='mt-4'>
                <h4 className='font-medium mb-2'>Tracking History</h4>
                <div className='space-y-2'>
                  {trackingData.trackingHistory.map((entry, index) => (
                    <div key={index} className='flex items-center space-x-2 text-sm'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span>{entry.status} - {new Date(entry.timestamp).toLocaleString()}</span>
                      <span className='text-gray-500'>({entry.location.address})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Select an order to view tracking map.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackOrder