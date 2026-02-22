import { Bike, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Our Team', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'News', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Safety Tips', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
    rental: [
      { name: 'How It Works', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Locations', href: '#' },
      { name: 'FAQs', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer id="contact" className="bg-gradient-to-b from-gray-950 to-black text-white border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">RideOn</span>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed text-sm">
              Your trusted partner for premium bike rentals. Experience the freedom of the road with our top-quality bikes and exceptional service.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300 group cursor-pointer hover:text-orange-400 transition-colors">
                <div className="bg-gray-800 group-hover:bg-orange-500/20 p-3 rounded-lg mr-4 transition-colors">
                  <Phone className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm">+977 9811563700</span>
              </div>
              <div className="flex items-center text-gray-300 group cursor-pointer hover:text-orange-400 transition-colors">
                <div className="bg-gray-800 group-hover:bg-orange-500/20 p-3 rounded-lg mr-4 transition-colors">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm">info@rideon.com</span>
              </div>
              <div className="flex items-start text-gray-300 group cursor-pointer hover:text-orange-400 transition-colors">
                <div className="bg-gray-800 group-hover:bg-orange-500/20 p-3 rounded-lg mr-4 transition-colors flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm">Butwal Multiple Campus</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Rental</h3>
            <ul className="space-y-3">
              {footerLinks.rental.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {currentYear} RideOn. All rights reserved. Made with passion for riders.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 p-2.5 rounded-full transition-all duration-300 group hover:shadow-lg hover:shadow-orange-500/50"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
