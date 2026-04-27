import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Client-side validation ---
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post('/users/login', {
        email: formData.email,
        password: formData.password,
      });

      const { user, accessToken } = res.data.data;

      // Store token and user info in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'admin' || user.role === 'owner') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ server: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Please enter your details to sign in."
      onLogoClick={() => navigate('/')}
    >
      <form onSubmit={handleSubmit}>
        {/* Server error */}
        {errors.server && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.server}
          </div>
        )}

        <Input
          label="Email address"
          id="email"
          type="email"
          placeholder="name@domain.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>

          <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}