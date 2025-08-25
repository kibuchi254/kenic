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
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = 'https://api.digikenya.co.ke';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      console.log(`AuthProvider: getCookie ${name}=${cookieValue}`);
      return cookieValue;
    }
    console.log(`AuthProvider: getCookie ${name} not found`);
    return undefined;
  };

  const validateToken = useCallback(async (tokenToValidate: string) => {
    try {
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
        return false;
      }
      
      const data = await response.json();
      console.log('AuthProvider: Token validation response:', response.status, data);
      return data.success;
    } catch (error) {
      console.error('AuthProvider: Token validation error:', error);
      return false;
    }
  }, []);

  // Clear all stored auth data
  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // Clear cookie by setting it to expire
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing auth...');
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const storedToken = getCookie('session_token') || localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        console.log('AuthProvider: urlToken=', urlToken);
        console.log('AuthProvider: storedToken=', storedToken);
        console.log('AuthProvider: storedUser=', storedUser);

        let tokenToValidate = urlToken || storedToken;

        if (tokenToValidate) {
          const isValid = await validateToken(tokenToValidate);
          
          if (isValid) {
            setToken(tokenToValidate);
            setIsAuthenticated(true);

            if (storedUser) {
              try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
                console.log('AuthProvider: User set from storage:', parsedUser);
              } catch (e) {
                console.error('AuthProvider: Invalid stored user data:', e);
                // Clear invalid user data
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
              }
            }

            if (urlToken) {
              localStorage.setItem('access_token', urlToken);
              sessionStorage.setItem('access_token', urlToken);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else {
            console.warn('AuthProvider: Token invalid, clearing state');
            clearAuthData();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.warn('AuthProvider: No token found');
        }
      } catch (error) {
        console.error('AuthProvider: Initialization error:', error);
        clearAuthData();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [validateToken]);

  const login = (newToken: string, newUser: User) => {
    console.log('AuthProvider: Logging in with token=', newToken, 'user=', newUser);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('access_token', newToken);
    sessionStorage.setItem('access_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    console.log('AuthProvider: Logging out');
    
    // Make logout API call but don't block the logout process
    if (token) {
      fetch(`${BASE_URL}/customer/auth/logout`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
      }).catch((error) => console.error('AuthProvider: Logout error:', error));
    }

    clearAuthData();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = 'https://digikenya.co.ke/signin';
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};