import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bike, LogOut } from 'lucide-react';
import Button from '../common/Button';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { smoothScrollToElement } from '../../utils/smoothScroll';
import { useAuth } from '../../context/AuthContext'; // Import hook

const NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Categories', href: '#categories' },
  { name: 'Bikes', href: '#bikes' },
  { name: 'Contact Us', href: '#contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScrollPosition();
  const navigate = useNavigate();
  
  // Get Auth State and Logout function
  const { isAuthenticated, logout } = useAuth();

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

  const textStyle = isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200 py-3' : 'bg-gradient-to-b from-black/60 to-transparent py-6'
    }`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>RideOn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button key={link.name} onClick={() => handleNavClick(link.href)} className={`font-medium transition-all duration-300 ${textStyle}`}>
                {link.name}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Logic */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className={`flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50`}
              >
                <LogOut size={18} /> Logout
              </Button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className={`px-4 py-2 font-medium rounded-lg transition-colors ${textStyle}`}>
                  Log-in
                </button>
                <Button onClick={() => navigate('/signup')} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className={`md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-6 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
            <div className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <button key={link.name} onClick={() => handleNavClick(link.href)} className="text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-left">
                  {link.name}
                </button>
              ))}
              
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 mt-2">
                {isAuthenticated ? (
                  <Button onClick={handleLogout} className="bg-red-500 text-white w-full">Logout</Button>
                ) : (
                  <>
                    <Button onClick={() => { navigate('/login'); setIsOpen(false); }} variant="outline" className="w-full">Log-in</Button>
                    <Button onClick={() => { navigate('/signup'); setIsOpen(false); }} className="bg-orange-500 w-full">Sign Up</Button>
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