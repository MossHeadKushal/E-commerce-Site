import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {

  const { backendUrl, token, currency} = useContext(shopContext);

  const [orderData, setOrderData] = useState([])
  const navigate = useNavigate()

  const loadOrderData = async() => {
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
            item['orderAmount'] = order.amount
            item['orderDiscount'] = order.discountApplied || null
            allOrdersItems.push(item)
          })
        })
        setOrderData(allOrdersItems.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to load orders')
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const confirmCancel = window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')
      if (!confirmCancel) return

      const response = await axios.post(backendUrl + '/api/order/cancel', { orderId }, { headers: { token } })
      
      if (response.data.success) {
        toast.success('Order cancelled successfully')
        loadOrderData() // Refresh the orders list
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to cancel order')
    }
  }

  useEffect(()=>{
    loadOrderData()
  },[token])

  return (
    <div className='border-t pt-16 pb-16'>
      <div className='mb-6'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {orderData.length === 0 ? (
        <div className='rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600'>
          No orders found yet.
        </div>
      ) : (
        <div className='space-y-4'>
          {orderData.map((item, index) => (
            <div key={item.orderId + '-' + index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image?.[0]} alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                  </div>
                  <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                  <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                  {item.orderDiscount && (
                    <p className='mt-1 text-green-700'>Discount ({item.orderDiscount.code}): -{currency}{item.orderDiscount.amount}</p>
                  )}
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <span className={`min-w-2 h-2 rounded-full ${item.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <button onClick={() => navigate('/track-order')} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                  {item.status !== 'Cancelled' && item.status !== 'Shipped' && item.status !== 'Delivered' && (
                    <button onClick={() => cancelOrder(item.orderId)} className='border px-4 py-2 text-sm font-medium rounded-sm text-red-600 border-red-200'>Cancel</button>
                  )}
                  <div className='text-right'>
                    <p className='text-sm text-gray-500'>Order Total</p>
                    <p className='font-semibold'>{currency}{item.orderAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
