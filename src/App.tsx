import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { SpotifyProvider } from './context/SpotifyContext';
import LoginPage from './features/auth/components/LoginPage';
import { ThemeProvider } from './theme/ThemeContext';

// Lazy loaded components for code splitting
const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const PlaylistsSection = lazy(() => import('./features/playlists/components/PlaylistsSection'));

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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<Navigate to="/" replace />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SpotifyProvider>
                    <MainLayout />
                  </SpotifyProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/top-tracks" replace />} />
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
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
