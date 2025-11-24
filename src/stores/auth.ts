import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  spotifyId: string;
  displayName: string;
  email: string;
  profileImage?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      listeningActivity: 'public' | 'private' | 'friends';
    };
  };
  statistics: {
    totalListeningTime: number;
    totalTracksPlayed: number;
    favoriteGenres: Array<{ name: string; percentage: number }>;
    topArtists: Array<{ id: string; name: string; playCount: number }>;
    listeningStreak: number;
    averageSessionLength: number;
  };
  createdAt: Date;
  lastActive: Date;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateUserPreferences: (preferences: Partial<UserProfile['preferences']>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (code: string) => {
          set({ isLoading: true, error: null });
          try {
            // Exchange code for tokens
            const response = await fetch('/api/auth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code }),
            });

            if (!response.ok) {
              throw new Error('Failed to authenticate');
            }

            const { accessToken, refreshToken, user } = await response.json();

            set({
              token: accessToken,
              refreshToken,
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
              isAuthenticated: false,
            });
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        },

        refreshAccessToken: async () => {
          const { refreshToken } = get();
          if (!refreshToken) {
            get().logout();
            return;
          }

          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const { accessToken } = await response.json();
            set({ token: accessToken });
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().logout();
          }
        },

  setUser: (user: UserProfile) => set({ user }),
  setToken: (token: string) => set({ token, isAuthenticated: Boolean(token) }),
        setError: (error: string | null) => set({ error }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),

        updateUserPreferences: (preferences: Partial<UserProfile['preferences']>) => {
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                preferences: {
                  ...user.preferences,
                  ...preferences,
                },
              },
            });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
        }),
      }
    )
  )
);
