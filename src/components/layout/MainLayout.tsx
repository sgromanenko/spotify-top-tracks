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

const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.space.xl};
  overflow-y: auto;
  height: calc(100vh - 64px - 95px); /* viewport - topbar - player */
`;

const PlayerArea = styled.div`
  height: 95px;
  flex-shrink: 0;
`;

const MainLayout: React.FC = () => {
  const { isReady } = usePlayer();
  const showPlayer = isReady;

  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <TopBar />
        <ContentArea>
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
