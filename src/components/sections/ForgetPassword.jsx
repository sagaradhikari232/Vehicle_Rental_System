import React, { useState } from 'react';
import AuthLayout from '../layout/AuthLayout';
import Input from '../common/Input';
import Button from '../common/Button';
import { Mail } from 'lucide-react';

export default function ForgotPassword({ onViewChange }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent recovery instructions to your email."
      onLogoClick={() => onViewChange('landing')}>
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-gray-600 mb-8">
            Didn't receive the email? Check your spam folder or try another email address.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">Try again</Button>
          <button onClick={() => onViewChange('login')} className="mt-6 text-sm font-medium text-gray-500 hover:text-orange-600">
            ← Back to log in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to reset your password.">
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email address" id="reset-email" type="email" placeholder="name@domain.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" isLoading={isLoading} className="mt-2">Send Reset Link</Button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={() => onViewChange('login')} className="text-sm font-medium text-gray-500 hover:text-orange-600">
          ← Back to log in
        </button>
      </div>
    </AuthLayout>
  );
}