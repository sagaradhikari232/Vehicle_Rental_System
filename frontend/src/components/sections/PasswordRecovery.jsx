const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!email) return setError('Email is required');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentView('check-email');
      }, 1000);
    };

    return (
      <AuthLayout title="Forgot password?" subtitle="No worries, we'll send you reset instructions.">
        <form onSubmit={handleSubmit}>
          <Input 
            label="Email address" id="reset-email" type="email" placeholder="name@company.com"
            value={email} onChange={(e) => {setEmail(e.target.value); setError('');}}
            error={error}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">Reset Password</Button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setCurrentView('login')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Back to log in
          </button>
        </div>
      </AuthLayout>
    );
  };

  const CheckEmail = () => (
    <AuthLayout title="Check your email" subtitle="We sent a password reset link to your email.">
      <div className="flex flex-col items-center justify-center py-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-indigo-600" />
        </div>
        <p className="text-center text-sm text-gray-600 mb-8">
          Didn't receive the email? Check your spam filter, or try resending.
        </p>
        <Button onClick={() => setCurrentView('reset')}>Simulate Link Click</Button>
        <div className="mt-6">
          <button onClick={() => setCurrentView('login')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Back to log in
          </button>
        </div>
      </div>
    </AuthLayout>
  );

  const ResetPassword = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      const newErrors = {};
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          showToast('Password reset successfully! You can now log in.');
          setCurrentView('login');
        }, 1500);
      }
    };

    return (
      <AuthLayout title="Set new password" subtitle="Your new password must be different to previously used passwords.">
        <form onSubmit={handleSubmit}>
          <Input 
            label="New Password" id="new-password" type="password" placeholder="••••••••"
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            error={errors.password}
          />
          {formData.password && <PasswordStrength password={formData.password} />}
          <Input 
            label="Confirm Password" id="confirm-new-password" type="password" placeholder="••••••••"
            value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            error={errors.confirmPassword}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">Reset Password</Button>
        </form>
      </AuthLayout>
    );
  };