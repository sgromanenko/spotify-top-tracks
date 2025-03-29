import React from 'react';
import styled from 'styled-components';

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface SpacerProps {
  size?: SpacerSize;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

const StyledSpacer = styled.div<{
  size: SpacerSize;
  direction: 'horizontal' | 'vertical';
}>`
  ${({ size, direction, theme }) => {
    const space = theme.space[size];

    if (direction === 'horizontal') {
      return `
        display: inline-block;
        width: ${space};
        height: 1px;
      `;
    }

    return `
      display: block;
      width: 100%;
      height: ${space};
    `;
  }}
`;

const Spacer: React.FC<SpacerProps> = ({ size = 'md', direction = 'vertical', className }) => {
  return (
    <StyledSpacer size={size} direction={direction} className={className} aria-hidden="true" />
  );
};

export default Spacer;
