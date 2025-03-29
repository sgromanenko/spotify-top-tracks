import React, { lazy, Suspense, useState } from 'react';
import styled from 'styled-components';

import Button from './components/common/Button';
import { SpotifyProvider } from './context/SpotifyContext';
import { SpotifyTrack } from './services/spotify';
import { ThemeProvider } from './theme/ThemeContext';

// Lazy loaded components for code splitting
const TopTracks = lazy(() => import('./features/tracks/components/TopTracks'));
const PlaylistsSection = lazy(() => import('./features/playlists/components/PlaylistsSection'));
const AudioFeatures = lazy(() => import('./features/tracks/components/AudioFeatures'));

const LoadingFallback = () => (
  <LoadingContainer>
    <LoadingSpinner />
  </LoadingContainer>
);

const AppContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem;
    max-width: 90%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    max-width: 1400px;
    grid-template-columns: 1fr;
    padding: 2rem;
  }
`;

const Header = styled.header`
  width: 100%;
`;

interface ContentAreaProps {
  showSidebar: boolean;
}

const ContentArea = styled.main<ContentAreaProps>`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: ${props => (props.showSidebar ? '2fr 1fr' : '1fr')};
  }
`;

const MainContent = styled.div`
  width: 100%;
`;

const SidebarContent = styled.div`
  width: 100%;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 1.5rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
  width: 100%;
`;

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

type TabType = 'top-tracks' | 'playlists';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('top-tracks');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
  };

  // Check if we should show the sidebar layout (when a track is selected)
  const showSidebar = activeTab === 'top-tracks' && selectedTrack !== null;

  return (
    <ThemeProvider>
      <SpotifyProvider>
        <AppContainer>
          <Header>
            <TabsContainer>
              <Button
                variant={activeTab === 'top-tracks' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('top-tracks')}
              >
                Top Tracks
              </Button>
              <Button
                variant={activeTab === 'playlists' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('playlists')}
              >
                Playlists
              </Button>
            </TabsContainer>
          </Header>

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

          <Footer>
            Powered by Spotify Web API. Track previews are 30-second samples provided by Spotify.
          </Footer>
        </AppContainer>
      </SpotifyProvider>
    </ThemeProvider>
  );
}

export default App;
