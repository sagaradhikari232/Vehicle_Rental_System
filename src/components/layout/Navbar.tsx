import { useState } from 'react';
import { Menu, X, Bike } from 'lucide-react';
import Button from '../common/Button';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { smoothScrollToElement } from '../../utils/smoothScroll';

const NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Categories', href: '#categories' },
  { name: 'Bikes', href: '#bikes' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScrollPosition();

  const handleNavClick = (href: string) => {
    smoothScrollToElement(href);
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
          <button
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={() => handleNavClick('#home')}
            aria-label="RideOn home"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              RideOn
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`font-medium transition-all duration-300 relative group ${
                  isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button size="md">Log-in</Button>
          </div>

          <button
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-gray-900 hover:text-orange-600' : 'text-white hover:text-orange-400'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 p-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 text-left px-4 py-3 rounded-lg"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Button size="md" className="w-full">
                  Book Now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}
