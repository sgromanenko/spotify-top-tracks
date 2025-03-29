import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: boolean;
  className?: string;
}

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`;

const StyledSkeleton = styled.div<{
  width: string;
  height: string;
  borderRadius: string;
  animation: boolean;
}>`
  background-color: ${({ theme }) => theme.colors.border};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: ${({ borderRadius }) => borderRadius};
  animation: ${({ animation }) => (animation ? `${pulse} 1.5s ease-in-out infinite` : 'none')};
`;

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  animation = true,
  className
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
  borderRadius: '50%'
})``;

export const SkeletonAvatar = styled(SkeletonCircle).attrs({
  width: '40px',
  height: '40px'
})``;

export const SkeletonButton = styled(Skeleton).attrs(props => ({
  height: props.height || '36px',
  borderRadius: props.borderRadius || '18px'
}))``;

export const SkeletonCard = styled(Skeleton).attrs(props => ({
  height: props.height || '120px',
  borderRadius: props.borderRadius || '8px'
}))``;

export default Skeleton;
