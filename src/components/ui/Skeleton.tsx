import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: boolean;
  className?: string;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledSkeleton = styled.div<{
  width: string;
  height: string;
  borderRadius: string;
  animation: boolean;
}>`
  background: ${({ theme }) => theme.colors.background.elevated};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.elevated} 25%,
    ${({ theme }) => theme.colors.background.paper} 37%,
    ${({ theme }) => theme.colors.background.elevated} 63%
  );
  background-size: 200% 100%;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: ${({ borderRadius }) => borderRadius};
  animation: ${({ animation }) => (animation ? css`${shimmer} 1.5s infinite linear` : 'none')};
`;

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  animation = true,
  className,
}) => {
  return (
    <StyledSkeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      animation={animation}
      className={className}
      aria-hidden="true"
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText = styled(Skeleton)`
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

export const SkeletonCircle = styled(Skeleton).attrs({
  borderRadius: '50%',
})``;

export const SkeletonAvatar = styled(SkeletonCircle).attrs({
  width: '40px',
  height: '40px',
})``;

export const SkeletonButton = styled(Skeleton).attrs(props => ({
  height: props.height || '36px',
  borderRadius: props.borderRadius || '18px',
}))``;

export const SkeletonCard = styled(Skeleton).attrs(props => ({
  height: props.height || '180px',
  borderRadius: props.borderRadius || '8px',
}))``;

export default Skeleton;
