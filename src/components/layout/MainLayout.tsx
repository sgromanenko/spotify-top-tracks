import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const AppTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.h4.fontSize};
  margin: 0;
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.paper};
    text-decoration: none;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.paper};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MainLayout: React.FC = () => {
  const { logout } = useAuth();

  return (
    <AppContainer>
      <Header>
        <AppTitle>Spotify Tracks</AppTitle>
        <NavContainer>
          <StyledNavLink to="/top-tracks">Top Tracks</StyledNavLink>
          <StyledNavLink to="/playlists">Playlists</StyledNavLink>
        </NavContainer>
        <UserSection>
          <Button onClick={logout} variant="ghost" size="sm">
            Logout
          </Button>
        </UserSection>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </AppContainer>
  );
};

export default MainLayout;
