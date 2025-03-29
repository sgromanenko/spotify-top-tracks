import React from 'react';
import styled from 'styled-components';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const Container = styled.div<{ fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: ${({ fullScreen }) => (fullScreen ? '100vh' : '200px')};
  width: 100%;
`;

const Spinner = styled.div<{ size: string }>`
  width: ${({ size }) => (size === 'sm' ? '24px' : size === 'md' ? '40px' : '60px')};
  height: ${({ size }) => (size === 'sm' ? '24px' : size === 'md' ? '40px' : '60px')};
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

const Message = styled.div`
  margin-top: 16px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  message,
  fullScreen = false,
}) => {
  return (
    <Container fullScreen={fullScreen}>
      <Spinner size={size} />
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default LoadingIndicator;
