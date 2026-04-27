import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    username: 'mohan',
    fullname: 'Mohan Rana',
    email: 'ranamohan@gmail.com',
    phone: '9811563780',
    password: 'ranamohan123',
    confirmPassword: 'ranamohan123',
    avatar: null,
    address: {
      province: 'Lumbini',
      district: 'Rupandehi',
      municipality: 'Butwal',
      wardNumber: '12',
      tole: 'Madannagar',
    },
    role: 'customer'
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors({ ...errors, [id]: null });
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [id]: value },
    }));
    if (errors[id]) setErrors({ ...errors, [id]: null });
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/))
        newErrors.email = 'Valid email is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be 8+ chars';
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
      const phoneRegex = /^(?:\+977[-\s]?)?(?:9[78]\d{8}|0[1-9]\d{6,8})$/;
      if (!phoneRegex.test(formData.phone))
        newErrors.phone = 'Enter a valid Nepali phone number (e.g. 98XXXXXXXX)';
      if (!formData.avatar) newErrors.avatar = 'Profile photo is required';
    }

    if (step === 3) {
      if (!formData.address.municipality.trim()) newErrors.municipality = 'Municipality is required';
      if (!formData.address.wardNumber) {
        newErrors.wardNumber = 'Ward is required';
      } else if (formData.address.wardNumber < 1 || formData.address.wardNumber > 35) {
        newErrors.wardNumber = 'Ward must be between 1 and 35';
      }
      if (!formData.address.tole.trim()) newErrors.tole = 'Tole is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Backend expects multipart/form-data because of avatar upload (multer)
      const data = new FormData();
      data.append('username', formData.username.toLowerCase());
      data.append('fullname', formData.fullname);
      data.append('email', formData.email.toLowerCase());
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      data.append('role', 'customer'); // default role

      // Address must be sent as nested fields OR JSON string
      // Your backend reads req.body.address as an object via express
      data.append('address[province]', formData.address.province);
      data.append('address[district]', formData.address.district);
      data.append('address[municipality]', formData.address.municipality);
      data.append('address[wardNumber]', formData.address.wardNumber);
      data.append('address[tole]', formData.address.tole);
      // Avatar file
      data.append('avatar', formData.avatar);

      await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ server: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Get Started' : step === 2 ? 'About You' : 'Your Location'}
      subtitle={`Step ${step} of 3`}
      onLogoClick={() => navigate('/')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Server error */}
        {errors.server && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.server}
          </div>
        )}

        {/* STEP 1: Account Setup */}
        {step === 1 && (
          <div className="space-y-4">
            <Input label="Username" id="username" value={formData.username} onChange={handleInputChange} error={errors.username} />
            <Input label="Email address" id="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Password" id="password" type="password" value={formData.password} onChange={handleInputChange} error={errors.password} />
              <Input label="Confirm" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
            </div>
          </div>
        )}

        {/* STEP 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-4">
            <Input label="Full Name" id="fullname" value={formData.fullname} onChange={handleInputChange} error={errors.fullname} />
            <Input label="Phone Number" id="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} placeholder="98XXXXXXXX" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
              <input
                type="file"
                accept="image/*"
                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 ${errors.avatar ? 'border border-red-400 rounded-md' : ''}`}
                onChange={(e) => {
                  setFormData({ ...formData, avatar: e.target.files[0] });
                  if (errors.avatar) setErrors({ ...errors, avatar: null });
                }}
              />
              {errors.avatar && <p className="mt-1.5 text-xs text-red-500">{errors.avatar}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Province</label>
                <select
                  id="province"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500"
                  value={formData.address.province}
                  onChange={handleAddressChange}
                >
                  <option value="Koshi">Koshi</option>
                  <option value="Madhesh">Madhesh</option>
                  <option value="Bagmati">Bagmati</option>
                  <option value="Gandaki">Gandaki</option>
                  <option value="Lumbini">Lumbini</option>
                  <option value="Karnali">Karnali</option>
                  <option value="Sudurpashchim">Sudurpashchim</option>
                </select>
              </div>
              <Input label="District" id="district" value={formData.address.district} onChange={handleAddressChange} error={errors.district} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input label="Municipality" id="municipality" value={formData.address.municipality} onChange={handleAddressChange} error={errors.municipality} placeholder="Butwal Sub-Metro" />
              </div>
              <Input label="Ward" id="wardNumber" type="number" value={formData.address.wardNumber} onChange={handleAddressChange} error={errors.wardNumber} placeholder="11" />
            </div>

            <Input label="Tole / Street" id="tole" value={formData.address.tole} onChange={handleAddressChange} error={errors.tole} placeholder="E.g. Devinagar" />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <Button type="button" onClick={handleBack} className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Next Step
            </Button>
          ) : (
            <Button type="submit" isLoading={isLoading} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Complete Registration
            </Button>
          )}
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}