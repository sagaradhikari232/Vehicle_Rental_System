import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link and useNavigate
import { Menu, X, Bike } from 'lucide-react';
import Button from '../common/Button';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { smoothScrollToElement } from '../../utils/smoothScroll';

const NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Categories', href: '#categories' },
  { name: 'Bikes', href: '#bikes' },
  { name: 'Contact Us', href: '#contact' }
];

export default function Navbar() { // Removed onAuthChange prop
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScrollPosition();
  const navigate = useNavigate(); // Initialize the navigation hook

  const handleNavClick = (href) => {
    // If we are not on the landing page, go there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Delay slightly to allow the home page to load before scrolling
      setTimeout(() => smoothScrollToElement(href), 100);
    } else {
      smoothScrollToElement(href);
    }
    setIsOpen(false);
  };

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
          {/* Logo - Now uses a Link for SEO and standard routing */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="RideOn home"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              RideOn
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`font-medium transition-all duration-300 relative group ${
                  isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')} // Directly navigate to path
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-400'
              }`}
            >
              Log-in
            </button>
            <button 
              onClick={() => navigate('/signup')} // Directly navigate to path
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-6 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
            <div className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-left"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 mt-2">
                <Button 
                  onClick={() => { navigate('/login'); setIsOpen(false); }}
                  className="bg-orange-500 w-full"
                >
                  Log-in
                </Button>
                <Button 
                  onClick={() => { navigate('/signup'); setIsOpen(false); }}
                  className="bg-orange-500 w-full"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}