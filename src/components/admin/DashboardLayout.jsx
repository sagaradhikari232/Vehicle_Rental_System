import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'; // Added Outlet & useNavigate
import { 
  LayoutDashboard, Car, CalendarCheck, Users, 
  CreditCard, Settings, LogOut, Menu, X, Bell, Search 
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
  <Link 
    to={path}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
      ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    {!collapsed && <span className="font-medium">{label}</span>}
  </Link>
);

const DashboardLayout = () => { // Removed {children} prop
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Car, label: 'Vehicles', path: '/admin/vehicles' },
    { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.label : 'Admin';
  };

  const handleLogout = () => {
    // Add any cleanup here (like clearing localStorage)
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 
        ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="h-20 flex items-center justify-between px-6">
          {!isCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">V-Drive.</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 lg:block hidden">
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              {...item} 
              active={location.pathname === item.path}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="absolute bottom-8 w-full px-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-2 text-gray-500">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 w-64 text-sm"
              />
            </div>
            {/* ... other topbar items ... */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* --- CRITICAL CHANGE --- */}
        <div className="p-8">
          {/* Outlet is where Dashboard.jsx or Vehicles.jsx will render */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;