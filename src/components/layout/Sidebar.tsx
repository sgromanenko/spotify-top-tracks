import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Home, Search, Library, Music, BarChart2, Disc } from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 240px;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.space.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: 0 ${({ theme }) => theme.space.sm};
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: ${({ theme }) => theme.transitions.fast};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.elevated};
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo>
        <Music size={32} />
        Spotify
      </Logo>

      <NavSection>
        <StyledNavLink to="/">
          <Home size={20} />
          Home
        </StyledNavLink>
        <StyledNavLink to="/search">
          <Search size={20} />
          Search
        </StyledNavLink>
        <StyledNavLink to="/library">
          <Library size={20} />
          Your Library
        </StyledNavLink>
      </NavSection>

      <NavSection>
        <SectionTitle>Discover</SectionTitle>
        <StyledNavLink to="/top-tracks">
          <BarChart2 size={20} />
          Top Tracks
        </StyledNavLink>
        <StyledNavLink to="/mood-mix">
          <Disc size={20} />
          Mood Mix
        </StyledNavLink>
        <StyledNavLink to="/stats">
          <BarChart2 size={20} />
          Stats
        </StyledNavLink>
      </NavSection>
      
      <NavSection>
        <SectionTitle>Playlists</SectionTitle>
        <StyledNavLink to="/playlists">
          <Music size={20} />
          All Playlists
        </StyledNavLink>
      </NavSection>
    </SidebarContainer>
  );
};

export default Sidebar;
