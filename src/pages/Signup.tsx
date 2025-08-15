import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// React Icons for Email and Password
const MailIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

// KENIC Logo Component
const KenicLogo = ({ className = "w-12 h-12" }) => (
  <div className={`bg-red-600 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-white font-bold text-lg">.KE</span>
  </div>
);

const BASE_URL = 'https://api.digikenya.co.ke';

// InputField Component
const InputField = React.memo(({ id, type, placeholder, value, onChange, icon: Icon, error, showPasswordToggle, showPassword, onPasswordToggle }) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 ${
            error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl"
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input change without debounce for better responsiveness
  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_WEB_CLIENT_ID',
        callback: handleGoogleAuthResponse,
      });
      const signupButton = document.getElementById('google-signup-button');
      if (signupButton) {
        window.google.accounts.id.renderButton(signupButton, { theme: 'outline', size: 'large', width: 400 });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Please accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${BASE_URL}/customer/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Sign-up failed');
      }
      localStorage.setItem('access_token', data.id);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        created_at: data.created_at,
      }));
      navigate('/dashboard');
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthResponse = async (response) => {
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${BASE_URL}/customer/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Google authentication failed');
      }
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center p-8 text-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold">Join .KE Community</h3>
            <p className="text-red-100 text-base">
              Create your account and start managing your .KE domains with professional tools and expert support.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">Free domain management tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">Expert technical support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">Priority customer service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/signin')}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign in</span>
            </button>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <KenicLogo />
              <div>
                <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-xs text-gray-600">Get Your .KE Today!</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-600 text-sm">Join thousands of .KE domain owners</p>
          </div>
          {errors.api && (
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.api}</span>
            </div>
          )}
          <div id="google-signup-button" className="w-full"></div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">or create with email</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="signup-fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              icon={User}
              error={errors.fullName}
            />
            <InputField
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              icon={MailIcon}
              error={errors.email}
            />
            <InputField
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange('password')}
              icon={LockIcon}
              error={errors.password}
              showPasswordToggle
              showPassword={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />
            <InputField
              id="signup-confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              icon={LockIcon}
              error={errors.confirmPassword}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    id="signup-acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange('acceptTerms')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.acceptTerms ? 'bg-red-600 border-red-600' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {formData.acceptTerms && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errors.acceptTerms}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;