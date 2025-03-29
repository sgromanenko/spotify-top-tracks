import React from 'react';
import styled from 'styled-components';

interface GridProps {
  children: React.ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  className?: string;
}

interface GridItemProps {
  children: React.ReactNode;
  span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
}

const StyledGrid = styled.div<{
  columns: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap: string;
}>`
  display: grid;
  width: 100%;
  gap: ${({ gap }) => gap};

  ${({ columns, theme }) => {
    if (typeof columns === 'number') {
      return `
        grid-template-columns: repeat(${columns}, 1fr);
      `;
    }

    return `
      grid-template-columns: repeat(1, 1fr);
      
      ${
        columns.sm
          ? `@media (min-width: ${theme.breakpoints.sm}) {
            grid-template-columns: repeat(${columns.sm}, 1fr);
          }`
          : ''
      }
        
      ${
        columns.md
          ? `@media (min-width: ${theme.breakpoints.md}) {
            grid-template-columns: repeat(${columns.md}, 1fr);
          }`
          : ''
      }
        
      ${
        columns.lg
          ? `@media (min-width: ${theme.breakpoints.lg}) {
            grid-template-columns: repeat(${columns.lg}, 1fr);
          }`
          : ''
      }
        
      ${
        columns.xl
          ? `@media (min-width: ${theme.breakpoints.xl}) {
            grid-template-columns: repeat(${columns.xl}, 1fr);
          }`
          : ''
      }
    `;
  }}
`;

const StyledGridItem = styled.div<{
  span: number | { sm?: number; md?: number; lg?: number; xl?: number };
}>`
  ${({ span, theme }) => {
    if (typeof span === 'number') {
      return `
        grid-column: span ${span};
      `;
    }

    return `
      grid-column: span 1;
      
      ${
        span.sm
          ? `@media (min-width: ${theme.breakpoints.sm}) {
            grid-column: span ${span.sm};
          }`
          : ''
      }
        
      ${
        span.md
          ? `@media (min-width: ${theme.breakpoints.md}) {
            grid-column: span ${span.md};
          }`
          : ''
      }
        
      ${
        span.lg
          ? `@media (min-width: ${theme.breakpoints.lg}) {
            grid-column: span ${span.lg};
          }`
          : ''
      }
        
      ${
        span.xl
          ? `@media (min-width: ${theme.breakpoints.xl}) {
            grid-column: span ${span.xl};
          }`
          : ''
      }
    `;
  }}
`;

export const Grid: React.FC<GridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = '1rem',
  className,
}) => {
  return (
    <StyledGrid columns={columns} gap={gap} className={className}>
      {children}
    </StyledGrid>
  );
};

export const GridItem: React.FC<GridItemProps> = ({ children, span = 1, className }) => {
  return (
    <StyledGridItem span={span} className={className}>
      {children}
    </StyledGridItem>
  );
};

export default { Grid, GridItem };
