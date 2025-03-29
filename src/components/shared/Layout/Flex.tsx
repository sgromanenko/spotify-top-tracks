import React from 'react';
import styled from 'styled-components';

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  className?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const StyledFlex = styled.div<{
  direction: string;
  align: string;
  justify: string;
  wrap: string;
  gap: string;
  fullWidth: boolean;
  fullHeight: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  align-items: ${({ align }) => align};
  justify-content: ${({ justify }) => justify};
  flex-wrap: ${({ wrap }) => wrap};
  gap: ${({ gap }) => gap};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
`;

const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'flex-start',
  wrap = 'nowrap',
  gap = '0',
  className,
  fullWidth = false,
  fullHeight = false,
}) => {
  return (
    <StyledFlex
      direction={direction}
      align={align}
      justify={justify}
      wrap={wrap}
      gap={gap}
      className={className}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
    >
      {children}
    </StyledFlex>
  );
};

export default Flex;
