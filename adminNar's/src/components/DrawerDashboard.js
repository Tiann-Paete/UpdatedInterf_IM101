import React from 'react';

const DrawerDashboard = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 hover:text-white">
      </button>
      {/* Dashboard Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        {/* Add your dashboard content here */}
      </div>
    </div>
  );
};

export default DrawerDashboard;
