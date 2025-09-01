import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  is_email_verified: boolean;
  account_status: string;
  billing_country: string | null;
  referral_code: string;
  preferred_contact_method: string;
  language_preference: string;
  timezone: string;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string | null, user: User, isCheckoutFlow?: boolean) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = 'https://api.digikenya.co.ke';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = useCallback((name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      if (cookieValue && cookieValue !== 'undefined' && cookieValue !== 'null') {
        console.log(`AuthProvider: getCookie ${name} found:`, cookieValue.substring(0, 20) + '...');
        return cookieValue;
      }
    }
    console.log(`AuthProvider: getCookie ${name} not found or invalid`);
    return undefined;
  }, []);

  const getToken = useCallback((): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      console.log('AuthProvider: Token found in URL');
      return urlToken;
    }

    if (token) {
      console.log('AuthProvider: Token found in memory');
      return token;
    }

    const localToken = localStorage.getItem('access_token') || localStorage.getItem('session_token');
    if (localToken && localToken !== 'undefined' && localToken !== 'null') {
      console.log('AuthProvider: Token found in localStorage');
      return localToken;
    }

    const sessionToken = sessionStorage.getItem('access_token') || sessionStorage.getItem('session_token');
    if (sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null') {
      console.log('AuthProvider: Token found in sessionStorage');
      return sessionToken;
    }

    const cookieToken = getCookie('session_token') || getCookie('access_token');
    if (cookieToken) {
      console.log('AuthProvider: Token found in cookies');
      return cookieToken;
    }

    console.log('AuthProvider: No token found in any source');
    return null;
  }, [token, getCookie]);

  const getStoredUser = useCallback((): User | null => {
    try {
      const localUser = localStorage.getItem('user');
      if (localUser && localUser !== 'undefined' && localUser !== 'null') {
        return JSON.parse(localUser);
      }

      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser && sessionUser !== 'undefined' && sessionUser !== 'null') {
        return JSON.parse(sessionUser);
      }
    } catch (error) {
      console.error('AuthProvider: Error parsing stored user:', error);
    }
    return null;
  }, []);

  const validateToken = useCallback(async (tokenToValidate: string): Promise<{ valid: boolean; user?: User; newToken?: string }> => {
    try {
      console.log('AuthProvider: Validating token with backend...');
      const response = await fetch(`${BASE_URL}/customer/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToValidate}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('AuthProvider: Token validation failed with status:', response.status);
        return { valid: false };
      }

      const data = await response.json();
      console.log('AuthProvider: Token validation response:', data.success ? 'SUCCESS' : 'FAILED');

      if (data.success && data.data) {
        return {
          valid: true,
          user: data.data.user,
          newToken: data.data.token,
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('AuthProvider: Token validation error:', error);
      return { valid: false };
    }
  }, []);

  const storeAuthData = useCallback((authToken: string | null, userData: User) => {
    console.log('AuthProvider: Storing auth data for user:', userData.email);

    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);

    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('user', JSON.stringify(userData));

    if (authToken) {
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('session_token', authToken);
      sessionStorage.setItem('access_token', authToken);
      sessionStorage.setItem('session_token', authToken);

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `session_token=${authToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
      document.cookie = `access_token=${authToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
    }

    console.log('AuthProvider: Auth data stored successfully');
  }, []);

  const clearAuthData = useCallback(() => {
    console.log('AuthProvider: Clearing all auth data');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('access_token');
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');

    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.digikenya.co.ke';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.digikenya.co.ke';
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=digikenya.co.ke';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=digikenya.co.ke';

    console.log('AuthProvider: Auth data cleared');
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentToken = getToken();
    if (!currentToken) {
      console.log('AuthProvider: No token to refresh');
      return false;
    }

    try {
      console.log('AuthProvider: Attempting token refresh...');
      const response = await fetch(`${BASE_URL}/customer/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token && data.data?.user) {
          console.log('AuthProvider: Token refreshed successfully');
          storeAuthData(data.data.token, data.data.user);
          return true;
        }
      }

      console.log('AuthProvider: Token refresh failed');
      return false;
    } catch (error) {
      console.error('AuthProvider: Token refresh error:', error);
      return false;
    }
  }, [getToken, storeAuthData]);

  const login = useCallback(async (newToken: string | null, newUser: User, isCheckoutFlow: boolean = false) => {
    console.log('AuthProvider: Logging in user:', newUser.email, { isCheckoutFlow });

    if (!newUser) {
      console.error('AuthProvider: No user data provided for login');
      throw new Error('User data is missing');
    }

    if (!newToken && !isCheckoutFlow) {
      console.error('AuthProvider: No token provided for non-checkout login');
      throw new Error('Authentication token is missing');
    }

    if (newToken && !isCheckoutFlow) {
      const validation = await validateToken(newToken);
      if (validation.valid) {
        storeAuthData(validation.newToken || newToken, validation.user || newUser);
      } else {
        console.error('AuthProvider: Provided token is invalid');
        throw new Error('Invalid authentication token');
      }
    } else if (isCheckoutFlow) {
      // For checkout flow, allow login without token if user is verified
      if (newUser.is_email_verified && newUser.account_status === 'active') {
        console.log('AuthProvider: Bypassing token validation for checkout flow with verified user');
        storeAuthData(newToken, newUser);
      } else {
        console.error('AuthProvider: User not verified for checkout flow');
        throw new Error('User is not verified or account is not active');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [storeAuthData, validateToken]);

  const logout = useCallback(() => {
    console.log('AuthProvider: Logging out user');

    if (token) {
      fetch(`${BASE_URL}/customer/auth/logout`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
      }).catch((error) => console.error('AuthProvider: Logout API error:', error));
    }

    clearAuthData();
    window.location.href = '/signin';
  }, [token, clearAuthData]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing auth for root domain...');

      try {
        let currentToken = getToken();
        console.log('AuthProvider: Current token status:', currentToken ? 'FOUND' : 'NOT_FOUND');

        let currentUser = getStoredUser();
        console.log('AuthProvider: Stored user status:', currentUser ? 'FOUND' : 'NOT_FOUND');

        if (currentToken) {
          const validation = await validateToken(currentToken);
          if (validation.valid) {
            console.log('AuthProvider: Token validation successful');
            const finalUser = validation.user || currentUser;
            const finalToken = validation.newToken || currentToken;

            if (finalUser) {
              storeAuthData(finalToken, finalUser);
              if (new URLSearchParams(window.location.search).has('token')) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            } else {
              console.warn('AuthProvider: Valid token but no user data');
              clearAuthData();
            }
          } else {
            console.warn('AuthProvider: Token validation failed');
            clearAuthData();
          }
        } else {
          console.log('AuthProvider: No token found, user not authenticated');
          clearAuthData();
        }
      } catch (error) {
        console.error('AuthProvider: Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Auth initialization complete');
      }
    };

    initializeAuth();
  }, [getToken, getStoredUser, validateToken, storeAuthData, clearAuthData]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('AuthProvider: Setting up token refresh interval');

      const interval = setInterval(async () => {
        console.log('AuthProvider: Periodic token refresh check');
        const currentToken = getToken();
        if (currentToken) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.warn('AuthProvider: Token refresh failed, logging out');
            logout();
          }
        }
      }, 15 * 60 * 1000);

      return () => {
        console.log('AuthProvider: Clearing token refresh interval');
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, isLoading, getToken, refreshToken, logout]);

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};