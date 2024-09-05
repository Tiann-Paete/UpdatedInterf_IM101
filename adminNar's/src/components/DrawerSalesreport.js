import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DrawerSalesreport = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderDate, setNewOrderDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/orders');
      // Sort orders by date, most recent first
      const sortedOrders = response.data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/orders/${id}/status`, { status: newStatus });
      if (newStatus === 'Cancelled') {
        // Schedule deletion after 8 hours
        setTimeout(() => deleteOrder(id), 8 * 60 * 60 * 1000);
      } else if (newStatus === 'Delivered') {
        // Schedule deletion from sales report after 5 hours
        setTimeout(() => removeFromSalesReport(id), 5 * 60 * 60 * 1000);
      }
      fetchOrders();
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/orders/${id}`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const removeFromSalesReport = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/orders/${id}/salesreport`);
      fetchOrders();
    } catch (error) {
      console.error("Error removing order from sales report:", error);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleEditClick = () => {
    const checkedOrder = orders.find(order => order.isChecked);
    if (checkedOrder && ['Processing', 'Shipped', 'Delivered'].includes(checkedOrder.status)) {
      setSelectedOrder(checkedOrder);
      setNewOrderDate(checkedOrder.order_date);
      setShowEditModal(true);
    } else {
      alert('Please select a valid order to edit.');
    }
  };

  const handleCheckboxChange = (id) => {
    setOrders(orders.map(order => ({
      ...order,
      isChecked: order.id === id ? !order.isChecked : false
    })));
  };

  const handleSaveEdit = async () => {
    try {
      // Only update the order date, not the status
      await axios.put(`http://localhost:8000/orders/${selectedOrder.id}`, { order_date: newOrderDate });
      setShowEditModal(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order date:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone_number.includes(searchTerm)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'text-orange-500';
      case 'Shipped': return 'text-orange-600';
      case 'Delivered': return 'text-green-600';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="relative max-w-xs">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500"
            placeholder="Search for orders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button onClick={handleEditClick} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State/Province</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postal Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Fee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOrders.map((order) => (
              <tr 
                key={order.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={order.isChecked || false}
                    onChange={() => handleCheckboxChange(order.id)}
                    disabled={!['Processing', 'Shipped', 'Delivered'].includes(order.status)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.phone_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.state_province}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.postal_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery_address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.payment_method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.subtotal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery_fee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.order_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tracking_number}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => toggleDropdown(order.id)}
                      className="text-gray-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    {openDropdownId === order.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                        <button onClick={() => handleStatusChange(order.id, 'Processing')} className="block px-4 py-2 text-sm text-orange-500 hover:bg-gray-100 w-full text-left">Processing</button>
                        <button onClick={() => handleStatusChange(order.id, 'Shipped')} className="block px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 w-full text-left">Shipped</button>
                        <button onClick={() => handleStatusChange(order.id, 'Delivered')} className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left">Delivered</button>
                        <button onClick={() => handleStatusChange(order.id, 'Cancelled')} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">Cancel</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        ordersPerPage={ordersPerPage}
        totalOrders={filteredOrders.length}
        paginate={paginate}
        currentPage={currentPage}
      />

{showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Order Date</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Order ID: {selectedOrder.id}
                </p>
                <p className="text-sm text-gray-500">
                  Current Status: {selectedOrder.status}
                </p>
                <input
                  type="datetime-local"
                  value={newOrderDate}
                  onChange={(e) => setNewOrderDate(e.target.value)}
                  className="mt-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ ordersPerPage, totalOrders, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalOrders / ordersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex">
        {pageNumbers.map(number => (
          <li key={number} className="mx-1">
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DrawerSalesreport;