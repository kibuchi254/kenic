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

  const getToken = useCallback((): string | undefined => {
    // Check localStorage first (our primary storage)
    const localToken = localStorage.getItem('session_token');
    
    // Enhanced cookie checking with multiple methods
    const getCookieToken = (): string | undefined => {
      // Method 1: Standard cookie parsing
      const value = `; ${document.cookie}`;
      const parts = value.split(`; session_token=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        if (cookieValue) return cookieValue;
      }
      
      // Method 2: Alternative cookie parsing for access_token
      const altParts = value.split(`; access_token=`);
      if (altParts.length === 2) {
        const altCookieValue = altParts.pop()?.split(';').shift();
        if (altCookieValue) return altCookieValue;
      }
      
      // Method 3: Manual cookie search (sometimes more reliable)
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('session_token=')) {
          return trimmedCookie.substring('session_token='.length);
        }
        if (trimmedCookie.startsWith('access_token=')) {
          return trimmedCookie.substring('access_token='.length);
        }
      }
      
      return undefined;
    };
    
    const cookieToken = getCookieToken();
    const finalToken = localToken || cookieToken;
    
    console.log('ROOT TOKEN CHECK:', {
      localStorage: localToken ? 'EXISTS' : 'MISSING',
      cookie: cookieToken ? 'EXISTS' : 'MISSING',
      final: finalToken ? 'FOUND' : 'NOT_FOUND'
    });
    
    // If we found a cookie token but no localStorage token, sync them
    if (cookieToken && !localToken) {
      localStorage.setItem('session_token', cookieToken);
      console.log('ROOT TOKEN SYNC: Synced cookie token to localStorage');
    }
    
    return finalToken;
  }, []);

  const getStoredUser = useCallback((): User | null => {
    try {
      const localUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (localUser && localUser !== 'undefined' && localUser !== 'null') {
        return JSON.parse(localUser);
      }
    } catch (error) {
      console.error('ROOT: Error parsing stored user:', error);
    }
    return null;
  }, []);

  const validateWithBackend = useCallback(async (tokenToValidate?: string): Promise<{ token?: string; user?: User } | null> => {
    try {
      console.log('ROOT BACKEND VALIDATION: Attempting to validate session with backend...');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (tokenToValidate) {
        headers.Authorization = `Bearer ${tokenToValidate}`;
      }
      
      const response = await fetch(`${BASE_URL}/customer/auth/verify-token`, {
        method: 'POST',
        headers,
        credentials: 'include', // This will send cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          console.log('ROOT BACKEND VALIDATION: Success, user found:', data.data.user.email);
          return {
            token: data.data.token,
            user: data.data.user
          };
        }
      }
      
      console.log('ROOT BACKEND VALIDATION: Failed or no valid session found');
      return null;
    } catch (error) {
      console.log('ROOT BACKEND VALIDATION: Error occurred:', error);
      return null;
    }
  }, []);

  const storeAuthData = useCallback((authToken: string | null, userData: User) => {
    console.log('ROOT: Storing auth data for user:', userData.email);

    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);

    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('user', JSON.stringify(userData));

    if (authToken) {
      localStorage.setItem('session_token', authToken);
      console.log('ROOT: Token stored in localStorage');

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `session_token=${authToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
      document.cookie = `access_token=${authToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
    }

    console.log('ROOT: Auth data stored successfully');
  }, []);

  const clearAuthData = useCallback(() => {
    console.log('ROOT: Clearing all auth data');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    sessionStorage.removeItem('user');

    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.digikenya.co.ke';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.digikenya.co.ke';
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=digikenya.co.ke';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=digikenya.co.ke';

    console.log('ROOT: Auth data cleared');
  }, []);

  // Helper function to wait for token with retries
  const waitForToken = useCallback(async (maxRetries: number = 5, delayMs: number = 200): Promise<string | undefined> => {
    for (let i = 0; i < maxRetries; i++) {
      const token = getToken();
      if (token) {
        console.log(`ROOT TOKEN FOUND on attempt ${i + 1}`);
        return token;
      }
      if (i < maxRetries - 1) {
        console.log(`ROOT TOKEN RETRY ${i + 1}/${maxRetries} - waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    console.log(`ROOT TOKEN NOT FOUND after ${maxRetries} attempts`);
    return undefined;
  }, [getToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentToken = getToken();
    if (!currentToken) {
      console.log('ROOT: No token to refresh');
      return false;
    }

    try {
      console.log('ROOT: Attempting token refresh...');
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
          console.log('ROOT: Token refreshed successfully');
          storeAuthData(data.data.token, data.data.user);
          return true;
        }
      }

      console.log('ROOT: Token refresh failed');
      return false;
    } catch (error) {
      console.error('ROOT: Token refresh error:', error);
      return false;
    }
  }, [getToken, storeAuthData]);

  const login = useCallback(async (newToken: string | null, newUser: User, isCheckoutFlow: boolean = false) => {
    console.log('ROOT LOGIN: User logging in:', newUser.email, { isCheckoutFlow });
    console.log('ROOT LOGIN: Token provided:', newToken ? 'YES' : 'NO');

    if (!newUser) {
      console.error('ROOT LOGIN: No user data provided for login');
      throw new Error('User data is missing');
    }

    if (newToken && !isCheckoutFlow) {
      // Validate token if provided and not checkout flow
      const validation = await validateWithBackend(newToken);
      if (validation?.valid !== false) { // Allow if validation succeeds or fails due to network
        storeAuthData(validation?.token || newToken, validation?.user || newUser);
      } else {
        console.error('ROOT LOGIN: Provided token is invalid');
        throw new Error('Invalid authentication token');
      }
    } else if (isCheckoutFlow) {
      // For checkout flow, allow login without token if user is verified
      if (newUser.is_email_verified && newUser.account_status === 'active') {
        console.log('ROOT LOGIN: Bypassing token validation for checkout flow with verified user');
        storeAuthData(newToken, newUser);
      } else {
        console.error('ROOT LOGIN: User not verified for checkout flow');
        throw new Error('User is not verified or account is not active');
      }
    } else {
      // No token provided, store user data and rely on cookies
      storeAuthData(newToken, newUser);
    }

    // Clean up URL if token was in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verify token availability after a short delay
    setTimeout(() => {
      const finalToken = getToken();
      console.log('ROOT LOGIN: Final token verification:', finalToken ? 'SUCCESS' : 'FAILED');
      
      if (!finalToken) {
        console.warn('ROOT LOGIN: No token found after login - this may cause issues on reload');
      }
    }, 500);
  }, [storeAuthData, validateWithBackend, getToken]);

  const logout = useCallback(() => {
    console.log('ROOT LOGOUT: User logging out');

    // Only redirect if not already on auth callback page
    const shouldRedirect = !window.location.pathname.includes('/auth/callback');
    
    if (token) {
      fetch(`${BASE_URL}/customer/auth/logout`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
      }).catch((error) => console.error('ROOT LOGOUT: Logout API error:', error));
    }

    clearAuthData();
    
    if (shouldRedirect) {
      // Add a small delay to ensure cleanup is complete
      setTimeout(() => {
        window.location.href = '/signin';
      }, 100);
    }
  }, [token, clearAuthData]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('ROOT RELOAD: Starting auth initialization...');

      try {
        // Step 1: Check for stored user data
        const storedUser = getStoredUser();
        console.log('ROOT RELOAD: Checking stored data...');
        console.log('  - Stored user:', storedUser ? 'EXISTS' : 'MISSING');
        
        // Step 2: If we have stored user data, try to get token with retries
        let sessionToken: string | undefined;
        
        if (storedUser) {
          // Try to get token with multiple attempts
          sessionToken = await waitForToken(5, 300);
          
          // If still no token, try backend validation as a last resort
          if (!sessionToken) {
            console.log('ROOT RELOAD: No token found after retries, trying backend validation...');
            const backendResult = await validateWithBackend();
            if (backendResult?.token && backendResult?.user) {
              sessionToken = backendResult.token;
              storeAuthData(sessionToken, backendResult.user);
              console.log('ROOT RELOAD: Backend validation successful, token and user updated');
              setIsLoading(false);
              return;
            }
          }
        }

        // Step 3: If no stored user but we have a token, try to validate with backend
        if (!storedUser && !sessionToken) {
          console.log('ROOT RELOAD: No stored user, checking for token...');
          sessionToken = await waitForToken(3, 200);
        }

        if (!storedUser && sessionToken) {
          console.log('ROOT RELOAD: Found token but no stored user, trying backend validation...');
          const backendResult = await validateWithBackend(sessionToken);
          if (backendResult?.user) {
            storeAuthData(sessionToken, backendResult.user);
            console.log('ROOT RELOAD: User restored from backend validation:', backendResult.user.email);
            setIsLoading(false);
            return;
          }
        }

        // Step 4: Final validation - need both user data and token
        if (!storedUser || !sessionToken) {
          // Instead of clearing immediately, give one more chance with backend validation
          if (!storedUser && !sessionToken) {
            console.log('ROOT RELOAD: No stored data and no token - trying final backend validation...');
            const backendResult = await validateWithBackend();
            if (backendResult?.token && backendResult?.user) {
              storeAuthData(backendResult.token, backendResult.user);
              console.log('ROOT RELOAD: Final backend validation successful');
              setIsLoading(false);
              return;
            }
          }
          
          console.log('ROOT RELOAD: Unable to restore session - clearing auth data');
          clearAuthData();
          setIsLoading(false);
          return;
        }

        // Step 5: We have both user and token - set auth state
        console.log('ROOT RELOAD: Valid stored user found:', storedUser.email);
        
        // Set auth state
        setToken(sessionToken);
        setUser(storedUser);
        setIsAuthenticated(true);
        console.log('ROOT RELOAD: User authenticated successfully on reload');
        
      } catch (error) {
        console.error('ROOT RELOAD: Auth initialization error:', error);
        // Don't clear auth data on network errors, just set loading to false
        console.log('ROOT RELOAD: Network error - keeping existing auth state');
      } finally {
        setIsLoading(false);
        console.log('ROOT RELOAD: Auth initialization complete');
      }
    };

    initializeAuth();
  }, [getStoredUser, waitForToken, validateWithBackend, storeAuthData, clearAuthData]);

  // Token refresh interval effect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('ROOT: Setting up token refresh interval');

      const interval = setInterval(async () => {
        console.log('ROOT: Periodic token refresh check');
        const currentToken = getToken();
        if (currentToken) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.warn('ROOT: Token refresh failed, logging out');
            logout();
          }
        }
      }, 15 * 60 * 1000); // 15 minutes

      return () => {
        console.log('ROOT: Clearing token refresh interval');
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