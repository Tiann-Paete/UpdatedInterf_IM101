import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyDollar, HiShoppingCart, HiUsers, HiStar } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const POSDashboard = () => {
  const [salesData, setSalesData] = useState({
    salesToday: 0,
    periodSales: 0,
    totalOrders: 0,
    customersThisWeek: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [timeFrame, setTimeFrame] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
    fetchTopProducts();
  }, [timeFrame]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8000/sales-data?timeFrame=${timeFrame}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to fetch sales data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8000/top-products');
      setTopProducts(response.data);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError('Failed to fetch top products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `₱${value.toFixed(2)}` : '₱0.00';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Point of Sale Dashboard</h2>
      
      {/* Time frame selector */}
      <div className="flex space-x-4 mb-4">
        {['today', 'yesterday', 'lastWeek', 'lastMonth'].map((option) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded ${
              timeFrame === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setTimeFrame(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Sales statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<HiCurrencyDollar className="w-8 h-8" />}
          title="Sales Today"
          value={formatCurrency(salesData.salesToday)}
          animate={false}
        />
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-sales`}
            icon={<HiCurrencyDollar className="w-8 h-8" />}
            title={`Total ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Sales`}
            value={formatCurrency(salesData.periodSales)}
            animate={true}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-orders`}
            icon={<HiShoppingCart className="w-8 h-8" />}
            title="Total Orders"
            value={salesData.totalOrders || 0}
            animate={true}
          />
        </AnimatePresence>
        <StatCard
          icon={<HiUsers className="w-8 h-8" />}
          title="Customers this Week"
          value={salesData.customersThisWeek || 0}
          animate={false}
        />
      </div>

      {/* Top products */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4">Top Products</h3>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex items-center">
                <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    Sold: {product.sold || 0} | Rating: {(product.rating || 0).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <HiStar className="w-5 h-5 text-yellow-400 mr-1" />
                <span>{(product.rating || 0).toFixed(1)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ icon, title, value, animate }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
    initial={animate ? { opacity: 0, y: 20 } : false}
    animate={animate ? { opacity: 1, y: 0 } : false}
    exit={animate ? { opacity: 0, y: -20 } : false}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.05 }}
  >
    <div className="bg-blue-100 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </motion.div>
);

export default POSDashboard;