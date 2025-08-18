import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Shield, Check, Mail, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// React Icons for Email and Password
const MailIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
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

function setCookie(name: string, value: string, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  const cookieString = `${name}=${value}; ${expires}; domain=.digikenya.co.ke; path=/; secure; samesite=lax`;
  console.log('Signin setCookie:', cookieString);
  document.cookie = cookieString;
  // Fallback: Store in sessionStorage for immediate access
  sessionStorage.setItem(name, value);
}

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

const OTPInput = ({ otp, setOtp, error }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-center space-x-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={otp[index] || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d*$/.test(value)) return;
              const newOtp = [...otp];
              newOtp[index] = value;
              setOtp(newOtp);
              if (value && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                if (nextInput) nextInput.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otp[index] && index > 0) {
                const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
                if (prevInput) prevInput.focus();
              }
            }}
            data-index={index}
            className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
      {error && (
        <div className="flex items-center justify-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const Signin = () => {
  const [currentStep, setCurrentStep] = useState('signin');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (currentStep === 'signin') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: '1086172926615-vtjrru158m0vgnt5s0aq8mdbjj49drub.apps.googleusercontent.com',
          callback: handleGoogleAuthResponse,
        });
        const signinButton = document.getElementById('google-signin-button');
        if (signinButton) {
          window.google.accounts.id.renderButton(signinButton, { theme: 'outline', size: 'large', width: 400 });
        }
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [currentStep]);

  const validateForm = () => {
    const newErrors = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${BASE_URL}/customer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      
      const data = await response.json();
      console.log('Signin: Login response:', data);
      
      if (!response.ok) {
        if (response.status === 403 && data.detail?.includes('verify your email')) {
          await handleResendVerification();
          setCurrentStep('verify');
          setErrors({ 
            info: 'Please verify your email address. We\'ve sent a verification code to your email.' 
          });
          return;
        }
        throw new Error(data.detail || 'Sign-in failed');
      }
      
      setCookie('access_token', data.access_token);
      setCookie('user', JSON.stringify({ email: formData.email }));
      if (data.refresh_token) {
        setCookie('refresh_token', data.refresh_token, 30);
      }
      
      setTimeout(() => {
        window.location.href = 'https://console.digikenya.co.ke/';
      }, 100);
      
    } catch (error) {
      console.error('Signin: Login error:', error);
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${BASE_URL}/customer/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, otp: otpString }),
      });
      
      const data = await response.json();
      console.log('Signin: OTP verify response:', data);
      
      if (!response.ok) {
        setVerificationAttempts(prev => prev + 1);
        throw new Error(data.detail || 'Invalid OTP');
      }
      
      const loginResponse = await fetch(`${BASE_URL}/customer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      
      const loginData = await loginResponse.json();
      console.log('Signin: Post-OTP login response:', loginData);
      
      if (loginResponse.ok) {
        setCookie('access_token', loginData.access_token);
        setCookie('user', JSON.stringify({ email: formData.email, is_email_verified: true }));
        if (loginData.refresh_token) {
          setCookie('refresh_token', loginData.refresh_token, 30);
        }
        setTimeout(() => {
          window.location.href = 'https://console.digikenya.co.ke/';
        }, 100);
      } else {
        setErrors({ success: 'Email verified successfully! Please try signing in again.' });
        setTimeout(() => {
          setCurrentStep('signin');
          setErrors({});
        }, 2000);
      }
      
    } catch (error) {
      console.error('Signin: OTP verify error:', error);
      setErrors({ otp: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${BASE_URL}/customer/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email }),
      });
      console.log('Signin: Resend verification response:', response.status);
      if (response.ok) {
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        setVerificationAttempts(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signin: Resend verification error:', error);
      return false;
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setErrors({});
    
    const success = await handleResendVerification();
    
    if (success) {
      setErrors({ success: 'New verification code sent to your email!' });
    } else {
      setErrors({ api: 'Failed to resend verification code. Please try again.' });
    }
    
    setIsLoading(false);
  };

  const handleGoogleAuthResponse = async (response) => {
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${BASE_URL}/customer/auth/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      console.log('Signin: Google auth response:', data);
      if (!res.ok) {
        throw new Error(data.detail || 'Google authentication failed');
      }
      setCookie('access_token', data.access_token);
      setCookie('user', JSON.stringify(data.user));
      if (data.refresh_token) {
        setCookie('refresh_token', data.refresh_token, 30);
      }
      setTimeout(() => {
        window.location.href = 'https://console.digikenya.co.ke/';
      }, 100);
    } catch (error) {
      console.error('Signin: Google auth error:', error);
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'signin') {
    return (
      <div className="font-sans min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <KenicLogo />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                  <p className="text-xs text-gray-600">Get Your .KE Today!</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
            </div>
            
            {errors.api && (
              <div className="flex items-center space-x-1 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.api}</span>
              </div>
            )}

            {errors.info && (
              <div className="flex items-center space-x-1 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{errors.info}</span>
              </div>
            )}

            <div id="google-signin-button" className="w-full"></div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or continue with email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                icon={MailIcon}
                error={errors.email}
              />
              <InputField
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                icon={LockIcon}
                error={errors.password}
                showPasswordToggle
                showPassword={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
              />
              <div className="text-right">
                <a href="#" className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Forgot your password?
                </a>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-center p-8 text-white">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Secure & Fast</h3>
              <p className="text-red-100 text-base">
                Access your .KE domain management with enterprise-grade security and fast performance.
              </p>
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Two-factor authentication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">SSL encrypted connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">24/7 account monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={() => {
                setCurrentStep('signin');
                setErrors({});
                setOtp(['', '', '', '', '', '']);
              }}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to sign in</span>
            </button>
            
            <div className="flex items-center justify-center space-x-3 mb-4">
              <KenicLogo />
              <div>
                <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-xs text-gray-600">Get Your .KE Today!</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to <span className="font-medium">{formData.email}</span>
            </p>
          </div>

          {errors.success && (
            <div className="flex items-center space-x-1 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{errors.success}</span>
            </div>
          )}

          {errors.api && (
            <div className="flex items-center space-x-1 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.api}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Verification Code
              </label>
              <OTPInput otp={otp} setOtp={setOtp} error={errors.otp} />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Sign In'}
            </button>
          </form>

          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 font-medium inline-flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
            
            {verificationAttempts > 0 && verificationAttempts < 5 && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                {5 - verificationAttempts} attempts remaining
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center p-8 text-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold">Almost There!</h3>
            <p className="text-red-100 text-base">
              Please verify your email address to complete the sign-in process and access your account.
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Check your inbox</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Enter the 6-digit code</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Access your dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;