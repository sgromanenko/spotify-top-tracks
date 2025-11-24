import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { usePlayer } from '../../context/PlayerContext';
import SpotifyPlayer from '../player/SpotifyPlayer';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.dark};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 240px; /* Match sidebar width */
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.main<{ hasPlayer: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.space.xl};
  overflow-y: auto;
  height: ${({ hasPlayer }) => (hasPlayer ? 'calc(100vh - 64px - 95px)' : 'calc(100vh - 64px)')};
`;

const PlayerArea = styled.div`
  height: 95px;
  flex-shrink: 0;
`;

const MainLayout: React.FC = () => {
  const { isReady, playerState } = usePlayer();
  // Show player only if ready AND has a current track
  const showPlayer = isReady && !!playerState?.track_window?.current_track;

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <TopBar />
        <ContentArea hasPlayer={showPlayer}>
          <Outlet />
        </ContentArea>
        {showPlayer && (
          <PlayerArea>
            <SpotifyPlayer />
          </PlayerArea>
        )}
      </MainContent>
    </AppContainer>
  );
};

export default MainLayout;
