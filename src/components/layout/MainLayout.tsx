import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { usePlayer } from '../../context/PlayerContext';
import SpotifyPlayer from '../player/SpotifyPlayer';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.gradients.dark};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 240px; /* Match sidebar width */
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.space.xl};
  padding-bottom: 100px; /* Space for player */
`;

const MainLayout: React.FC = () => {
  const { isReady } = usePlayer();
  // Always show player if it's ready (initialized), even if no track is playing yet
  // The SpotifyPlayer component handles the "empty" state
  const showPlayer = isReady;

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <TopBar />
        <ContentArea>
          <Outlet />
        </ContentArea>
        {showPlayer && <SpotifyPlayer />}
      </MainContent>
    </AppContainer>
  );
};

export default MainLayout;
