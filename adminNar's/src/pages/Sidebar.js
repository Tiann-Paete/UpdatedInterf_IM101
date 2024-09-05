import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { HiUserCircle, HiOutlineClipboardList, HiOutlineCube, HiOutlineChartSquareBar, HiLogout, HiMenuAlt3 } from 'react-icons/hi';
import { RadioGroup } from '@headlessui/react';

const Sidebar = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to track sidebar open/close
  const [selectedTab, setSelectedTab] = useState('dashboard'); // State to track selected tab

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/logout');
      router.push('/'); // Redirect to the login page after logout
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      {/* Burger Menu Icon */}
      <HiMenuAlt3 className="md:hidden fixed top-4 right-4 z-10 text-gray-800 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Sidebar */}
      <aside className={`md:w-64 bg-gray-800 text-white flex flex-col md:flex-row md:h-screen fixed left-0 top-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'transform-none' : '-translate-x-full'}`}>
        {/* Company Info */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <HiUserCircle className="w-14 h-14 mr-6" />
          <p className="font-semibold text-2xl">Nar's School Supplies</p>
        </div>
        {/* Menu Items */}
        <nav className="flex flex-col py-4 mt-6 md:mt-0">
          <RadioGroup value={selectedTab} onChange={setSelectedTab}>
            <RadioGroup.Option value="dashboard">
              {({ active, checked }) => (
                <a
                  href="#"
                  className={`flex items-center px-4 py-2 ${checked ? 'bg-gray-700' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
                >
                  <HiOutlineChartSquareBar className="w-6 h-6 mr-2" />
                  Dashboard
                </a>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="inventory">
              {({ active, checked }) => (
                <a
                  href="#"
                  className={`flex items-center px-4 py-2 ${checked ? 'bg-gray-700' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
                >
                  <HiOutlineCube className="w-6 h-6 mr-2" />
                  Inventory
                </a>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="sales">
              {({ active, checked }) => (
                <a
                  href="#"
                  className={`flex items-center px-4 py-2 ${checked ? 'bg-gray-700' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
                >
                  <HiOutlineClipboardList className="w-6 h-6 mr-2" />
                  Sales report
                </a>
              )}
            </RadioGroup.Option>
          </RadioGroup>
          <div className="h-px bg-gray-600 my-4"></div> {/* Separator Line */}
          <button onClick={handleLogout} className="flex items-center px-4 py-2 hover:bg-red-700">
            <HiLogout className="w-6 h-6 mr-2" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
