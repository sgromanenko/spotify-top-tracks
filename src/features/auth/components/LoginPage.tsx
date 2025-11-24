import React from 'react';
import styled from 'styled-components';

import { Button } from '@/components';
import { loginWithSpotify } from '../../../services/auth/spotifyAuth';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  margin-bottom: 2.5rem;
  max-width: 600px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoginPage: React.FC = () => {
  const handleLogin = () => loginWithSpotify();

  return (
    <LoginContainer>
      <Logo>Spotify Enhanced</Logo>
      <Title>Discover Your Music</Title>
      <Subtitle>
        Connect with your Spotify account to see your top tracks, analyze their audio features, and
        explore your playlists with enhanced features.
      </Subtitle>
      <Button onClick={handleLogin} variant="primary" size="lg">
        Login with Spotify
      </Button>
    </LoginContainer>
  );
};

export default LoginPage;
