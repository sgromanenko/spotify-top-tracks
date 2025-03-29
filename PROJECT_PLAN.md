# Spotify Tracks App - Project Improvement Plan

This document outlines a comprehensive plan to upgrade our Spotify Tracks application to follow industry best practices, modern architecture patterns, and performance optimizations.

## 1. Project Structure Reorganization

### 1.1. Feature-Based Architecture

```
src/
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Shared/common components
│   ├── common/           # Truly generic components (Button, Input, etc.)
│   └── layout/           # Layout components (Header, Footer, etc.)
├── features/             # Feature-based modules
│   ├── auth/             # Authentication related code
│   ├── tracks/           # Top tracks feature
│   │   ├── components/   # Components specific to tracks feature
│   │   ├── hooks/        # Custom hooks for tracks
│   │   ├── services/     # Track-specific API calls
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Public API of the feature
│   └── playlists/        # Playlists feature
├── hooks/                # Global hooks
├── services/             # API and external services
│   ├── api/              # Base API setup and instance
│   ├── spotify/          # Spotify API specific calls
│   └── analytics/        # Analytics services
├── styles/               # Global styles, theme, and styled-components setup
├── types/                # TypeScript types/interfaces
├── utils/                # Utility functions
├── App.tsx               # Main App component
└── index.tsx             # Entry point
```

### 1.2. Immediate Migration Steps

1. Create the directory structure above
2. Move existing components to their appropriate feature folders
3. Refactor API calls into proper services
4. Establish clear exports through index.ts files

## 2. Code Quality Setup

### 2.1. ESLint Configuration

Create `.eslintrc.js` with the following setup:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'jsx-a11y', 'prettier'],
  rules: {
    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // Import
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
```

### 2.2. Prettier Configuration

Create `.prettierrc.js`:

```javascript
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
};
```

### 2.3. Git Hooks with Husky

Install and configure:

```bash
npm install husky lint-staged --save-dev
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Create `.lintstagedrc`:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml}": ["prettier --write"]
}
```

## 3. Styling System Enhancements

### 3.1. Theme Configuration

Create a comprehensive theme in `src/styles/theme.ts`:

```typescript
const theme = {
  colors: {
    primary: {
      main: '#1DB954', // Spotify green
      light: '#1ED760',
      dark: '#1AA34A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#535353',
      light: '#7D7D7D',
      dark: '#282828',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#181818',
      elevated: '#282828',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#727272',
    },
    error: {
      main: '#FF5252',
      light: '#FF7676',
      dark: '#C41E3A',
    },
    success: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily:
      "'Circular Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.75,
      textTransform: 'none',
    },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '9999px',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    default: '0.3s ease',
    fast: '0.15s ease',
    slow: '0.5s ease',
  },
};

export type Theme = typeof theme;
export default theme;
```

### 3.2. Global Styles

Create `src/styles/globalStyles.ts`:

```typescript
import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 18px;
    }
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background: linear-gradient(135deg, ${({ theme }) =>
      theme.colors.background.default} 0%, #2d1f3d 100%);
    color: ${({ theme }) => theme.colors.text.primary};
    min-height: 100vh;
    overflow-x: hidden;
  }

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Scrollbar styling */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);
  }

  *::-webkit-scrollbar {
    width: 6px;
  }

  *::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  *::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export default GlobalStyles;
```

### 3.3. Styled Components Provider

Update `src/App.tsx` to use the ThemeProvider:

```typescript
import React from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles';

// ...rest of your imports

const App: React.FC = () => {
  // ...existing state and handlers

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {/* Rest of your app */}
    </ThemeProvider>
  );
};

export default App;
```

## 4. Performance Optimizations

### 4.1. Code Splitting

Implement React.lazy and Suspense:

```typescript
// src/App.tsx
import React, { Suspense, lazy } from 'react';

const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const PlaylistsSection = lazy(() => import('./features/playlists/components/PlaylistsSection'));
const AudioFeatures = lazy(() => import('./features/tracks/components/AudioFeatures'));

// Implement a loading component
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    }}
  >
    <div className="loading-spinner"></div>
  </div>
);

const App = () => {
  // ...existing code

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        {/* ...header code... */}
        <ContentArea showSidebar={showSidebar}>
          <MainContent>
            <Suspense fallback={<LoadingFallback />}>
              {activeTab === 'top-tracks' && <TopTracks onTrackSelect={handleTrackSelect} />}
              {activeTab === 'playlists' && <PlaylistsSection />}
            </Suspense>
          </MainContent>

          {showSidebar && (
            <SidebarContent>
              <Suspense fallback={<LoadingFallback />}>
                <AudioFeatures track={selectedTrack} />
              </Suspense>
            </SidebarContent>
          )}
        </ContentArea>
        {/* ...footer code... */}
      </AppContainer>
    </ThemeProvider>
  );
};
```

### 4.2. Memoization

Add memoization to prevent unnecessary renders:

- Use `React.memo()` for components that receive props but don't often change
- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed to child components

Example implementation:

```typescript
// For the TrackItem component:
const TrackItem = React.memo(({ track, index, isSelected, onClick }: TrackItemProps) => {
  // ...existing component code
});

// In the parent component:
const handleTrackClick = useCallback(
  (track: SpotifyTrack) => {
    setSelectedTrackId(track.id);
    if (onTrackSelect) {
      onTrackSelect(track);
    }
  },
  [onTrackSelect],
);
```

### 4.3. Virtualized Lists

For long lists, implement virtualization with `react-window`:

```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

// In the TopTracks component:
const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>
    <TrackItem
      key={tracks[index].id}
      track={tracks[index]}
      index={index}
      isSelected={tracks[index].id === selectedTrackId}
      onClick={() => handleTrackClick(tracks[index])}
    />
  </div>
);

// In the render method:
<List
  height={Math.min(600, window.innerHeight - 350)}
  itemCount={tracks.length}
  itemSize={80} // Adjust to your track item height
  width="100%"
>
  {renderRow}
</List>;
```

## 5. State Management

### 5.1. React Context

Create contexts for global state:

```typescript
// src/context/SpotifyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SpotifyTrack, TimeRange, getTopTracks } from '../services/spotify';

interface SpotifyContextType {
  tracks: SpotifyTrack[];
  selectedTrack: SpotifyTrack | null;
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
  trackLimit: number;
  setSelectedTrack: (track: SpotifyTrack) => void;
  setTimeRange: (range: TimeRange) => void;
  setTrackLimit: (limit: number) => void;
  refreshTracks: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const [trackLimit, setTrackLimit] = useState<number>(10);

  const refreshTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopTracks(trackLimit, timeRange);
      setTracks(data);

      // Select first track by default if none is selected
      if (data.length > 0 && !selectedTrack) {
        setSelectedTrack(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch your top tracks. The token might have expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [trackLimit, timeRange, selectedTrack]);

  useEffect(() => {
    refreshTracks();
  }, [trackLimit, timeRange, refreshTracks]);

  const value = {
    tracks,
    selectedTrack,
    loading,
    error,
    timeRange,
    trackLimit,
    setSelectedTrack,
    setTimeRange,
    setTrackLimit,
    refreshTracks,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};
```

### 5.2. API Service Layer

Create a proper API service layer:

```typescript
// src/services/api/client.ts
const BASE_URL = 'https://api.spotify.com';

interface ApiClientOptions {
  method: string;
  endpoint: string;
  body?: any;
  token: string;
}

async function apiClient<T>({ method, endpoint, body, token }: ApiClientOptions): Promise<T> {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 401) {
        // Token expired - could trigger a refresh token flow here
        throw new Error('Your session has expired. Please log in again.');
      }

      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export default apiClient;
```

## 6. Testing Strategy

### 6.1. Setup Jest and React Testing Library

Install dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-styled-components @types/jest ts-jest
```

Configure Jest in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

Create `src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';
import 'jest-styled-components';
```

### 6.2. Component Test Examples

Create test files alongside components:

```typescript
// src/features/tracks/components/__tests__/TrackItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../../styles/theme';
import TrackItem from '../TrackItem';

// Mock data
const mockTrack = {
  id: '1',
  name: 'Test Track',
  artists: [{ id: '1', name: 'Test Artist' }],
  album: {
    name: 'Test Album',
    images: [{ url: 'test-image.jpg', height: 300, width: 300 }],
  },
  preview_url: 'https://example.com/preview.mp3',
};

// Mock audio
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
};

window.Audio = jest.fn().mockImplementation(() => mockAudio);

describe('TrackItem', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <TrackItem track={mockTrack} index={0} {...props} />
      </ThemeProvider>,
    );
  };

  test('renders track information correctly', () => {
    renderComponent();

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByAltText('Test Album')).toHaveAttribute('src', 'test-image.jpg');
  });

  test('calls onClick when track is clicked', () => {
    const onClick = jest.fn();
    renderComponent({ onClick });

    fireEvent.click(screen.getByText('Test Track').closest('div')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('plays audio when play button is clicked', () => {
    renderComponent();

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    expect(window.Audio).toHaveBeenCalledWith(mockTrack.preview_url);
    expect(mockAudio.play).toHaveBeenCalled();
  });
});
```

## 7. Accessibility Improvements

### 7.1. Key Focus Areas:

1. Proper semantic HTML
2. ARIA attributes
3. Keyboard navigation
4. Color contrast
5. Screen reader support

### 7.2. Implementation Examples

Updating the TrackItem component for accessibility:

```typescript
// src/features/tracks/components/TrackItem.tsx
const TrackItem: React.FC<TrackItemProps> = ({ track, index, isSelected = false, onClick }) => {
  // ...existing state variables

  // Add keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <TrackContainer
      isSelected={isSelected}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${track.name} by ${artistNames}`}
    >
      <TrackNumber aria-hidden="true">{index + 1}</TrackNumber>
      <TrackImage src={albumImage} alt={`Album cover for ${track.album.name}`} />
      <TrackInfo>
        <TrackName title={track.name}>{track.name}</TrackName>
        <ArtistName title={artistNames}>{artistNames}</ArtistName>
        <AlbumName title={track.album.name}>{track.album.name}</AlbumName>
      </TrackInfo>
      <AudioControl>
        <PlayButton
          onClick={togglePlay}
          disabled={!track.preview_url}
          aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          type="button"
        >
          {isPlaying ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        </PlayButton>
        <AudioStatus isPlaying={isPlaying} aria-hidden="true" />
      </AudioControl>
      {!track.preview_url && <span className="sr-only">No audio preview available</span>}
      <PreviewUnavailable hasPreview={hasPreview} aria-hidden="true">
        No preview
      </PreviewUnavailable>
    </TrackContainer>
  );
};
```

Add accessibility helper styles:

```typescript
// Add to globalStyles.ts
const GlobalStyles = createGlobalStyle`
  // ... existing styles
  
  /* Accessibility helpers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
  
  :focus:not(:focus-visible) {
    outline: none;
  }
  
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;
```

## 8. Deployment Pipeline

### 8.1. GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: build

    # Add your deployment step here based on your hosting platform
    # For example, deploying to Netlify, Vercel, or GitHub Pages
```

### 8.2. NPM Scripts

Update `package.json` with optimized scripts:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "eject": "react-scripts eject",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "prepare": "husky install"
}
```

## 9. Documentation

### 9.1. Add JSDoc to all components and functions

Example:

```typescript
/**
 * Fetches the user's top tracks from Spotify API
 * @param limit - Maximum number of tracks to return (1-50)
 * @param timeRange - Time range for popularity calculation
 * @returns Promise that resolves to array of track objects
 */
export async function getTopTracks(
  limit: number = 10,
  timeRange: TimeRange = 'long_term',
): Promise<SpotifyTrack[]> {
  // Implementation
}
```

### 9.2. Add Storybook

Set up Storybook for component documentation:

```bash
npx storybook init
```

Create stories for components:

```typescript
// src/components/TrackItem.stories.tsx
import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import TrackItem, { TrackItemProps } from './TrackItem';

export default {
  title: 'Components/TrackItem',
  component: TrackItem,
  decorators: [
    Story => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: Story<TrackItemProps> = args => <TrackItem {...args} />;

export const Default = Template.bind({});
Default.args = {
  track: {
    id: '1',
    name: 'Bohemian Rhapsody',
    artists: [{ id: '1', name: 'Queen' }],
    album: {
      name: 'A Night at the Opera',
      images: [{ url: 'https://via.placeholder.com/300', height: 300, width: 300 }],
    },
    preview_url: 'https://example.com/preview.mp3',
  },
  index: 0,
  isSelected: false,
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  isSelected: true,
};

export const NoPreview = Template.bind({});
NoPreview.args = {
  ...Default.args,
  track: {
    ...Default.args.track,
    preview_url: null,
  },
};
```

## 10. Implementation Timeline

### Phase 1: Infrastructure Setup (1-2 days)

- Directory structure
- ESLint, Prettier, Husky
- Theme and global styles
- Unit testing setup

### Phase 2: Core Architecture (2-3 days)

- API service layer
- Context implementation
- Component refactoring

### Phase 3: Optimizations (2-3 days)

- Code splitting
- Memoization
- Performance improvements

### Phase 4: Testing & Documentation (2-3 days)

- Test coverage
- Storybook setup
- JSDoc documentation

### Phase 5: CI/CD & Deployment (1 day)

- GitHub Actions workflow
- Build optimization
- Deployment configuration
