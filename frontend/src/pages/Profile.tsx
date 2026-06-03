import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { shopContext } from '../context/ShopContext';
import Title from '../components/Title';

type OrderItem = {
  _id?: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string[];
};

type Order = {
  _id: string;
  date: number;
  paymentMethod: string;
  status: string;
  amount: number;
  address?: {
    line1?: string;
    address?: string;
  };
  items: OrderItem[];
};

const Profile = () => {
  const { token, backendUrl, userName } = useContext(shopContext);
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) return;

      const response = await axios.post(
        backendUrl + '/api/user/profile',
        {},
        {
          headers: {
            token: authToken,
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.data.success) {
        setUserEmail(response.data.user.email);
      } else {
        toast.error(response.data.message || 'Unable to load profile information.');
      }
    } catch (error) {
      console.log(error);
      toast.error('Unable to load profile information.');
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('token');
      if (!authToken) return;

      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        {
          headers: {
            token: authToken,
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message || 'Unable to load purchase history.');
      }
    } catch (error) {
      console.log(error);
      toast.error('Unable to load purchase history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadProfile();
    loadOrders();
  }, [token]);

  if (!token) {
    return (
      <div className="pt-16 text-center text-gray-600">
        Please login to view your profile and order history.
      </div>
    );
  }

  return (
    <div className="border-t pt-16 pb-16">
      <div className="text-2xl">
        <Title text1="MY" text2="PROFILE" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Account details</h2>
          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="mt-1 text-lg font-medium">{userName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="mt-1 text-lg font-medium">{userEmail || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Orders</p>
              <p className="mt-1 text-lg font-medium">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xl font-semibold text-gray-800">Purchase history</p>
              <p className="text-sm text-gray-500">
                {orders.length > 0
                  ? `${orders.length} order${orders.length === 1 ? '' : 's'} found`
                  : 'No purchases yet.'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading && <p className="text-gray-500">Loading order history...</p>}

            {!loading && orders.length === 0 && (
              <p className="text-gray-500">You haven’t placed any orders yet.</p>
            )}

            {!loading && orders.map((order) => (
              <div key={order._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order._id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()} • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
                    {order.status}
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item._id || item.name}-${item.size}-${index}`}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {item.image?.[0] && (
                          <img
                            src={item.image[0]}
                            alt={item.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                        <p className="text-gray-500">Item total</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-gray-600 sm:flex-row sm:justify-between">
                  <p>Total amount: <span className="font-semibold text-gray-800">₹{order.amount}</span></p>
                  <p>Delivery address: <span className="text-gray-700">{order.address?.line1 || order.address?.address || 'N/A'}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
