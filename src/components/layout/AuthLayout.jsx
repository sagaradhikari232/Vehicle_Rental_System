import React from 'react';
import { Bike } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle, onLogoClick }) {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-gray-900">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-700 rounded-full blur-3xl opacity-50" />
        
        {/* CLICKABLE LOGO DESKTOP */}
        <button 
          onClick={onLogoClick}
          className="relative z-10 flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Bike size={28} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">RideOn</span>
        </button>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Rent bikes easily, <br />hit the road faster.
          </h1>
          <p className="text-orange-100 text-lg">
            Join thousands of riders who trust us for their daily commutes and weekend adventures.
          </p>
        </div>

        <div className="relative z-10 text-sm text-orange-200">
          © {new Date().getFullYear()} RideOn Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          
          {/* CLICKABLE LOGO MOBILE */}
          <button 
            onClick={onLogoClick}
            className="flex lg:hidden items-center gap-2 mb-8 justify-center w-full hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-orange-600 rounded-xl">
              <Bike size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">RideOn</span>
          </button>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 text-sm">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}