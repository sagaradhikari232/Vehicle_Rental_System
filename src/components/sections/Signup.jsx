import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added for routing
import AuthLayout from '../layout/AuthLayout';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordStrength from '../common/PasswordStrength';

export default function Signup() { // Removed props
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    terms: false 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.terms) newErrors.terms = 'You must accept the terms';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      // Simulate API Call
      setTimeout(() => {
        setIsLoading(false);
        // After signup, take them to login
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Start your bike rental journey today."
      onLogoClick={() => navigate('/')} // Navigate home
    >
      <form onSubmit={handleSubmit}>
        <Input 
          label="Full Name" id="name" placeholder="John Doe"
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          error={errors.name}
        />
        <Input 
          label="Email address" id="email" type="email" placeholder="name@domain.com"
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          error={errors.email}
        />
        <Input 
          label="Password" id="password" type="password" placeholder="Create a strong password"
          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
          error={errors.password}
        />
        {formData.password && <PasswordStrength password={formData.password} />}
        
        <Input 
          label="Confirm Password" id="confirmPassword" type="password" placeholder="Repeat your password"
          value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          error={errors.confirmPassword}
        />
        
        <div className="mb-6">
          <label className="flex items-start gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              checked={formData.terms} 
              onChange={(e) => setFormData({...formData, terms: e.target.checked})}
            />
            <span className="text-sm text-gray-600">
              I agree to the <Link to="/terms" className="text-orange-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>}
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}