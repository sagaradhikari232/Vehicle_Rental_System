import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, id, error, type = 'text', ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none focus:ring-2 
            ${error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
              : 'border-gray-300 focus:ring-orange-100 focus:border-orange-500 hover:border-gray-400'
            }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}