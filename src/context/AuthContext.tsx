import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  clearStoredToken,
  getAccessTokenFromHash,
  getStoredToken,
  loginWithSpotify,
  logout as logoutFromSpotify,
  storeToken
} from '../services/auth/spotifyAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL hash (after redirect from Spotify)
    const { token: hashToken, expires_in } = getAccessTokenFromHash();

    if (hashToken && expires_in) {
      // Store new token
      storeToken(hashToken, expires_in);
      setToken(hashToken);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check for existing token in storage
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
      }
    }

    setLoading(false);
  }, []);

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
    loading
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
