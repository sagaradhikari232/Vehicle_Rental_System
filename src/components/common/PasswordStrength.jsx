import React from 'react';

export default function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length > 7) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const strengthMap = [
    { color: 'bg-red-500', width: 'w-1/4', text: 'Weak' },
    { color: 'bg-yellow-500', width: 'w-2/4', text: 'Fair' },
    { color: 'bg-indigo-400', width: 'w-3/4', text: 'Good' },
    { color: 'bg-green-500', width: 'w-full', text: 'Strong' },
  ];

  const current = strengthMap[Math.max(0, score - 1)];

  return (
    <div className="mt-2 mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Password strength</span>
        <span className={`text-xs font-medium ${current.color.replace('bg-', 'text-')}`}>
          {current.text}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${current.color} ${current.width}`} />
      </div>
    </div>
  );
}