import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const TopBarContainer = styled.header`
  height: 64px;
  background-color: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 ${({ theme }) => theme.space.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 90;
`;

const NavigationControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const NavButton = styled.button`
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    background-color: rgba(0, 0, 0, 0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
`;

const UserPill = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px;
  padding-right: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TopBar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <TopBarContainer>
      <NavigationControls>
        <NavButton onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </NavButton>
        <NavButton onClick={() => navigate(1)}>
          <ChevronRight size={20} />
        </NavButton>
      </NavigationControls>

      <UserSection>
        <UserPill>
          <Avatar>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <User size={16} />
            )}
          </Avatar>
          <UserName>{user?.displayName || 'User'}</UserName>
        </UserPill>
        <Button onClick={logout} variant="secondary" size="small">
          Logout
        </Button>
      </UserSection>
    </TopBarContainer>
  );
};

export default TopBar;
