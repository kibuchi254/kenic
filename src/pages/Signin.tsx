import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Shield, Check, Mail, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Configuration constants
const BASE_URL = 'https://api.digikenya.co.ke';
const GOOGLE_CLIENT_ID = '1086172926615-vtjrru158m0vgnt5s0aq8mdbjj49drub.apps.googleusercontent.com';
const CONSOLE_URL = 'https://console.digikenya.co.ke';

// API Endpoints
const API_ENDPOINTS = {
  LOGIN: '/customer/auth/login',
  GOOGLE_AUTH: '/customer/auth/google-auth',
  VERIFY_EMAIL: '/customer/auth/verify-email',
  RESEND_VERIFICATION: '/customer/auth/resend-verification',
  EXCHANGE_CODE: '/customer/auth/exchange-code',
};

// API Error class
class ApiError extends Error {
  constructor(message: string, public statusCode?: number, public code?: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Service
const apiService = {
  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();
      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new ApiError(
          data.error?.detail || data.message || `HTTP ${response.status}`,
          response.status,
          data.error?.code,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('API Request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  },

  async login(email: string, password: string) {
    return this.makeRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async googleAuth(credential: string) {
    return this.makeRequest(API_ENDPOINTS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  async exchangeCode(code: string, method: 'POST' | 'GET' = 'POST') {
    if (method === 'GET') {
      const url = `${BASE_URL}${API_ENDPOINTS.EXCHANGE_CODE}?code=${encodeURIComponent(code)}`;
      return this.makeRequest(url, { method: 'GET' });
    }
    return this.makeRequest(API_ENDPOINTS.EXCHANGE_CODE, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async verifyEmail(email: string, otp: string) {
    return this.makeRequest(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async resendVerification(email: string) {
    return this.makeRequest(API_ENDPOINTS.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Fixed React Icons for Email and Password
const MailIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const LockIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
);

const KenicLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`bg-red-600 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-white font-bold text-lg">.KE</span>
  </div>
);

// Input Field Component
interface InputFieldProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ComponentType<{ className: string }>;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onPasswordToggle?: () => void;
}

const InputField = React.memo<InputFieldProps>(({ 
  id, 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  error, 
  showPasswordToggle, 
  showPassword, 
  onPasswordToggle 
}) => {
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
          className={`w-full pl-10 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 ${
            error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

// OTP Input Component
const OTPInput = ({ otp, setOtp, error }: { 
  otp: string[], 
  setOtp: (otp: string[]) => void, 
  error?: string 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-center space-x-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d*$/.test(value)) return;
              const newOtp = [...otp];
              newOtp[index] = value;
              setOtp(newOtp);
              if (value && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                if (nextInput) nextInput.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otp[index] && index > 0) {
                const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                if (prevInput) prevInput.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const paste = e.clipboardData.getData('text');
              if (/^\d{6}$/.test(paste)) {
                setOtp(paste.split(''));
              }
            }}
            data-index={index}
            className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
        ))}
      </div>
      {error && (
        <div className="flex items-center justify-center space-x-1 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Main Signin Component
const Signin = () => {
  const [currentStep, setCurrentStep] = useState('signin');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Extract URL parameters for checkout flow
  const returnType = searchParams.get('return');
  const domainParam = searchParams.get('domain');
  const isCheckoutReturn = returnType === 'checkout' && !!domainParam;

  console.log('Signin: URL params detected:', { returnType, domainParam, isCheckoutReturn });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Signin: Already authenticated, redirecting to checkout');
      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      let checkoutState = {
        domain: domainParam || 'myawesomebrand.co.ke',
        price: 1200,
        renewal: 1200,
        isQuickCheckout: true,
        extension: {
          ext: '.co.ke',
          desc: 'For commercial enterprises',
          popular: true,
          price: 'KSh 1,500/year',
        },
        returnUrl: '/domain-checkout',
      };
      if (pendingCheckout) {
        try {
          checkoutState = { ...checkoutState, ...JSON.parse(pendingCheckout) };
          console.log('Signin: Restored checkout state:', checkoutState);
          sessionStorage.removeItem('pendingCheckout');
        } catch (error) {
          console.error('Signin: Error parsing pendingCheckout:', error);
        }
      }
      console.log('Signin: Redirecting with checkout state:', JSON.stringify(checkoutState, null, 2));
      navigate('/domain-checkout', { state: checkoutState });
    }
  }, [isAuthenticated, navigate, isCheckoutReturn, domainParam]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Google Sign-In initialization
  useEffect(() => {
    if (currentStep === 'signin') {
      const initializeGoogleAuth = () => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleGoogleAuthResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
            });

            const signinButton = document.getElementById('google-signin-button');
            if (signinButton) {
              window.google.accounts.id.renderButton(signinButton, {
                theme: 'outline',
                size: 'large',
                width: 400,
                text: 'signin_with',
                shape: 'rectangular',
              });
              console.log('Signin: Google Sign-In button rendered');
            } else {
              console.error('Signin: Google Sign-In button element not found');
              setErrors(prev => ({
                ...prev,
                google: 'Failed to render Google Sign-In button. Please use email sign-in.',
              }));
            }
          } catch (error) {
            console.error('Signin: Google Sign-In initialization error:', error);
            setErrors(prev => ({
              ...prev,
              google: 'Google Sign-In is temporarily unavailable. Please use email sign-in.',
            }));
          }
        } else {
          console.error('Signin: Google Sign-In script not loaded');
          setErrors(prev => ({
            ...prev,
            google: 'Google Sign-In failed to load. Please use email sign-in.',
          }));
        }
      };

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Signin: Failed to load Google Sign-In script');
        setErrors(prev => ({
          ...prev,
          google: 'Failed to load Google Sign-In. Please use email sign-in.',
        }));
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [currentStep]);

  // Form handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Centralized authentication success handler
  const handleAuthSuccess = async (token: string | null, user: any, authCode?: string) => {
    console.log('Signin: Authentication successful for user:', user.email);
    console.log('Signin: Is checkout return?', isCheckoutReturn);

    try {
      // Store auth code for checkout API calls
      if (authCode) {
        sessionStorage.setItem('auth_code', authCode);
        console.log('Signin: Stored auth_code in sessionStorage:', authCode.substring(0, 20) + '...');
      }

      // Use a temporary token if none provided (backend will validate session)
      const tempToken = token || `temp-token-${user.id}-${Date.now()}`;
      await login(tempToken, user);

      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      let checkoutState = {
        domain: domainParam || 'myawesomebrand.co.ke',
        price: 1200,
        renewal: 1200,
        isQuickCheckout: true,
        extension: {
          ext: '.co.ke',
          desc: 'For commercial enterprises',
          popular: true,
          price: 'KSh 1,500/year',
        },
        returnUrl: '/domain-checkout',
      };
      if (pendingCheckout) {
        try {
          checkoutState = { ...checkoutState, ...JSON.parse(pendingCheckout) };
          console.log('Signin: Restored checkout state:', checkoutState);
          sessionStorage.removeItem('pendingCheckout');
        } catch (error) {
          console.error('Signin: Error parsing pendingCheckout:', error);
        }
      }
      console.log('Signin: Redirecting with checkout state:', JSON.stringify(checkoutState, null, 2));
      navigate('/domain-checkout', { state: checkoutState });
    } catch (error) {
      console.error('Signin: Login error in handleAuthSuccess:', error);
      setErrors({ api: 'Authentication failed. Please try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.login(formData.email.trim(), formData.password);
      console.log('Signin: Login response:', response);

      if (response.success && response.data) {
        const { token, user, redirect_url } = response.data;
        if (token && user && isCheckoutReturn) {
          console.log('Signin: Direct auth for checkout flow');
          await handleAuthSuccess(token, user);
          return;
        }
        if (redirect_url && !isCheckoutReturn) {
          console.log('Signin: Redirect flow for normal login');
          window.location.href = redirect_url;
          return;
        }
        if (token && user) {
          console.log('Signin: Fallback direct auth');
          await handleAuthSuccess(token, user);
          return;
        }
        throw new ApiError('Invalid response format from server');
      } else {
        throw new ApiError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Signin: Login error:', error);
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          const resendSuccess = await handleResendVerification();
          if (resendSuccess) {
            setCurrentStep('verify');
            setErrors({
              info: 'Please verify your email address. We\'ve sent a verification code to your email.',
            });
          } else {
            setErrors({ api: 'Failed to send verification code. Please try again.' });
          }
          return;
        } else if (error.code === 'ACCOUNT_LOCKED') {
          setErrors({ api: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' });
        } else if (error.code === 'ACCOUNT_SUSPENDED') {
          setErrors({ api: 'Your account has been suspended. Please contact support.' });
        } else if (error.code === 'INVALID_CREDENTIALS') {
          setErrors({ api: 'Invalid email or password. Please check your credentials and try again.' });
        } else {
          setErrors({ api: error.message });
        }
      } else {
        setErrors({ api: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code' });
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setErrors({ otp: 'Verification code must contain only numbers' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.verifyEmail(formData.email.trim(), otpString);
      console.log('Signin: Verify email response:', response);

      if (response.success && response.data) {
        const { token, user, redirect_url } = response.data;
        if (token && user && isCheckoutReturn) {
          console.log('Signin: Direct auth after verification for checkout flow');
          await handleAuthSuccess(token, user);
          return;
        }
        if (redirect_url && !isCheckoutReturn) {
          console.log('Signin: Redirect flow after verification for normal login');
          window.location.href = redirect_url;
          return;
        }
        if (token && user) {
          console.log('Signin: Fallback direct auth after verification');
          await handleAuthSuccess(token, user);
          return;
        }
        throw new ApiError('Invalid response format after verification');
      } else {
        throw new ApiError(response.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Signin: OTP verify error:', error);
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_OTP') {
          setVerificationAttempts((prev) => prev + 1);
        }
        setErrors({ otp: error.message });
      } else {
        setErrors({ otp: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await apiService.resendVerification(formData.email.trim());
      return response.success;
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
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setVerificationAttempts(0);
      setErrors({ success: 'New verification code sent to your email!' });
    } else {
      setErrors({ api: 'Failed to resend verification code. Please try again.' });
    }

    setIsLoading(false);
  };

  const handleGoogleAuthResponse = async (response: any) => {
    setIsLoading(true);
    setErrors({});

    try {
      const apiResponse = await apiService.googleAuth(response.credential);
      console.log('Signin: Google auth response:', JSON.stringify(apiResponse, null, 2));

      if (apiResponse.success && apiResponse.data) {
        let { token, user, redirect_url } = apiResponse.data;

        // For checkout flow, prioritize client-side auth if user is verified
        if (isCheckoutReturn && user?.is_email_verified && user?.account_status === 'active') {
          console.log('Signin: User is verified, attempting client-side auth for checkout');
          let authCode: string | undefined;

          // Extract code from redirect_url
          if (redirect_url && redirect_url.includes('code=')) {
            try {
              const url = new URL(redirect_url);
              authCode = url.searchParams.get('code') || undefined;
              console.log('Signin: Extracted auth code:', authCode?.substring(0, 20) + '...');
            } catch (error) {
              console.error('Signin: Error parsing redirect_url:', error);
            }
          }

          // Try code exchange
          if (authCode && !token) {
            console.log('Signin: Exchanging code for token with POST');
            try {
              const tokenResponse = await apiService.exchangeCode(authCode, 'POST');
              if (tokenResponse.success && tokenResponse.data?.token) {
                token = tokenResponse.data.token;
                user = tokenResponse.data.user || user;
                console.log('Signin: Token obtained:', token.substring(0, 20) + '...');
              }
            } catch (postError: any) {
              console.error('Signin: POST code exchange error:', postError);
              if (postError.statusCode === 405) {
                console.log('Signin: POST failed, trying GET');
                try {
                  const tokenResponse = await apiService.exchangeCode(authCode, 'GET');
                  if (tokenResponse.success && tokenResponse.data?.token) {
                    token = tokenResponse.data.token;
                    user = tokenResponse.data.user || user;
                    console.log('Signin: Token obtained:', token.substring(0, 20) + '...');
                  }
                } catch (getError) {
                  console.error('Signin: GET code exchange error:', getError);
                  console.log('Signin: Code exchange failed, proceeding with user object for checkout');
                }
              }
            }
          }

          // Proceed with auth even if token is missing (backend validates session)
          console.log('Signin: Proceeding with checkout auth, token:', token ? token.substring(0, 20) + '...' : 'none');
          await handleAuthSuccess(token, user, authCode);
          return;
        }

        // For non-checkout flow, redirect to console
        if (redirect_url && !isCheckoutReturn) {
          console.log('Signin: Google auth redirect flow for normal login');
          window.location.href = redirect_url;
          return;
        }

        // Fallback for direct auth
        if (user && token) {
          console.log('Signin: Fallback Google direct auth');
          await handleAuthSuccess(token, user);
          return;
        }

        console.warn('Signin: Unexpected Google auth response format:', apiResponse.data);
        setErrors({
          google: 'Authentication failed due to an unexpected response. Please try email sign-in.',
        });
      } else {
        throw new ApiError(apiResponse.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Signin: Google auth error:', error);
      if (error instanceof ApiError) {
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          setErrors({
            google: 'Google Sign-In is temporarily unavailable. Please use email sign-in instead.',
          });
        } else {
          setErrors({ google: error.message });
        }
      } else {
        setErrors({ google: 'Google authentication failed. Please try email sign-in.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when going back to signin
  const handleBackToSignin = () => {
    setCurrentStep('signin');
    setErrors({});
    setOtp(['', '', '', '', '', '']);
    setVerificationAttempts(0);
    setResendCooldown(0);
  };

  if (currentStep === 'signin') {
    return (
      <div className="font-sans min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full max-w-md space-y-6">
            {isCheckoutReturn && domainParam && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-semibold text-green-900">Complete Your Domain Registration</h3>
                    <p className="text-sm text-green-700">
                      Sign in to register <span className="font-medium">{decodeURIComponent(domainParam)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <KenicLogo />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">.KE Zone</h1>
                  <p className="text-xs text-gray-600">Get Your .KE Today!</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isCheckoutReturn ? 'Sign in to continue' : 'Welcome back'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isCheckoutReturn
                  ? 'Sign in to complete your domain registration'
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {errors.api && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.api}</span>
              </div>
            )}

            {errors.google && (
              <div className="flex items-center space-x-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.google}</span>
              </div>
            )}

            {errors.info && (
              <div className="flex items-center space-x-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{errors.info}</span>
              </div>
            )}

            <div id="google-signin-button" className="w-full flex justify-center"></div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="signin-email"
                type="email"
                placeholder="Enter your email address"
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
                <a
                  href="https://digikenya.co.ke/forgot-password"
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  Forgot your password?
                </a>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
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
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-center p-8 text-white">
            <div className="text-center space-y-6 max-w-md">
              {isCheckoutReturn ? (
                <>
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Almost There!</h3>
                  <p className="text-red-100 text-base leading-relaxed">
                    Sign in to complete your {domainParam ? `${decodeURIComponent(domainParam)} ` : ''}domain registration and get started with your online presence.
                  </p>
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">Instant domain activation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">Free DNS management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">24/7 support included</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Secure & Fast</h3>
                  <p className="text-red-100 text-base leading-relaxed">
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Step
  return (
    <div className="font-sans min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={handleBackToSignin}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm transition-colors duration-200"
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
              Enter the 6-digit code sent to <span className="font-medium text-gray-900">{formData.email}</span>
            </p>
          </div>

          {errors.success && (
            <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{errors.success}</span>
            </div>
          )}

          {errors.api && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
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
                  className="text-red-600 hover:text-red-700 font-medium inline-flex items-center space-x-1 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            {verificationAttempts > 0 && verificationAttempts < 5 && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                {5 - verificationAttempts} attempts remaining
              </div>
            )}

            {verificationAttempts >= 5 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                Too many failed attempts. Please try signing in again.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-center p-8 text-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold">Almost There!</h3>
            <p className="text-red-100 text-base leading-relaxed">
              Please verify your email address to complete the sign-in process and access your account.
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>Check your inbox</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span>Enter the 6-digit code</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span>{isCheckoutReturn ? 'Complete domain registration' : 'Access your dashboard'}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-red-100 opacity-90">
              <p>Tip: Check your spam folder if you don't see the email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add global window type for Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default Signin;