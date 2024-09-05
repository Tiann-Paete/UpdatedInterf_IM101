import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/all-orders', { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching orders');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.post(`http://localhost:8000/cancel-order/${orderId}`, {}, { withCredentials: true });
        fetchOrders(); // Refresh the order list
      } catch (error) {
        console.error('Error cancelling order:', error);
        setError(error.response?.data?.error || 'An error occurred while cancelling the order');
      }
    }
  };

  return (
    <div className="container mx-auto p-8">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className={`mb-4 p-4 border rounded ${order.status === 'Cancelled' ? 'bg-red-100' : ''}`}>
              <div className="flex justify-between items-center">
                <p className="font-bold">Order ID: {order.id}</p>
                {order.status === 'Delivered' && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Delivered</span>
                )}
                {order.status === 'Cancelled' && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Cancelled</span>
                )}
              </div>
              <p>Tracking Number: {order.tracking_number}</p>
              <p>Status: <span className={order.status === 'Cancelled' ? 'text-red-500 font-bold' : ''}>{order.status}</span></p>
              <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Total: ₱{order.total.toFixed(2)}</p>
              <button 
                onClick={() => router.push(`/order-tracking/${order.id}`)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                View Details
              </button>
              {order.status === 'Order Placed' && (
                <button 
                  onClick={() => handleCancelOrder(order.id)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel Order
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderTracking;