import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuthStore, UserProfile } from '@/stores/auth';

import {
  clearStoredToken,
  getStoredToken,
  loginWithSpotify,
  logout as logoutFromSpotify,
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
  const refreshAuthState = useCallback(async () => {
    try {
      // Try to get valid token (this will auto-refresh if needed)
      const storedToken = await getStoredToken();
      
      if (storedToken) {
        setToken(storedToken);
        setStoreToken(storedToken);
      } else {
        setToken(null);
        setStoreToken(null);
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setToken(null);
      setStoreToken(null);
    }
  }, [setStoreToken]);

  // Check for token on initial load
  useEffect(() => {
    const initAuth = async () => {
      await refreshAuthState();
      setLoading(false);
    };
    initAuth();
  }, [refreshAuthState]);

  // Periodically check token validity (every minute)
  useEffect(() => {
    if (!token) return;

    const checkTokenInterval = setInterval(async () => {
      await refreshAuthState();
    }, 60000);

    return () => clearInterval(checkTokenInterval);
  }, [token, refreshAuthState]);

  // Ensure user profile is loaded when we have a token
  useEffect(() => {
    if (token && !user) {
      (async () => {
        try {
          const res = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.status === 401) {
            // Token might be invalid despite our checks, force refresh
            await refreshAuthState();
            return;
          }

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
          console.warn('Could not load Spotify user profile:', e);
        }
      })();
    }
  }, [token, user, setUser, refreshAuthState]);

  const handleLogin = () => {
    loginWithSpotify();
  };

  const handleLogout = () => {
    clearStoredToken();
    setToken(null);
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
