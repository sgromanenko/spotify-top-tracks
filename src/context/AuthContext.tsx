import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  clearStoredToken,
  getAccessTokenFromHash,
  getStoredToken,
  loginWithSpotify,
  logout as logoutFromSpotify,
  storeToken,
} from '../services/auth/spotifyAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to check for token and update state
  const refreshAuthState = useCallback(() => {
    // First check for token in localStorage
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      return;
    }

    // If no token in storage, try to get from URL hash
    const { token: hashToken, expires_in } = getAccessTokenFromHash();
    if (hashToken && expires_in) {
      storeToken(hashToken, expires_in);
      setToken(hashToken);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setToken(null);
    }
  }, []);

  // Check for token on initial load
  useEffect(() => {
    refreshAuthState();
    setLoading(false);
  }, [refreshAuthState]);

  // Periodically check token validity
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      if (token) {
        // This will update our token state if it's expired
        refreshAuthState();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, [token, refreshAuthState]);

  const handleLogin = () => {
    loginWithSpotify();
  };

  const handleLogout = () => {
    clearStoredToken();
    setToken(null);
    logoutFromSpotify();
  };

  const value = {
    isAuthenticated: Boolean(token),
    token,
    login: handleLogin,
    logout: handleLogout,
    loading,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
