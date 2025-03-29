import React from 'react';
import styled from 'styled-components';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
}

const StyledContainer = styled.div<{ size: ContainerSize }>`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.space.md};
  padding-right: ${({ theme }) => theme.space.md};

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `max-width: 640px;`;
      case 'md':
        return `max-width: 768px;`;
      case 'lg':
        return `max-width: 1024px;`;
      case 'xl':
        return `max-width: 1280px;`;
      case 'full':
        return `max-width: 100%;`;
      default:
        return '';
    }
  }}

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-left: ${({ theme }) => theme.space.lg};
    padding-right: ${({ theme }) => theme.space.lg};
  }
`;

const Container: React.FC<ContainerProps> = ({ children, size = 'lg', className }) => {
  return (
    <StyledContainer size={size} className={className}>
      {children}
    </StyledContainer>
  );
};

export default Container;
