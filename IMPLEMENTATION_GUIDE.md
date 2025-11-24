# Implementation Guide - Spotify Application Expansion

## 🎯 Overview

This guide provides practical implementation steps, best practices, and code examples for expanding the Spotify application. It focuses on maintainable, scalable, and performant code following modern React and TypeScript patterns.

## 🏗️ Architecture Patterns

### 1. Feature-Based Organization

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── tracks/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── playlists/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── app/
    ├── providers/
    ├── routing/
    └── layout/
```

### 2. State Management with Zustand

```typescript
// stores/auth.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  setError: (error: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (code: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(code);
            set({
              user: response.user,
              token: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
            });
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },

        refreshToken: async () => {
          const { token } = get();
          if (!token) return;

          try {
            const newToken = await authService.refreshToken(token);
            set({ token: newToken });
          } catch (error) {
            get().logout();
          }
        },

        setUser: (user: UserProfile) => set({ user }),
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'auth-storage',
        partialize: state => ({ token: state.token, user: state.user }),
      }
    )
  )
);
```

### 3. React Query Integration

```typescript
// hooks/useSpotifyQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotifyApi } from '../services/spotify';

// Query keys factory
export const spotifyKeys = {
  all: ['spotify'] as const,
  tracks: () => [...spotifyKeys.all, 'tracks'] as const,
  track: (id: string) => [...spotifyKeys.tracks(), id] as const,
  topTracks: (timeRange: TimeRange) => [...spotifyKeys.tracks(), 'top', timeRange] as const,
  playlists: () => [...spotifyKeys.all, 'playlists'] as const,
  playlist: (id: string) => [...spotifyKeys.playlists(), id] as const,
  user: () => [...spotifyKeys.all, 'user'] as const,
  userProfile: (id: string) => [...spotifyKeys.user(), id] as const,
};

// Custom hooks
export const useTopTracks = (timeRange: TimeRange = 'long_term') => {
  return useQuery({
    queryKey: spotifyKeys.topTracks(timeRange),
    queryFn: () => spotifyApi.getTopTracks(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false; // Don't retry auth errors
      }
      return failureCount < 3;
    },
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: spotifyKeys.playlist(id),
    queryFn: () => spotifyApi.getPlaylist(id),
    enabled: !!id,
  });
};

export const useSaveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => spotifyApi.saveTrack(trackId),
    onSuccess: (_, trackId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: spotifyKeys.tracks() });
      queryClient.invalidateQueries({ queryKey: spotifyKeys.user() });
    },
    onError: error => {
      console.error('Failed to save track:', error);
    },
  });
};
```

## 🧩 Component Patterns

### 1. Compound Components

```typescript
// components/Card/Card.tsx
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  background: ${({ theme }) => theme.colors.background.elevated};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

interface CardProps {
  children: React.ReactNode;
}

const Card = ({ children }: CardProps) => {
  return <CardContainer>{children}</CardContainer>;
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;

export default Card;
```

### 2. Render Props Pattern

```typescript
// components/WithSpotifyData/WithSpotifyData.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface WithSpotifyDataProps<T> {
  children: (data: T, loading: boolean, error: string | null) => React.ReactNode;
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

export const WithSpotifyData = <T,>({
  children,
  queryKey,
  queryFn,
  enabled = true,
}: WithSpotifyDataProps<T>) => {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  return <>{children(data, isLoading, error?.message || null)}</>;
};

// Usage
<WithSpotifyData
  queryKey={spotifyKeys.topTracks('long_term')}
  queryFn={() => spotifyApi.getTopTracks('long_term')}
>
  {(tracks, loading, error) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    return <TracksList tracks={tracks} />;
  }}
</WithSpotifyData>
```

### 3. Custom Hooks

```typescript
// hooks/usePlayer.ts
import { useCallback, useEffect, useState } from 'react';
import { usePlayerStore } from '../stores/player';

export const usePlayer = () => {
  const { currentTrack, isPlaying, volume, position, duration, play, pause, seek, setVolume } =
    usePlayerStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize player
    const initPlayer = async () => {
      try {
        await window.Spotify.Player.init();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize player:', error);
      }
    };

    initPlayer();
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const skipTo = useCallback(
    async (positionMs: number) => {
      await seek(positionMs);
    },
    [seek]
  );

  return {
    currentTrack,
    isPlaying,
    isReady,
    volume,
    position,
    duration,
    togglePlay,
    skipTo,
    setVolume,
  };
};

// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
```

## 🔧 Performance Optimization

### 1. React.memo and useMemo

```typescript
// components/TrackItem/TrackItem.tsx
import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

interface TrackItemProps {
  track: SpotifyTrack;
  onPlay: (track: SpotifyTrack) => void;
  onSave: (trackId: string) => void;
  isSaved?: boolean;
}

const TrackItem = React.memo<TrackItemProps>(({ track, onPlay, onSave, isSaved }) => {
  const artistNames = useMemo(() => {
    return track.artists.map(artist => artist.name).join(', ');
  }, [track.artists]);

  const albumImage = useMemo(() => {
    return track.album.images[0]?.url;
  }, [track.album.images]);

  const handlePlay = useCallback(() => {
    onPlay(track);
  }, [track, onPlay]);

  const handleSave = useCallback(() => {
    onSave(track.id);
  }, [track.id, onSave]);

  return (
    <TrackItemContainer>
      <TrackImage src={albumImage} alt={track.album.name} />
      <TrackInfo>
        <TrackName>{track.name}</TrackName>
        <ArtistName>{artistNames}</ArtistName>
      </TrackInfo>
      <TrackActions>
        <PlayButton onClick={handlePlay}>Play</PlayButton>
        <SaveButton onClick={handleSave} isSaved={isSaved}>
          {isSaved ? 'Saved' : 'Save'}
        </SaveButton>
      </TrackActions>
    </TrackItemContainer>
  );
});

TrackItem.displayName = 'TrackItem';

export default TrackItem;
```

### 2. Virtual Scrolling

```typescript
// components/VirtualizedList/VirtualizedList.tsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { SpotifyTrack } from '../../types';

interface VirtualizedListProps {
  tracks: SpotifyTrack[];
  height: number;
  itemHeight: number;
  onPlay: (track: SpotifyTrack) => void;
  onSave: (trackId: string) => void;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  tracks,
  height,
  itemHeight,
  onPlay,
  onSave,
}) => {
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const track = tracks[index];

    return (
      <div style={style}>
        <TrackItem
          track={track}
          onPlay={onPlay}
          onSave={onSave}
        />
      </div>
    );
  });

  Row.displayName = 'Row';

  return (
    <List
      height={height}
      itemCount={tracks.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default VirtualizedList;
```

### 3. Code Splitting

```typescript
// App.tsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const Playlists = lazy(() => import('./features/playlists/components/Playlists'));
const Analytics = lazy(() => import('./features/analytics/components/Analytics'));
const Search = lazy(() => import('./features/search/components/Search'));

// Loading fallback
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <LoadingSpinner />
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/top-tracks" element={<TopTracks />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Suspense>
  );
};

export default App;
```

## 🛡️ Error Handling

### 1. Error Boundaries

```typescript
// components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  margin-bottom: 1rem;
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to error reporting service
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorMessage>
            Something went wrong. Please try again.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Retry
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 2. API Error Handling

```typescript
// services/api/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Response) {
    return new APIError(`HTTP ${error.status}: ${error.statusText}`, error.status);
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500);
  }

  return new APIError('An unknown error occurred', 500);
};

// services/api/client.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { APIError, handleAPIError } from './errorHandler';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      try {
        const newToken = await refreshToken();
        localStorage.setItem('access_token', newToken);

        // Retry original request
        const originalRequest = error.config;
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }

    throw handleAPIError(error);
  }
);

export default apiClient;
```

## 🧪 Testing Patterns

### 1. Component Testing

```typescript
// components/TrackItem/TrackItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import TrackItem from './TrackItem';
import { theme } from '../../theme';

const mockTrack: SpotifyTrack = {
  id: '1',
  name: 'Test Track',
  artists: [{ id: '1', name: 'Test Artist' }],
  album: {
    id: '1',
    name: 'Test Album',
    images: [{ url: 'test.jpg', height: 300, width: 300 }],
  },
  duration_ms: 180000,
  track_number: 1,
  preview_url: null,
  is_playable: true,
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('TrackItem', () => {
  const mockOnPlay = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders track information correctly', () => {
    render(
      <TestWrapper>
        <TrackItem
          track={mockTrack}
          onPlay={mockOnPlay}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByAltText('Test Album')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    render(
      <TestWrapper>
        <TrackItem
          track={mockTrack}
          onPlay={mockOnPlay}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(mockOnPlay).toHaveBeenCalledWith(mockTrack);
  });

  it('calls onSave when save button is clicked', () => {
    render(
      <TestWrapper>
        <TrackItem
          track={mockTrack}
          onPlay={mockOnPlay}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockOnSave).toHaveBeenCalledWith(mockTrack.id);
  });

  it('shows saved state when track is saved', () => {
    render(
      <TestWrapper>
        <TrackItem
          track={mockTrack}
          onPlay={mockOnPlay}
          onSave={mockOnSave}
          isSaved={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});
```

### 2. Hook Testing

```typescript
// hooks/usePlayer.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from './usePlayer';
import { usePlayerStore } from '../stores/player';

// Mock the player store
jest.mock('../stores/player');

describe('usePlayer', () => {
  const mockPlay = jest.fn();
  const mockPause = jest.fn();
  const mockSeek = jest.fn();
  const mockSetVolume = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      volume: 0.5,
      position: 0,
      duration: 0,
      play: mockPlay,
      pause: mockPause,
      seek: mockSeek,
      setVolume: mockSetVolume,
    });
  });

  it('returns player state and actions', () => {
    const { result } = renderHook(() => usePlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(0.5);
    expect(typeof result.current.togglePlay).toBe('function');
    expect(typeof result.current.skipTo).toBe('function');
  });

  it('calls play when togglePlay is called and not playing', () => {
    const { result } = renderHook(() => usePlayer());

    act(() => {
      result.current.togglePlay();
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockPause).not.toHaveBeenCalled();
  });

  it('calls pause when togglePlay is called and playing', () => {
    (usePlayerStore as jest.Mock).mockReturnValue({
      isPlaying: true,
      play: mockPlay,
      pause: mockPause,
      seek: mockSeek,
      setVolume: mockSetVolume,
    });

    const { result } = renderHook(() => usePlayer());

    act(() => {
      result.current.togglePlay();
    });

    expect(mockPause).toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  });
});
```

## 🚀 Deployment & CI/CD

### 1. Environment Configuration

```typescript
// config/environment.ts
interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  REACT_APP_SPOTIFY_CLIENT_ID: string;
  REACT_APP_SPOTIFY_REDIRECT_URI: string;
  REACT_APP_API_URL: string;
  REACT_APP_SENTRY_DSN?: string;
  REACT_APP_ALGOLIA_APP_ID?: string;
  REACT_APP_ALGOLIA_SEARCH_KEY?: string;
}

const validateEnvironment = (): Environment => {
  const required = [
    'REACT_APP_SPOTIFY_CLIENT_ID',
    'REACT_APP_SPOTIFY_REDIRECT_URI',
    'REACT_APP_API_URL',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV as Environment['NODE_ENV'],
    REACT_APP_SPOTIFY_CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID!,
    REACT_APP_SPOTIFY_REDIRECT_URI: process.env.REACT_APP_SPOTIFY_REDIRECT_URI!,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL!,
    REACT_APP_SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
    REACT_APP_ALGOLIA_APP_ID: process.env.REACT_APP_ALGOLIA_APP_ID,
    REACT_APP_ALGOLIA_SEARCH_KEY: process.env.REACT_APP_ALGOLIA_SEARCH_KEY,
  };
};

export const env = validateEnvironment();
```

### 2. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run typecheck

      - name: Run tests
        run: npm run test:coverage

      - name: Build application
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Monitoring & Analytics

### 1. Performance Monitoring

```typescript
// utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();

  console.log(`${name} took ${end - start}ms`);

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'performance', {
      event_category: 'timing',
      event_label: name,
      value: Math.round(end - start),
    });
  }
};

export const trackPageLoad = () => {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
    };

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'page_load', {
        event_category: 'performance',
        custom_map: {
          dns_time: 'dns',
          tcp_time: 'tcp',
          ttfb: 'ttfb',
          dom_content_loaded: 'domContentLoaded',
          load_time: 'load',
        },
        ...metrics,
      });
    }
  });
};
```

### 2. Error Tracking

```typescript
// utils/errorTracking.ts
export const initializeErrorTracking = () => {
  if (process.env.NODE_ENV === 'production' && window.Sentry) {
    window.Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new window.Sentry.BrowserTracing({
          routingInstrumentation: window.Sentry.reactRouterV6Instrumentation(
            history => history.listen
          ),
        }),
      ],
      tracesSampleRate: 0.1,
    });
  }
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('Error tracked:', error, context);

  if (window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', action, properties);
  }

  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'user_action',
      message: action,
      data: properties,
    });
  }
};
```

This implementation guide provides practical patterns and examples for building a robust, scalable Spotify application. Follow these patterns to ensure maintainable code, good performance, and reliable functionality.
