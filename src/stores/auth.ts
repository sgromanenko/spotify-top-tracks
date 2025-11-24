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
        login: async () => {
          // Logic handled by AuthContext/spotifyAuth
          console.warn('Login action in store is deprecated, use AuthContext');
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
           // Logic handled by AuthContext/spotifyAuth
           console.warn('refreshAccessToken action in store is deprecated, use AuthContext');
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
