import React, { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: boolean;
  interactive?: boolean;
}

const StyledCard = styled.div<{
  variant: CardVariant;
  padding: boolean;
  interactive: boolean;
}>`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.paper};
  transition: ${({ theme }) => theme.transitions.normal};

  ${({ padding, theme }) =>
    padding &&
    css`
      padding: ${theme.space.lg};

      @media (max-width: ${theme.breakpoints.md}) {
        padding: ${theme.space.md};
      }
    `}

  ${({ variant, theme }) => {
    switch (variant) {
      case 'elevated':
        return css`
          box-shadow: ${theme.shadows.md};
        `;
      case 'outlined':
        return css`
          border: 1px solid ${theme.colors.border};
        `;
      default:
        return '';
    }
  }}
  
  ${({ interactive, theme, variant }) =>
    interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);

        ${variant === 'elevated'
          ? css`
              box-shadow: ${theme.shadows.lg};
            `
          : variant === 'outlined'
            ? css`
                border-color: ${theme.colors.primary.main};
              `
            : css`
                background-color: ${theme.colors.background.elevated};
              `}
      }

      &:active {
        transform: translateY(-2px);
      }
    `}
`;

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = true,
  interactive = false,
  ...rest
}) => {
  return (
    <StyledCard variant={variant} padding={padding} interactive={interactive} {...rest}>
      {children}
    </StyledCard>
  );
};

export default Card;
