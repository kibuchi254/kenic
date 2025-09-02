import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Check, AlertCircle, Loader2, Mail, Clock, RefreshCw, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Configuration constants
const BASE_URL = 'https://api.digikenya.co.ke';
const GOOGLE_CLIENT_ID = '1086172926615-vtjrru158m0vgnt5s0aq8mdbjj49drub.apps.googleusercontent.com';
const CONSOLE_URL = 'https://console.digikenya.co.ke';

// API Endpoints
const API_ENDPOINTS = {
  REGISTER: '/customer/auth/register',
  GOOGLE_AUTH: '/customer/auth/google-auth',
  VERIFY_EMAIL: '/customer/auth/verify-email',
  RESEND_VERIFICATION: '/customer/auth/resend-verification',
  LOGIN: '/customer/auth/login',
  EXCHANGE_CODE: '/customer/auth/exchange-code',
};

// API Error class
class ApiError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// API Service with fixed URL handling (same as signin)
const apiService = {
  async makeRequest(endpoint, options = {}) {
    // Clean endpoint to avoid double base URL
    const cleanEndpoint = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${cleanEndpoint}`);
      const response = await fetch(cleanEndpoint, config);
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

  async register(name, email, password) {
    return this.makeRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async googleAuth(credential) {
    return this.makeRequest(API_ENDPOINTS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  async exchangeCode(code) {
    return this.makeRequest(`${API_ENDPOINTS.EXCHANGE_CODE}/${code}`, {
      method: 'GET',
    });
  },

  async verifyEmail(email, otp) {
    return this.makeRequest(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async resendVerification(email) {
    return this.makeRequest(API_ENDPOINTS.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async login(email, password) {
    return this.makeRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Fixed React Icons for Email and Password (same as signin)
const MailIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
);

const KenicLogo = ({ className = "w-12 h-12" }) => (
  <div className={`bg-red-600 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-white font-bold text-lg">.KE</span>
  </div>
);

// Input Field Component (same as signin)
const InputField = React.memo(({ 
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

// OTP Input Component (same as signin)
const OTPInput = ({ otp, setOtp, error }) => {
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

// Token data interface for better type safety
const extractTokenData = (responseData) => {
  return {
    token: responseData.token,
    access_token: responseData.access_token || responseData.token, // Fallback to token if access_token not present
  };
};

const Signup = () => {
  const [currentStep, setCurrentStep] = useState('signup'); // 'signup' or 'verify'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Extract URL parameters for checkout flow
  const returnType = searchParams.get('return');
  const domainParam = searchParams.get('domain');
  const isCheckoutReturn = returnType === 'checkout' && !!domainParam;

  console.log('Signup: URL params detected:', { returnType, domainParam, isCheckoutReturn });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Signup: Already authenticated, redirecting to checkout');
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
          console.log('Signup: Restored checkout state:', checkoutState);
          sessionStorage.removeItem('pendingCheckout');
        } catch (error) {
          console.error('Signup: Error parsing pendingCheckout:', error);
        }
      }
      console.log('Signup: Redirecting with checkout state:', JSON.stringify(checkoutState, null, 2));
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
    if (currentStep === 'signup') {
      const initializeGoogleAuth = () => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleGoogleAuthResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signup',
            });

            const signupButton = document.getElementById('google-signup-button');
            if (signupButton) {
              window.google.accounts.id.renderButton(signupButton, {
                theme: 'outline',
                size: 'large',
                width: 400,
                text: 'signup_with',
                shape: 'rectangular',
              });
              console.log('Signup: Google Sign-In button rendered');
            } else {
              console.error('Signup: Google Sign-In button element not found');
              setErrors(prev => ({
                ...prev,
                google: 'Failed to render Google Sign-In button. Please use email sign-up.',
              }));
            }
          } catch (error) {
            console.error('Signup: Google Sign-In initialization error:', error);
            setErrors(prev => ({
              ...prev,
              google: 'Google Sign-In is temporarily unavailable. Please use email sign-up.',
            }));
          }
        } else {
          console.error('Signup: Google Sign-In script not loaded');
          setErrors(prev => ({
            ...prev,
            google: 'Google Sign-In failed to load. Please use email sign-up.',
          }));
        }
      };

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Signup: Failed to load Google Sign-In script');
        setErrors(prev => ({
          ...prev,
          google: 'Failed to load Google Sign-In. Please use email sign-up.',
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
  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Please accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Centralized authentication success handler
  const handleAuthSuccess = async (tokenData, user, authCode) => {
    console.log('Signup: Authentication successful for user:', user.email);
    console.log('Signup: Is checkout return?', isCheckoutReturn);

    try {
      // Store auth code for checkout API calls
      if (authCode) {
        sessionStorage.setItem('auth_code', authCode);
        console.log('Signup: Stored auth_code in sessionStorage:', authCode.substring(0, 20) + '...');
      }

      // Normalize token data to the expected format
      let normalizedTokenData = null;
      
      if (typeof tokenData === 'string') {
        // Legacy string token
        normalizedTokenData = {
          token: tokenData,
          access_token: tokenData
        };
      } else if (tokenData && typeof tokenData === 'object') {
        // Token object with access_token support
        normalizedTokenData = tokenData;
      }

      // Log token data for debugging
      if (normalizedTokenData) {
        console.log('Signup: Token data:', {
          token: normalizedTokenData.token ? 'EXISTS' : 'MISSING',
          access_token: normalizedTokenData.access_token ? 'EXISTS' : 'MISSING'
        });
      }

      // Use updated auth context login method
      await login(normalizedTokenData, user, true); // isCheckoutFlow = true

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
          console.log('Signup: Restored checkout state:', checkoutState);
          sessionStorage.removeItem('pendingCheckout');
        } catch (error) {
          console.error('Signup: Error parsing pendingCheckout:', error);
        }
      }
      console.log('Signup: Redirecting with checkout state:', JSON.stringify(checkoutState, null, 2));
      navigate('/domain-checkout', { state: checkoutState });
    } catch (error) {
      console.error('Signup: Login error in handleAuthSuccess:', error);
      setErrors({ api: 'Authentication failed. Please try again.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.register(formData.fullName.trim(), formData.email.trim(), formData.password);
      console.log('Signup: Register response:', response);

      if (response.success) {
        // Move to verification step
        setCurrentStep('verify');
        setResendCooldown(60); // 60 seconds cooldown
        setErrors({ info: 'Please verify your email address. We\'ve sent a verification code to your email.' });
      } else {
        throw new ApiError(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup: Register error:', error);
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setErrors({ api: 'An account with this email already exists. Please sign in instead.' });
        } else if (error.code === 'INVALID_EMAIL') {
          setErrors({ email: 'Please enter a valid email address' });
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

  const handleVerifyOTP = async (e) => {
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
      console.log('Signup: Verify email response:', response);

      if (response.success && response.data) {
        const { token, access_token, user, redirect_url } = response.data;
        
        // Extract token data with access_token support
        const tokenData = extractTokenData(response.data);
        
        if ((token || access_token) && user && isCheckoutReturn) {
          console.log('Signup: Direct auth after verification for checkout flow');
          await handleAuthSuccess(tokenData, user);
          return;
        }
        if (redirect_url && !isCheckoutReturn) {
          console.log('Signup: Redirect flow after verification for normal signup');
          window.location.href = redirect_url;
          return;
        }
        if ((token || access_token) && user) {
          console.log('Signup: Fallback direct auth after verification');
          await handleAuthSuccess(tokenData, user);
          return;
        }
        
        // If no token but verification successful, try login
        console.log('Signup: No token in verification response, attempting login');
        const loginResponse = await apiService.login(formData.email.trim(), formData.password);
        
        if (loginResponse.success && loginResponse.data) {
          const loginTokenData = extractTokenData(loginResponse.data);
          await handleAuthSuccess(loginTokenData, loginResponse.data.user);
          return;
        }
        
        // Fallback success message
        setErrors({ success: 'Email verified successfully! Please sign in.' });
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        throw new ApiError(response.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Signup: OTP verify error:', error);
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
      console.error('Signup: Resend verification error:', error);
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

  const handleGoogleAuthResponse = async (response) => {
    setIsLoading(true);
    setErrors({});

    try {
      const apiResponse = await apiService.googleAuth(response.credential);
      console.log('Signup: Google auth response:', JSON.stringify(apiResponse, null, 2));

      if (apiResponse.success && apiResponse.data) {
        let { token, access_token, user, redirect_url } = apiResponse.data;

        // For checkout flow, prioritize client-side auth if user is verified
        if (isCheckoutReturn && user?.is_email_verified && user?.account_status === 'active') {
          console.log('Signup: User is verified, attempting client-side auth for checkout');
          let authCode;

          // Extract code from redirect_url
          if (redirect_url && redirect_url.includes('code=')) {
            try {
              const url = new URL(redirect_url);
              authCode = url.searchParams.get('code') || undefined;
              console.log('Signup: Extracted auth code:', authCode?.substring(0, 20) + '...');
            } catch (error) {
              console.error('Signup: Error parsing redirect_url:', error);
            }
          }

          // Try code exchange if no token but we have a code
          if (authCode && !token && !access_token) {
            console.log('Signup: Exchanging code for token');
            try {
              const tokenResponse = await apiService.exchangeCode(authCode);
              if (tokenResponse.success && tokenResponse.data) {
                token = tokenResponse.data.token;
                access_token = tokenResponse.data.access_token || tokenResponse.data.token;
                user = tokenResponse.data.user || user;
                console.log('Signup: Token exchange successful');
              }
            } catch (codeExchangeError) {
              console.error('Signup: Code exchange error:', codeExchangeError);
              console.log('Signup: Code exchange failed, proceeding with user object for checkout');
            }
          }

          // Extract token data with access_token support
          const tokenData = extractTokenData({ token, access_token });

          // Proceed with auth
          console.log('Signup: Proceeding with checkout auth');
          await handleAuthSuccess(tokenData, user, authCode);
          return;
        }

        // For non-checkout flow, redirect to console
        if (redirect_url && !isCheckoutReturn) {
          console.log('Signup: Google auth redirect flow for normal signup');
          window.location.href = redirect_url;
          return;
        }

        // Fallback for direct auth
        if (user && (token || access_token)) {
          console.log('Signup: Fallback Google direct auth');
          const tokenData = extractTokenData({ token, access_token });
          await handleAuthSuccess(tokenData, user);
          return;
        }

        console.warn('Signup: Unexpected Google auth response format:', apiResponse.data);
        setErrors({
          google: 'Authentication failed due to an unexpected response. Please try email sign-up.',
        });
      } else {
        throw new ApiError(apiResponse.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Signup: Google auth error:', error);
      if (error instanceof ApiError) {
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          setErrors({
            google: 'Google Sign-In is temporarily unavailable. Please use email sign-up instead.',
          });
        } else {
          setErrors({ google: error.message });
        }
      } else {
        setErrors({ google: 'Google authentication failed. Please try email sign-up.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when going back to signup
  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setErrors({});
    setOtp(['', '', '', '', '', '']);
    setVerificationAttempts(0);
    setResendCooldown(0);
  };

  if (currentStep === 'signup') {
    return (
      <div className="font-sans min-h-screen flex flex-col lg:flex-row">
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
                    Create your account to complete {domainParam ? `${decodeURIComponent(domainParam)} ` : ''}domain registration and get started with your online presence.
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
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Join .KE Community</h3>
                  <p className="text-red-100 text-base leading-relaxed">
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full max-w-md space-y-6">
            {isCheckoutReturn && domainParam && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-semibold text-green-900">Complete Your Domain Registration</h3>
                    <p className="text-sm text-green-700">
                      Create account to register <span className="font-medium">{decodeURIComponent(domainParam)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <button
                onClick={() => navigate('/signin')}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm transition-colors duration-200"
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
              <h2 className="text-2xl font-bold text-gray-900">
                {isCheckoutReturn ? 'Create account to continue' : 'Create account'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isCheckoutReturn
                  ? 'Create your account to complete domain registration'
                  : 'Join thousands of .KE domain owners'}
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

            <div id="google-signup-button" className="w-full flex justify-center"></div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or create with email</span>
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
                placeholder="Enter your email address"
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
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.acceptTerms ? 'bg-red-600 border-red-600' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {formData.acceptTerms && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="https://digikenya.co.ke/terms" className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="https://digikenya.co.ke/privacy" className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.acceptTerms}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
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
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification Form
  return (
    <div className="font-sans min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={handleBackToSignup}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign up</span>
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
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Create Account'}
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
                Too many failed attempts. Please try signing up again.
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
              Please verify your email address to complete the registration process and access your account.
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

export default Signup;