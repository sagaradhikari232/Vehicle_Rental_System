import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Bike, CalendarCheck, Users, 
  CreditCard, Settings, LogOut, Menu, ChevronLeft, 
  Bell, Search, Command, Sun, Moon 
} from 'lucide-react';
import { useVehicles, useBookings, useUsers, usePayments } from '../../hooks/useDashboardData';

// ── Context — share fetched data with all child pages ──
export const DashboardDataContext = createContext(null);
export const useDashboardContext = () => useContext(DashboardDataContext);

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
  <Link 
    to={path}
    className={`
      relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${active 
        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}
    `}
  >
    {active && (
      <div className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full" />
    )}
    <Icon 
      size={20} 
      strokeWidth={active ? 2.5 : 2} 
      className={`transition-colors ${active ? 'text-amber-600' : 'group-hover:text-amber-500'}`}
    />
    {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
  </Link>
);

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const location = useLocation();
  const navigate = useNavigate();

  // ── Fetch all resources ──
  const vehicles = useVehicles();
  const bookings = useBookings();
  const users    = useUsers();
  const payments = usePayments();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    // { icon: Car, label: 'Vehicles', path: '/admin/vehicles' },
    { icon: Bike, label: 'Vehicles', path: '/admin/vehicles' },
    { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    // { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.label : 'Admin';
  };

  return (
    // ── Wrap everything in the context provider ──
    <DashboardDataContext.Provider value={{ vehicles, bookings, users, payments }}>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-20 flex items-center px-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100 dark:shadow-none">
                <Bike className="text-amber-950" size={22} strokeWidth={2.5} />
              </div>
              {!isCollapsed && <span className="text-xl font-black tracking-tighter dark:text-white">RideOn</span>}
            </div>
          </div>

          <nav className="px-4 space-y-1.5">
            {menuItems.map((item) => (
              <SidebarItem key={item.path} {...item} active={location.pathname === item.path} collapsed={isCollapsed} />
            ))}
          </nav>

          <div className="absolute bottom-6 w-full px-4 space-y-2">
            <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl w-full transition-all group">
              <LogOut size={20} />
              {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
            </button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl w-full transition-all">
              <ChevronLeft size={20} className={isCollapsed ? 'rotate-180' : ''} />
              {!isCollapsed && <span className="font-bold text-sm">Collapse View</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-20 flex items-center justify-between px-8 transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400">
                <Menu size={24} />
              </button>
              <h1 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 rounded-xl hover:ring-2 ring-amber-400/20 transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800 group cursor-pointer">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-bold dark:text-slate-200">MRS</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Admin</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </DashboardDataContext.Provider>
  );
};

export default DashboardLayout;