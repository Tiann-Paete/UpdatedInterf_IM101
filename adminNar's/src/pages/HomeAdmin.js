import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { HiUserCircle, HiOutlineClipboardList, HiOutlineCube, HiOutlineChartSquareBar, HiLogout, HiMenuAlt3, HiX } from 'react-icons/hi';
import axios from 'axios';
import DrawerInventory from '../components/DrawerInventory';
import DrawerSalesreport from '../components/DrawerSalesreport';
import POSDashboard from '../components/POSDashboard';
import { RadioGroup } from '@headlessui/react';

const HomeAdmin = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard'); 
  const [showSidebar, setShowSidebar] = useState(true); 
  const sidebarRef = useRef(null); 
  const [showBurgerMenu, setShowBurgerMenu] = useState(false); 

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/logout');
      router.push('/'); 
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      if (window.innerWidth > 768) {
        setShowBurgerMenu(true);
      } else {
        setShowSidebar(false);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768); 
      if (window.innerWidth > 768) {
        setShowBurgerMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    document.addEventListener('mousedown', handleClickOutside); 

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside); 
    };
  }, []);

  return (
    <section className="min-h-screen flex">
      {/* Burger Menu Icon */}
      {showBurgerMenu && (
        <HiMenuAlt3 className="md:hidden fixed top-4 left-4 z-10 text-gray-800 cursor-pointer" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside ref={sidebarRef} className="w-64 bg-gray-800 text-white flex flex-col">
          {/* Close Button */}
          <button onClick={toggleSidebar} className="absolute top-2 right-2 text-white-300 hover:text-white">
            <HiX className="w-6 h-6" />
          </button>
          {/* Company Info */}
          <div className="flex items-center justify-between p-4">
            <HiUserCircle className="w-14 h-14 mr-6" />
            <p className="font-semibold text-2xl">Nar's School Supplies</p>
          </div>
          {/* Menu Items */}
          <nav className="flex flex-col py-4 mt-6">
            <RadioGroup value={selectedTab} onChange={setSelectedTab}>
              <RadioGroup.Option value="dashboard">
                {({ active, checked }) => (
                  <a
                    href="#"
                    className={`flex items-center px-4 py-2 ${
                      checked ? 'bg-gray-700' : ''
                    } ${active ? 'text-white' : 'text-gray-300'}`}
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
                    className={`flex items-center px-4 py-2 ${
                      checked ? 'bg-gray-700' : ''
                    } ${active ? 'text-white' : 'text-gray-300'}`}
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
                    className={`flex items-center px-4 py-2 ${
                      checked ? 'bg-gray-700' : ''
                    } ${active ? 'text-white' : 'text-gray-300'}`}
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
      )}

      {/* Main Content */}
     <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        {selectedTab === 'dashboard' && <POSDashboard />}
        {selectedTab === 'inventory' && <DrawerInventory />}
        {selectedTab === 'sales' && <DrawerSalesreport />}
      </main>
    </section>
  );
};

export default HomeAdmin;
