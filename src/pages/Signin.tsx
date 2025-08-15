import React, { useState } from 'react';
import { 
  Eye, EyeOff, ArrowLeft, Mail, Lock, User, 
  Chrome, Check, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPages = () => {
  const [currentPage, setCurrentPage] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (currentPage === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Please accept the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log(`${currentPage} form submitted:`, formData);
    }, 2000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      setIsLoading(false);
      console.log('Google auth initiated');
    }, 1500);
  };

  const InputField = ({ 
    type, 
    placeholder, 
    value, 
    onChange, 
    icon: Icon, 
    error,
    showPasswordToggle = false,
    showPassword: isPasswordVisible,
    onPasswordToggle
  }) => (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-${showPasswordToggle ? '12' : '4'} py-3 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 ${
            error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {isPasswordVisible ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  const SignInPage = () => (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="/images/logo.svg"
                alt="KENIC Logo"
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-xs text-gray-600">Get Your .KE Today!</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-12 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-3 text-red-600" />
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <InputField
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              icon={Mail}
              error={errors.email}
            />

            <InputField
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              icon={Lock}
              error={errors.password}
              showPasswordToggle
              showPassword={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('signup')}
                className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Chrome className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-bold">Secure & Fast</h3>
            <p className="text-red-100 text-lg leading-relaxed">
              Access your .KE domain management with enterprise-grade security and lightning-fast performance.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Two-factor authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>SSL encrypted connections</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>24/7 account monitoring</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>
    </div>
  );

  const SignUpPage = () => (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-bold">Join .KE Community</h3>
            <p className="text-red-100 text-lg leading-relaxed">
              Create your account and start managing your .KE domains with professional tools and expert support.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Free domain management tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Expert technical support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Priority customer service</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <button
              onClick={() => setCurrentPage('signin')}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to sign in</span>
            </button>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="/images/logo.svg"
                alt="KENIC Logo"
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-xs text-gray-600">Get Your .KE Today!</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-600">Join thousands of .KE domain owners</p>
          </div>

          {/* Google Sign Up Button */}
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-12 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-3 text-red-600" />
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">or create with email</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <InputField
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(value) => handleInputChange('fullName', value)}
              icon={User}
              error={errors.fullName}
            />

            <InputField
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              icon={Mail}
              error={errors.email}
            />

            <InputField
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              icon={Lock}
              error={errors.password}
              showPasswordToggle
              showPassword={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            <InputField
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              icon={Lock}
              error={errors.confirmPassword}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    formData.acceptTerms 
                      ? 'bg-red-600 border-red-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {formData.acceptTerms && (
                      <Check className="h-3 w-3 text-white m-0.5" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-5">
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
                <div className="flex items-center space-x-1 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.acceptTerms}</span>
                </div>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentPage === 'signin' ? <SignInPage /> : <SignUpPage />}
    </div>
  );
};

export default AuthPages;