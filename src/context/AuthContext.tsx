// Updated AuthContext

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
  accessToken: string | null; // New field for access_token
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokenData: string | { token?: string; access_token?: string } | null, user: User, isCheckoutFlow?: boolean) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_URL = 'https://api.digikenya.co.ke';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useCallback((): { token?: string; accessToken?: string } => {
    const sessionToken = localStorage.getItem('session_token');
    const localAccessToken = localStorage.getItem('access_token');

    const getCookieTokens = (): { sessionToken?: string; accessToken?: string } => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'session_token' || name === 'access_token') {
          acc[name] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      return { sessionToken: cookies.session_token, accessToken: cookies.access_token };
    };

    const cookieTokens = getCookieTokens();

    // Synchronize tokens
    if (cookieTokens.sessionToken && !sessionToken) {
      localStorage.setItem('session_token', cookieTokens.sessionToken);
      console.log('ROOT TOKEN SYNC: Synced session_token from cookie to localStorage');
    }
    if (cookieTokens.accessToken && !localAccessToken) {
      localStorage.setItem('access_token', cookieTokens.accessToken);
      console.log('ROOT TOKEN SYNC: Synced access_token from cookie to localStorage');
    }
    if (sessionToken && !cookieTokens.sessionToken) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `session_token=${sessionToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
      console.log('ROOT TOKEN SYNC: Synced session_token from localStorage to cookie');
    }
    if (localAccessToken && !cookieTokens.accessToken) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `access_token=${localAccessToken}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
      console.log('ROOT TOKEN SYNC: Synced access_token from localStorage to cookie');
    }

    const finalToken = sessionToken || cookieTokens.sessionToken;
    const finalAccessToken = localAccessToken || cookieTokens.accessToken || finalToken;

    console.log('ROOT TOKEN CHECK:', {
      sessionToken: sessionToken ? 'EXISTS' : 'MISSING',
      accessToken: localAccessToken ? 'EXISTS' : 'MISSING',
      cookieSession: cookieTokens.sessionToken ? 'EXISTS' : 'MISSING',
      cookieAccess: cookieTokens.accessToken ? 'EXISTS' : 'MISSING',
      finalToken: finalToken ? 'FOUND' : 'NOT_FOUND',
      finalAccessToken: finalAccessToken ? 'FOUND' : 'NOT_FOUND',
    });

    return { token: finalToken, accessToken: finalAccessToken };
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

  const validateWithBackend = useCallback(async (tokenToValidate?: string): Promise<{ token?: string; access_token?: string; user?: User } | null> => {
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
            access_token: data.data.access_token || data.data.token, // Fallback to token if access_token not present
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

  const storeAuthData = useCallback((tokenData: { token?: string; access_token?: string } | null, userData: User) => {
    console.log('ROOT: Storing auth data for user:', userData.email);

    const sessionToken = tokenData?.token;
    const accessTokenValue = tokenData?.access_token || tokenData?.token; // Fallback to token if access_token not present

    setToken(sessionToken || null);
    setAccessToken(accessTokenValue || null);
    setUser(userData);
    setIsAuthenticated(true);

    // Store user data
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('user', JSON.stringify(userData));

    // Store tokens
    if (sessionToken) {
      localStorage.setItem('session_token', sessionToken);
      console.log('ROOT: Session token stored in localStorage');
    }

    if (accessTokenValue) {
      localStorage.setItem('access_token', accessTokenValue);
      console.log('ROOT: Access token stored in localStorage');

      // Set cookies for both tokens
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      
      document.cookie = `session_token=${accessTokenValue}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
      document.cookie = `access_token=${accessTokenValue}; expires=${expires.toUTCString()}; path=/; domain=.digikenya.co.ke; secure; samesite=lax`;
    }

    console.log('ROOT: Auth data stored successfully');
  }, []);

  const clearAuthData = useCallback(() => {
    console.log('ROOT: Clearing all auth data');

    setToken(null);
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('user');

    // Clear cookies
    const clearCookie = (name: string, domain: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    };

    clearCookie('session_token', '.digikenya.co.ke');
    clearCookie('access_token', '.digikenya.co.ke');
    clearCookie('session_token', 'digikenya.co.ke');
    clearCookie('access_token', 'digikenya.co.ke');

    console.log('ROOT: Auth data cleared');
  }, []);

  // Helper function to wait for token with retries
  const waitForToken = useCallback(async (maxRetries: number = 5, delayMs: number = 200): Promise<{ token?: string; accessToken?: string } | null> => {
    for (let i = 0; i < maxRetries; i++) {
      const tokens = getToken();
      if (tokens.token || tokens.accessToken) {
        console.log(`ROOT TOKEN FOUND on attempt ${i + 1}`);
        return tokens;
      }
      if (i < maxRetries - 1) {
        console.log(`ROOT TOKEN RETRY ${i + 1}/${maxRetries} - waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    console.log(`ROOT TOKEN NOT FOUND after ${maxRetries} attempts`);
    return null;
  }, [getToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const tokens = getToken();
    const currentToken = tokens.accessToken || tokens.token;

    if (!currentToken) {
      console.log('ROOT: No token to refresh');
      return false;
    }

    try {
      console.log('ROOT: Attempting token refresh with verify-token endpoint');
      const response = await fetch(`${BASE_URL}/customer/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          console.log('ROOT: Token refreshed successfully');
          storeAuthData({
            token: data.data.token,
            access_token: data.data.access_token || data.data.token
          }, data.data.user);
          return true;
        }
      }
      console.log('ROOT: Initial token refresh failed, attempting fallback with /me endpoint');
      const meResponse = await fetch(`${BASE_URL}/customer/auth/me`, {
        method: 'GET',
        credentials: 'include', // Use cookies
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        if (meData.success && meData.data?.user) {
          console.log('ROOT: Token refreshed via /me endpoint');
          storeAuthData({
            token: meData.data.token,
            access_token: meData.data.access_token || meData.data.token
          }, meData.data.user);
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

  const login = useCallback(async (
    tokenData: string | { token?: string; access_token?: string } | null, 
    newUser: User, 
    isCheckoutFlow: boolean = false
  ) => {
    console.log('ROOT LOGIN: User logging in:', newUser.email, { isCheckoutFlow });
    console.log('ROOT LOGIN: Token data provided:', tokenData ? 'YES' : 'NO');

    if (!newUser) {
      console.error('ROOT LOGIN: No user data provided for login');
      throw new Error('User data is missing');
    }

    // Normalize token data
    let normalizedTokenData: { token?: string; access_token?: string } | null = null;
    
    if (typeof tokenData === 'string') {
      // Legacy: single token string
      normalizedTokenData = { token: tokenData, access_token: tokenData };
    } else if (tokenData && typeof tokenData === 'object') {
      // New: token object with separate fields
      normalizedTokenData = tokenData;
    }

    if (normalizedTokenData && !isCheckoutFlow) {
      // Validate token if provided and not checkout flow
      const tokenToValidate = normalizedTokenData.access_token || normalizedTokenData.token;
      const validation = await validateWithBackend(tokenToValidate);
      
      if (validation?.user) {
        storeAuthData({
          token: validation.token,
          access_token: validation.access_token
        }, validation.user);
      } else {
        // If validation fails but we have token data, still try to store it
        console.warn('ROOT LOGIN: Backend validation failed, but storing provided tokens');
        storeAuthData(normalizedTokenData, newUser);
      }
    } else if (isCheckoutFlow) {
      // For checkout flow, allow login without token if user is verified
      if (newUser.is_email_verified && newUser.account_status === 'active') {
        console.log('ROOT LOGIN: Bypassing token validation for checkout flow with verified user');
        storeAuthData(normalizedTokenData, newUser);
      } else {
        console.error('ROOT LOGIN: User not verified for checkout flow');
        throw new Error('User is not verified or account is not active');
      }
    } else {
      // No token provided, store user data and rely on cookies
      storeAuthData(normalizedTokenData, newUser);
    }

    // Clean up URL if token was in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verify token availability after a short delay
    setTimeout(() => {
      const finalTokens = getToken();
      console.log('ROOT LOGIN: Final token verification:', {
        token: finalTokens.token ? 'SUCCESS' : 'FAILED',
        accessToken: finalTokens.accessToken ? 'SUCCESS' : 'FAILED'
      });
      
      if (!finalTokens.token && !finalTokens.accessToken) {
        console.warn('ROOT LOGIN: No tokens found after login - this may cause issues on reload');
      }
    }, 500);
  }, [storeAuthData, validateWithBackend, getToken]);

  const logout = useCallback(() => {
    console.log('ROOT LOGOUT: User logging out');

    // Only redirect if not already on auth callback page
    const shouldRedirect = !window.location.pathname.includes('/auth/callback');
    
    const tokens = getToken();
    const currentToken = tokens.accessToken || tokens.token;
    
    if (currentToken) {
      fetch(`${BASE_URL}/customer/auth/logout`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${currentToken}`, 
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
  }, [getToken, clearAuthData]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('ROOT RELOAD: Starting auth initialization...');

      try {
        // Step 1: Check for stored user data
        const storedUser = getStoredUser();
        console.log('ROOT RELOAD: Checking stored data...');
        console.log('  - Stored user:', storedUser ? 'EXISTS' : 'MISSING');
        
        // Step 2: If we have stored user data, try to get tokens with retries
        let sessionTokens: { token?: string; accessToken?: string } | null = null;
        
        if (storedUser) {
          // Try to get tokens with multiple attempts
          sessionTokens = await waitForToken(5, 300);
          
          // If still no tokens, try backend validation as a last resort
          if (!sessionTokens?.token && !sessionTokens?.accessToken) {
            console.log('ROOT RELOAD: No tokens found after retries, trying backend validation...');
            const backendResult = await validateWithBackend();
            if (backendResult?.user) {
              storeAuthData({
                token: backendResult.token,
                access_token: backendResult.access_token
              }, backendResult.user);
              console.log('ROOT RELOAD: Backend validation successful, tokens and user updated');
              setIsLoading(false);
              return;
            }
          }
        }

        // Step 3: If no stored user but we have tokens, try to validate with backend
        if (!storedUser && (!sessionTokens?.token && !sessionTokens?.accessToken)) {
          console.log('ROOT RELOAD: No stored user, checking for tokens...');
          sessionTokens = await waitForToken(3, 200);
        }

        if (!storedUser && (sessionTokens?.token || sessionTokens?.accessToken)) {
          console.log('ROOT RELOAD: Found tokens but no stored user, trying backend validation...');
          const tokenToValidate = sessionTokens.accessToken || sessionTokens.token;
          const backendResult = await validateWithBackend(tokenToValidate);
          if (backendResult?.user) {
            storeAuthData({
              token: backendResult.token,
              access_token: backendResult.access_token
            }, backendResult.user);
            console.log('ROOT RELOAD: User restored from backend validation:', backendResult.user.email);
            setIsLoading(false);
            return;
          }
        }

        // Step 4: Final validation - need both user data and at least one token
        if (!storedUser || (!sessionTokens?.token && !sessionTokens?.accessToken)) {
          // Instead of clearing immediately, give one more chance with backend validation
          if (!storedUser && (!sessionTokens?.token && !sessionTokens?.accessToken)) {
            console.log('ROOT RELOAD: No stored data and no tokens - trying final backend validation...');
            const backendResult = await validateWithBackend();
            if (backendResult?.user) {
              storeAuthData({
                token: backendResult.token,
                access_token: backendResult.access_token
              }, backendResult.user);
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

        // Step 5: We have both user and tokens - set auth state
        console.log('ROOT RELOAD: Valid stored user found:', storedUser.email);
        
        // Set auth state
        setToken(sessionTokens.token || null);
        setAccessToken(sessionTokens.accessToken || null);
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
        const tokens = getToken();
        if (tokens.token || tokens.accessToken) {
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
    accessToken,
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