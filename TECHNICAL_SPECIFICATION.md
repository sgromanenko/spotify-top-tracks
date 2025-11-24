# Technical Specification - Spotify Application Expansion

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Layer](#data-layer)
3. [State Management](#state-management)
4. [API Design](#api-design)
5. [Component Architecture](#component-architecture)
6. [Performance Optimization](#performance-optimization)
7. [Security Implementation](#security-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Observability](#monitoring--observability)

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Layer  │    │   Service Layer │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │◄──►│ │ React Query │ │◄──►│ │   Spotify   │ │
│ │ Components  │ │    │ │   Zustand   │ │    │ │     API     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Router    │ │    │ │   Services  │ │    │ │   Supabase  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cache Layer   │    │   State Store   │    │   Data Storage  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Redis     │ │    │ │   Zustand   │ │    │ │ PostgreSQL  │ │
│ │   Memory    │ │    │ │   Context   │ │    │ │   Storage   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend

- **Framework**: React 19 with TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Styled-components with design tokens
- **Routing**: React Router v7
- **Build Tool**: Vite with SWC
- **Testing**: Jest + React Testing Library + MSW

#### Backend Services

- **API Gateway**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Search**: Algolia
- **File Storage**: Supabase Storage

#### Infrastructure

- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions

## 📊 Data Layer

### Data Models

#### User Profile

```typescript
interface UserProfile {
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
    favoriteGenres: string[];
    topArtists: string[];
    createdAt: Date;
    lastActive: Date;
  };
}
```

#### Listening Session

```typescript
interface ListeningSession {
  id: string;
  userId: string;
  trackId: string;
  artistId: string;
  albumId: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  platform: 'web' | 'mobile' | 'desktop';
  context: {
    type: 'playlist' | 'album' | 'artist' | 'search' | 'radio';
    id?: string;
    name?: string;
  };
}
```

#### Playlist

```typescript
interface Playlist {
  id: string;
  spotifyId: string;
  name: string;
  description?: string;
  ownerId: string;
  isCollaborative: boolean;
  isPublic: boolean;
  tracks: PlaylistTrack[];
  followers: number;
  images: SpotifyImage[];
  createdAt: Date;
  updatedAt: Date;
}

interface PlaylistTrack {
  id: string;
  trackId: string;
  addedAt: Date;
  addedBy: string;
  position: number;
}
```

### Database Schema

#### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  profile_image_url TEXT,
  preferences JSONB DEFAULT '{}',
  statistics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening sessions table
CREATE TABLE listening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id VARCHAR(255) NOT NULL,
  artist_id VARCHAR(255) NOT NULL,
  album_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER NOT NULL,
  platform VARCHAR(50) NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User playlists table
CREATE TABLE user_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  followers_count INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks table
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES user_playlists(id) ON DELETE CASCADE,
  track_id VARCHAR(255) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  position INTEGER NOT NULL
);

-- User relationships table
CREATE TABLE user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

## 🔄 State Management

### Zustand Store Structure

#### Root Store

```typescript
interface RootStore {
  // Auth state
  auth: AuthStore;

  // Player state
  player: PlayerStore;

  // User data
  user: UserStore;

  // Music data
  music: MusicStore;

  // UI state
  ui: UIStore;

  // Social features
  social: SocialStore;
}

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

interface PlayerStore {
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  isPlaying: boolean;
  volume: number;
  repeatMode: 'off' | 'context' | 'track';
  shuffle: boolean;
  position: number;
  duration: number;
  deviceId: string | null;

  // Actions
  play: (trackUri?: string) => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setRepeatMode: (mode: 'off' | 'context' | 'track') => Promise<void>;
  toggleShuffle: () => Promise<void>;
}

interface MusicStore {
  topTracks: SpotifyTrack[];
  recentTracks: SpotifyTrack[];
  savedTracks: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
  recommendations: SpotifyTrack[];

  // Actions
  fetchTopTracks: (timeRange: TimeRange) => Promise<void>;
  fetchRecentTracks: () => Promise<void>;
  fetchSavedTracks: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
}
```

### React Query Integration

#### Query Keys

```typescript
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  userProfile: (id: string) => ['user', id] as const,
  userStats: (id: string) => ['user', id, 'stats'] as const,

  // Music queries
  topTracks: (timeRange: TimeRange) => ['tracks', 'top', timeRange] as const,
  recentTracks: ['tracks', 'recent'] as const,
  savedTracks: ['tracks', 'saved'] as const,
  playlists: ['playlists'] as const,
  playlist: (id: string) => ['playlist', id] as const,
  recommendations: ['recommendations'] as const,

  // Search queries
  search: (query: string, type: string) => ['search', query, type] as const,

  // Social queries
  friends: ['friends'] as const,
  activity: ['activity'] as const,
} as const;
```

#### Query Hooks

```typescript
// Custom hooks for data fetching
export const useTopTracks = (timeRange: TimeRange = 'long_term') => {
  return useQuery({
    queryKey: queryKeys.topTracks(timeRange),
    queryFn: () => spotifyApi.getTopTracks(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
  });
};

export const useSearch = (query: string, type: string) => {
  return useQuery({
    queryKey: queryKeys.search(query, type),
    queryFn: () => spotifyApi.search(query, type),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

## 🔌 API Design

### RESTful API Endpoints

#### Authentication

```typescript
// POST /api/auth/login
interface LoginRequest {
  code: string;
  redirectUri: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}
```

#### User Management

```typescript
// GET /api/users/:id
interface GetUserResponse {
  user: UserProfile;
  statistics: UserStatistics;
  recentActivity: ListeningSession[];
}

// PUT /api/users/:id
interface UpdateUserRequest {
  displayName?: string;
  preferences?: Partial<UserPreferences>;
}

// GET /api/users/:id/activity
interface GetUserActivityResponse {
  sessions: ListeningSession[];
  pagination: PaginationInfo;
}
```

#### Music Data

```typescript
// GET /api/music/top-tracks
interface GetTopTracksRequest {
  timeRange: TimeRange;
  limit?: number;
}

// GET /api/music/recent
interface GetRecentTracksRequest {
  limit?: number;
  before?: string;
  after?: string;
}

// GET /api/music/saved
interface GetSavedTracksRequest {
  limit?: number;
  offset?: number;
}

// GET /api/music/recommendations
interface GetRecommendationsRequest {
  seedTracks?: string[];
  seedArtists?: string[];
  seedGenres?: string[];
  limit?: number;
}
```

#### Social Features

```typescript
// GET /api/social/friends
interface GetFriendsResponse {
  friends: UserProfile[];
  pendingRequests: FriendRequest[];
}

// POST /api/social/friends/:id/follow
interface FollowUserRequest {
  userId: string;
}

// GET /api/social/activity
interface GetActivityResponse {
  activities: ActivityItem[];
  pagination: PaginationInfo;
}

// POST /api/social/share
interface ShareMusicRequest {
  type: 'track' | 'playlist' | 'album';
  id: string;
  message?: string;
  visibility: 'public' | 'friends' | 'private';
}
```

### GraphQL Schema (Future Enhancement)

```graphql
type User {
  id: ID!
  spotifyId: String!
  displayName: String!
  email: String!
  profileImage: String
  preferences: UserPreferences!
  statistics: UserStatistics!
  friends: [User!]!
  recentActivity: [ListeningSession!]!
  playlists: [Playlist!]!
}

type ListeningSession {
  id: ID!
  track: Track!
  artist: Artist!
  album: Album!
  startedAt: DateTime!
  endedAt: DateTime
  duration: Int!
  platform: Platform!
  context: ListeningContext
}

type Track {
  id: ID!
  name: String!
  artists: [Artist!]!
  album: Album!
  duration: Int!
  popularity: Int
  previewUrl: String
}

type Query {
  user(id: ID!): User
  currentUser: User
  topTracks(timeRange: TimeRange!): [Track!]!
  recentTracks(limit: Int): [Track!]!
  search(query: String!, type: SearchType!): SearchResults!
  recommendations(seeds: [String!]!): [Track!]!
}

type Mutation {
  updateProfile(input: UpdateProfileInput!): User!
  followUser(userId: ID!): User!
  createPlaylist(input: CreatePlaylistInput!): Playlist!
  shareMusic(input: ShareMusicInput!): ShareResult!
}
```

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── ThemeProvider
├── AuthProvider
├── PlayerProvider
├── SpotifyProvider
└── Router
    ├── LoginPage
    ├── CallbackHandler
    └── ProtectedRoute
        └── MainLayout
            ├── Sidebar
            │   ├── Navigation
            │   ├── UserProfile
            │   └── QuickActions
            ├── MainContent
            │   ├── TopTracks
            │   ├── PlaylistsSection
            │   ├── SearchResults
            │   ├── UserProfile
            │   ├── Analytics
            │   └── Social
            └── SpotifyPlayer
                ├── NowPlaying
                ├── Controls
                ├── Progress
                └── DeviceSelector
```

### Component Patterns

#### Compound Components

```typescript
// Card component with compound pattern
const Card = {
  Root: styled.div`...`,
  Header: styled.div`...`,
  Content: styled.div`...`,
  Footer: styled.div`...`,
  Actions: styled.div`...`,
};

// Usage
<Card.Root>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    <Card.Actions>
      <Button>Action</Button>
    </Card.Actions>
  </Card.Footer>
</Card.Root>
```

#### Render Props Pattern

```typescript
interface WithSpotifyDataProps<T> {
  children: (data: T, loading: boolean, error: string | null) => React.ReactNode;
  queryKey: string[];
  queryFn: () => Promise<T>;
}

const WithSpotifyData = <T,>({ children, queryKey, queryFn }: WithSpotifyDataProps<T>) => {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
  });

  return <>{children(data, isLoading, error)}</>;
};
```

#### Custom Hooks

```typescript
// Player controls hook
export const usePlayerControls = () => {
  const player = usePlayer();
  const [isLoading, setIsLoading] = useState(false);

  const playTrack = useCallback(
    async (trackUri: string) => {
      setIsLoading(true);
      try {
        await player.playTrack(trackUri);
      } catch (error) {
        console.error('Failed to play track:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [player]
  );

  return {
    playTrack,
    isLoading,
    isPlaying: player.isPlaying,
    currentTrack: player.currentTrack,
  };
};

// Search hook
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('track');

  const { data, isLoading, error } = useSearch(query, searchType);

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    results: data,
    isLoading,
    error,
  };
};
```

## ⚡ Performance Optimization

### Code Splitting Strategy

```typescript
// Route-based code splitting
const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const PlaylistsSection = lazy(() => import('./features/playlists/components/PlaylistsSection'));
const Analytics = lazy(() => import('./features/analytics/components/Analytics'));
const Social = lazy(() => import('./features/social/components/Social'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// Dynamic imports for conditional features
const loadFeature = async (featureName: string) => {
  switch (featureName) {
    case 'analytics':
      return import('./features/analytics');
    case 'social':
      return import('./features/social');
    default:
      throw new Error(`Unknown feature: ${featureName}`);
  }
};
```

### Memoization Strategy

```typescript
// Component memoization
const TrackItem = React.memo<TrackItemProps>(({ track, onPlay, onSave }) => {
  const handlePlay = useCallback(() => {
    onPlay(track.uri);
  }, [track.uri, onPlay]);

  const handleSave = useCallback(() => {
    onSave(track.id);
  }, [track.id, onSave]);

  return (
    <TrackItemContainer>
      <TrackInfo>
        <TrackName>{track.name}</TrackName>
        <ArtistName>{track.artists.map(a => a.name).join(', ')}</ArtistName>
      </TrackInfo>
      <TrackActions>
        <PlayButton onClick={handlePlay}>Play</PlayButton>
        <SaveButton onClick={handleSave}>Save</SaveButton>
      </TrackActions>
    </TrackItemContainer>
  );
});

// Data memoization
const useMemoizedTracks = (tracks: SpotifyTrack[]) => {
  return useMemo(() => {
    return tracks.map(track => ({
      ...track,
      artistNames: track.artists.map(a => a.name).join(', '),
      albumImage: track.album.images[0]?.url,
    }));
  }, [tracks]);
};
```

### Virtual Scrolling

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedTrackList = ({ tracks }: { tracks: SpotifyTrack[] }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <TrackItem track={tracks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={tracks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 🔒 Security Implementation

### Authentication Flow

```typescript
// OAuth 2.0 with PKCE
interface AuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

class SpotifyAuth {
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  }

  private generateCodeChallenge(verifier: string): string {
    const hash = crypto.subtle.digestSync('SHA-256', new TextEncoder().encode(verifier));
    return base64URLEncode(hash);
  }

  async initiateLogin(): Promise<void> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Store code verifier in session storage
    sessionStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }

  async handleCallback(code: string): Promise<AuthTokens> {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await response.json();
    sessionStorage.removeItem('code_verifier');

    return tokens;
  }
}
```

### API Security

```typescript
// Request interceptor with authentication
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor with token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Input Validation

```typescript
import { z } from 'zod';

// Validation schemas
const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().min(2).max(5),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']),
      listeningActivity: z.enum(['public', 'private', 'friends']),
    }),
  }),
});

const SearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['track', 'artist', 'album', 'playlist']),
  limit: z.number().min(1).max(50).optional(),
});

// Validation hook
export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = useCallback(
    (data: unknown): T => {
      return schema.parse(data);
    },
    [schema]
  );

  const validateSafe = useCallback(
    (data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } => {
      const result = schema.safeParse(data);
      return result;
    },
    [schema]
  );

  return { validate, validateSafe };
};
```

## 🧪 Testing Strategy

### Testing Pyramid

```
    /\
   /  \     E2E Tests (10%)
  /____\    Integration Tests (20%)
 /______\   Unit Tests (70%)
```

### Unit Testing

```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('TrackItem', () => {
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

  it('renders track information correctly', () => {
    render(
      <TestWrapper>
        <TrackItem track={mockTrack} onPlay={jest.fn()} onSave={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    const onPlay = jest.fn();
    render(
      <TestWrapper>
        <TrackItem track={mockTrack} onPlay={onPlay} onSave={jest.fn()} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith(mockTrack.uri);
  });
});
```

### Integration Testing

```typescript
// API integration testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('https://api.spotify.com/v1/me/top/tracks', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: '1',
            name: 'Test Track',
            artists: [{ id: '1', name: 'Test Artist' }],
            album: {
              id: '1',
              name: 'Test Album',
              images: [{ url: 'test.jpg', height: 300, width: 300 }],
            },
            duration_ms: 180000,
          },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TopTracks Integration', () => {
  it('fetches and displays top tracks', async () => {
    render(
      <TestWrapper>
        <TopTracks />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Track')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

```typescript
// Playwright E2E tests
import { test, expect } from '@playwright/test';

test.describe('Spotify App E2E', () => {
  test('user can login and view top tracks', async ({ page }) => {
    // Mock Spotify OAuth
    await page.route('https://accounts.spotify.com/authorize', route => {
      route.fulfill({
        status: 200,
        body: '<html><body>Mock OAuth</body></html>',
      });
    });

    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Click login button
    await page.click('[data-testid="login-button"]');

    // Mock OAuth callback
    await page.route('https://accounts.spotify.com/api/token', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
        }),
      });
    });

    // Mock top tracks API
    await page.route('https://api.spotify.com/v1/me/top/tracks', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: '1',
              name: 'Test Track',
              artists: [{ name: 'Test Artist' }],
              album: { name: 'Test Album', images: [{ url: 'test.jpg' }] },
            },
          ],
        }),
      });
    });

    // Should redirect to callback
    await page.goto('/callback?code=mock-code');

    // Should redirect to top tracks
    await expect(page).toHaveURL('/top-tracks');

    // Should display track
    await expect(page.locator('text=Test Track')).toBeVisible();
  });
});
```

## 🚀 Deployment Architecture

### Environment Configuration

```typescript
// Environment configuration
interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  REACT_APP_SPOTIFY_CLIENT_ID: string;
  REACT_APP_SPOTIFY_REDIRECT_URI: string;
  REACT_APP_API_URL: string;
  REACT_APP_SENTRY_DSN?: string;
  REACT_APP_ALGOLIA_APP_ID?: string;
  REACT_APP_ALGOLIA_SEARCH_KEY?: string;
}

const config: Environment = {
  NODE_ENV: process.env.NODE_ENV as Environment['NODE_ENV'],
  REACT_APP_SPOTIFY_CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID!,
  REACT_APP_SPOTIFY_REDIRECT_URI: process.env.REACT_APP_SPOTIFY_REDIRECT_URI!,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL!,
  REACT_APP_SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  REACT_APP_ALGOLIA_APP_ID: process.env.REACT_APP_ALGOLIA_APP_ID,
  REACT_APP_ALGOLIA_SEARCH_KEY: process.env.REACT_APP_ALGOLIA_SEARCH_KEY,
};

export default config;
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
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
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build

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

### Docker Configuration

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Monitoring & Observability

### Error Tracking

```typescript
// Sentry configuration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: config.REACT_APP_SENTRY_DSN,
  environment: config.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(history => history.listen),
    }),
  ],
  tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// Error boundary
const ErrorBoundary = Sentry.ErrorBoundary;

// Performance monitoring
const performanceObserver = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      Sentry.metrics.increment('page.load.time', {
        value: entry.loadEventEnd - entry.loadEventStart,
        unit: 'millisecond',
      });
    }
  }
});

performanceObserver.observe({ entryTypes: ['navigation'] });
```

### Analytics

```typescript
// Custom analytics hook
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Send to custom analytics
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, properties, timestamp: Date.now() }),
    }).catch(console.error);
  }, []);

  const trackPageView = useCallback(
    (page: string) => {
      trackEvent('page_view', { page });
    },
    [trackEvent]
  );

  const trackMusicPlay = useCallback(
    (trackId: string, context?: string) => {
      trackEvent('music_play', { trackId, context });
    },
    [trackEvent]
  );

  return { trackEvent, trackPageView, trackMusicPlay };
};
```

### Health Checks

```typescript
// Health check service
class HealthCheckService {
  private static instance: HealthCheckService;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  startHealthChecks(): void {
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkSpotifyAPI();
        await this.checkDatabase();
        await this.checkCache();
      } catch (error) {
        console.error('Health check failed:', error);
        Sentry.captureException(error);
      }
    }, 60000); // Check every minute
  }

  private async checkSpotifyAPI(): Promise<void> {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });

    if (!response.ok) {
      throw new Error(`Spotify API health check failed: ${response.status}`);
    }
  }

  private async checkDatabase(): Promise<void> {
    const response = await fetch('/api/health/database');
    if (!response.ok) {
      throw new Error('Database health check failed');
    }
  }

  private async checkCache(): Promise<void> {
    const response = await fetch('/api/health/cache');
    if (!response.ok) {
      throw new Error('Cache health check failed');
    }
  }

  stopHealthChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default HealthCheckService;
```

This technical specification provides a comprehensive foundation for expanding the Spotify application with enterprise-grade features, performance optimizations, and robust architecture patterns.
