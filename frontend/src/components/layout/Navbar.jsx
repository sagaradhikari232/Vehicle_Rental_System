import { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bike, LogOut, User } from 'lucide-react';
import Button from '../common/Button';
import UserMenuDropdown from '../common/UserMenuDro45pDown';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { smoothScrollToElement } from '../../utils/smoothScroll';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { name: 'Home',       href: '#home'       },
  { name: 'Categories', href: '#categories' },
  { name: 'Vehicles',      href: '#vehicles'      },
  { name: 'Contact Us', href: '#contact'    },
];

export default function Navbar() {
  const [isOpen,    setIsOpen]    = useState(false);
  const isScrolled  = useScrollPosition();
  const navigate    = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavClick = (href) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => smoothScrollToElement(href), 100);
    } else {
      smoothScrollToElement(href);
    }
    setIsOpen(false);
  };

  // Single helper for all navigate actions — closes mobile menu too
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const textStyle = isScrolled
    ? 'text-gray-700 hover:text-orange-600'
    : 'text-white/90 hover:text-white';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200 py-3'
          : 'bg-gradient-to-b from-black/60 to-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              RideOn
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`font-medium transition-all duration-300 ${textStyle}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenuDropdown
                user={user}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                isScrolled={isScrolled}
                bookingCount={0}
              />
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${textStyle}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${textStyle}`}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-1 rounded-lg transition-colors ${
              isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
            <div className="flex flex-col space-y-1">

              {NAV_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-left transition-colors"
                >
                  {link.name}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 mt-2">
                {isAuthenticated ? (
                  <>
                    {/* User info — reads user.fullname (correct backend field) */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden shrink-0">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullname ?? 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={18} className="text-orange-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.fullname ?? user?.username ?? 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigate('/account')}
                      className="flex items-center gap-3 text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-left transition-colors"
                    >
                      <User size={17} />
                      My Account
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-red-600 font-medium hover:bg-red-50 px-4 py-3 rounded-lg text-left transition-colors mt-1"
                    >
                      <LogOut size={17} />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleNavigate('/login')}
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Log in
                    </Button>
                    <Button
                      onClick={() => handleNavigate('/signup')}
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>  
        )}
      </div>
    </nav>
  );
}