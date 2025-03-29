import React from 'react';
import styled, { css } from 'styled-components';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const StyledBadge = styled.span<{
  variant: BadgeVariant;
  size: BadgeSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius.pill};

  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.125rem 0.5rem;
          font-size: ${theme.fontSizes.xs};
        `;
      case 'lg':
        return css`
          padding: 0.375rem 0.875rem;
          font-size: ${theme.fontSizes.md};
        `;
      case 'md':
      default:
        return css`
          padding: 0.25rem 0.75rem;
          font-size: ${theme.fontSizes.sm};
        `;
    }
  }}

  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary.main}22;
          color: ${theme.colors.primary.main};
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary.main}22;
          color: ${theme.colors.secondary.main};
        `;
      case 'success':
        return css`
          background-color: ${theme.colors.success.main}22;
          color: ${theme.colors.success.main};
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.error.main}22;
          color: ${theme.colors.error.main};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.accent}22;
          color: ${theme.colors.accent};
        `;
      case 'info':
        return css`
          background-color: ${theme.colors.text.secondary}22;
          color: ${theme.colors.text.secondary};
        `;
      default:
        return '';
    }
  }}
`;

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md', className }) => {
  return (
    <StyledBadge variant={variant} size={size} className={className}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
