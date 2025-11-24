import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuthStore, UserProfile } from '@/stores/auth';

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
  user: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setToken: setStoreToken, setUser, user } = useAuthStore();

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

  // Sync token to store and ensure user profile is loaded when we have a token
  useEffect(() => {
    if (token) {
      setStoreToken(token);

      // If we don't have a user yet, fetch it
      if (!user) {
        (async () => {
          try {
            const res = await fetch('https://api.spotify.com/v1/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
            const profile = await res.json();
            setUser({
              id: profile.id,
              spotifyId: profile.id,
              displayName: profile.display_name || profile.id,
              email: profile.email || '',
              profileImage: profile.images?.[0]?.url,
              preferences: {
                theme: 'dark',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                privacy: {
                  profileVisibility: 'public',
                  listeningActivity: 'public',
                },
              },
              statistics: {
                totalListeningTime: 0,
                totalTracksPlayed: 0,
                favoriteGenres: [],
                topArtists: [],
                listeningStreak: 0,
                averageSessionLength: 0,
              },
              createdAt: new Date(),
              lastActive: new Date(),
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Could not load Spotify user profile on init:', e);
          }
        })();
      }
    }
  }, [token, setStoreToken, setUser, user]);

  const handleLogin = () => {
    loginWithSpotify();
  };

  const handleLogout = () => {
    clearStoredToken();
    setToken(null);
  // Clear store as well
  useAuthStore.setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    logoutFromSpotify();
  };

  const value = {
    isAuthenticated: Boolean(token),
    token,
    login: handleLogin,
    logout: handleLogout,
    loading,
    refreshAuthState,
    user,
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
