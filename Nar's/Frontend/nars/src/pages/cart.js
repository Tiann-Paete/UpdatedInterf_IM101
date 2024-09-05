import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import GCashModal from '../components/GCashModal';
import PayMayaModal from '../components/PayMayaModal';

const Cart = () => {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    deliveryAddress: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [formErrors, setFormErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [showPayMayaModal, setShowPayMayaModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    setBillingInfo({ ...billingInfo, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const calculateDelivery = () => {
    return 60.00;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = calculateDelivery();
  const total = subtotal + delivery;

  const validateForm = () => {
    const errors = {};
    Object.keys(billingInfo).forEach(key => {
      if (!billingInfo[key]) {
        errors[key] = 'This field is required';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      return;
    }
  
    if (paymentMethod === 'GCash') {
      setShowGCashModal(true);
    } else if (paymentMethod === 'PayMaya') {
      setShowPayMayaModal(true);
    }
  };

  const handleGCashPayment = async (fullName, gcashNumber) => {
    try {
      const response = await axios.post('http://localhost:8000/place-order', {
        billingInfo,
        paymentMethod: 'GCash',
        paymentDetails: { fullName, gcashNumber },
        cartItems,
        subtotal,
        delivery,
        total
      }, {
        withCredentials: true
      });
      if (response.data.success) {
        setOrderId(response.data.orderId);
        setShowAlert(true);
        clearCart();
        setShowGCashModal(false);
        setOrderPlaced(true); // Add this line to trigger the animation
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
    }
  };
  
  const handlePayMayaPayment = async (fullName, payMayaNumber) => {
    try {
      const response = await axios.post('http://localhost:8000/place-order', {
        billingInfo,
        paymentMethod: 'PayMaya',
        paymentDetails: { fullName, payMayaNumber },
        cartItems,
        subtotal,
        delivery,
        total
      }, {
        withCredentials: true
      });
      if (response.data.success) {
        setOrderId(response.data.orderId);
        setShowAlert(true);
        clearCart();
        setShowPayMayaModal(false);
        setOrderPlaced(true); // Add this line to trigger the animation
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
    }
  };

  const Alert = ({ onClose, orderId }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white p-8 rounded-lg max-w-md w-full ${orderPlaced ? 'animate-bounce' : ''}`}>
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Order Placed Successfully!</h2>
        <p className="mb-4">Your order has been placed. Order ID: {orderId}</p>
        <div className="flex justify-between">
          <button
            onClick={() => {
              router.push('/home');
              onClose();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Go Back to Home
          </button>
          <button
            onClick={() => {
              router.push(`/order-tracking/${orderId}`);
              onClose();
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Check Your Order
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8">
      <button 
        onClick={() => router.push('/home')} 
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Products
      </button>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Billing Address</h2>
          <form className="space-y-4 bg-gray-100 p-6 rounded-lg shadow-md">
            <div>
              <input 
                name="fullName" 
                value={billingInfo.fullName} 
                onChange={handleInputChange} 
                placeholder="Full Name" 
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
            </div>
            <div className="flex gap-2">
              <select className="w-20 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>63+</option>
              </select>
              <input 
                name="phoneNumber" 
                value={billingInfo.phoneNumber} 
                onChange={handleInputChange} 
                placeholder="Phone Number" 
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
            <div>
              <input 
                name="address" 
                value={billingInfo.address} 
                onChange={handleInputChange} 
                placeholder="Address" 
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  name="city" 
                  value={billingInfo.city} 
                  onChange={handleInputChange} 
                  placeholder="City" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
              </div>
              <div className="flex-1">
                <input 
                  name="stateProvince" 
                  value={billingInfo.stateProvince} 
                  onChange={handleInputChange} 
                  placeholder="State/Province/Region" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {formErrors.stateProvince && <p className="text-red-500 text-sm mt-1">{formErrors.stateProvince}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  name="postalCode" 
                  value={billingInfo.postalCode} 
                  onChange={handleInputChange} 
                  placeholder="Postal Code" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
              </div>
              <div className="flex-1">
                <select 
                  name="deliveryAddress" 
                  value={billingInfo.deliveryAddress} 
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="Home" className="text-gray-800">Home</option>
                  <option value="Work" className="text-gray-800">Work</option>
                </select>
              </div>
            </div>
          </form>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-700">Payment Method</h2>
          <div className="flex space-x-4">
            <button 
              onClick={() => setPaymentMethod('GCash')} 
              className={`p-2 border rounded flex items-center ${paymentMethod === 'GCash' ? 'border-orange-500' : ''}`}
            >
              <Image src="/ImageLogo/Gcash.png" alt="GCash" width={70} height={50} />
            </button>
            <button 
              onClick={() => setPaymentMethod('PayMaya')} 
              className={`p-2 border rounded flex items-center ${paymentMethod === 'PayMaya' ? 'border-orange-500' : ''}`}
            >
              <Image src="/ImageLogo/Paymaya.png" alt="PayMaya" width={100} height={100} />
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-orange-500">Your Order</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-4 p-4 border rounded">
              <Image src={item.image_url} alt={item.name} width={64} height={64} className="object-cover" />
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p>₱ {item.price}</p>
              </div>
              <div className="flex items-center">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                <span className="mx-2">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500">×</button>
            </div>
          ))}
          
          <div className="mt-8 space-y-2">
            <div className="flex justify-between"><span>Subtotal:</span><span>₱ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery:</span><span>₱ {delivery.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>₱ {total.toFixed(2)}</span></div>
          </div>
          
          <button 
            onClick={placeOrder} 
            className="w-3/4 mx-auto block bg-orange-500 text-white py-3 rounded-lg mt-8 hover:bg-orange-600 transition duration-300"
          >
            Place Order
          </button>
        </div>
      </div>
      {showAlert && <Alert onClose={() => setShowAlert(false)} orderId={orderId} />}
      <GCashModal
        isOpen={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onConfirm={handleGCashPayment}
        amount={total}
      />
      <PayMayaModal
        isOpen={showPayMayaModal}
        onClose={() => setShowPayMayaModal(false)}
        onConfirm={handlePayMayaPayment}
        amount={total}
      />
    </div>
  );
};

export default Cart;