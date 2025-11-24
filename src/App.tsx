import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import CallbackHandler from './features/auth/components/CallbackHandler';
import LoginPage from './features/auth/components/LoginPage';
import PlaceholderPage from './components/common/PlaceholderPage';
import Home from './features/home/components/Home';
import Search from './features/search/components/Search';
import Library from './features/library/components/Library';
import MoodMix from './features/mood-mix/components/MoodMix';
import Stats from './features/stats/components/Stats';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './theme/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import { SpotifyProvider } from './context/SpotifyContext';

// Lazy loaded components for code splitting
const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const PlaylistsSection = lazy(() => import('./features/playlists/components/PlaylistsSection'));
const ArtistPage = lazy(() => import('./features/artist/components/ArtistPage'));
const AlbumPage = lazy(() => import('./features/album/components/AlbumPage'));
const PlaylistPage = lazy(() => import('./features/playlists/components/PlaylistPage'));

const LoadingFallback = () => (
  <LoadingContainer>
    <LoadingSpinner />
  </LoadingContainer>
);

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<CallbackHandler />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PlayerProvider>
                    <SpotifyProvider>
                      <MainLayout />
                    </SpotifyProvider>
                  </PlayerProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route
                path="top-tracks"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TopTracks />
                  </Suspense>
                }
              />
              <Route
                path="playlists"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PlaylistsSection />
                  </Suspense>
                }
              />
              <Route path="search" element={<Search />} />
              <Route path="library" element={<Library />} />
              <Route path="mood-mix" element={<MoodMix />} />
              <Route path="stats" element={<Stats />} />
              
              {/* New Detail Pages */}
              <Route
                path="artist/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ArtistPage />
                  </Suspense>
                }
              />
              <Route
                path="album/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AlbumPage />
                  </Suspense>
                }
              />
              <Route
                path="playlist/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PlaylistPage />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
