import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added for routing
import AuthLayout from '../layout/AuthLayout';
import Input from '../common/Input';
import Button from '../common/Button';

export default function Login() { // Removed props, we use hooks now
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      // Simulate API Call
      setTimeout(() => {
        setIsLoading(false);
        // SENIOR TIP: Redirect to the Admin Dashboard upon success
        navigate('/admin'); 
      }, 1500);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Please enter your details to sign in."
      // Logo now takes us back to the root path "/"
      onLogoClick={() => navigate('/')}
    >
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email address" id="email" type="email" placeholder="name@domain.com"
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          error={errors.email}
        />
        <Input 
          label="Password" id="password" type="password" placeholder="••••••••"
          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
          error={errors.password}
        />
        
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          
          {/* Using Link for navigation is better for SEO and browser behavior */}
          <Link 
            to="/forgot-password" 
            className="text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link 
          to="/signup" 
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}