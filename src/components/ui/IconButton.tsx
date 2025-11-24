import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  label: string; // Accessible label (for screen readers)
}

const Button = styled.button<{
  variant: IconButtonVariant;
  size: IconButtonSize;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: ${({ theme }) => theme.transitions.normal};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          width: 2rem;
          height: 2rem;
          font-size: ${theme.fontSizes.sm};
        `;
      case 'lg':
        return css`
          width: 3.5rem;
          height: 3.5rem;
          font-size: ${theme.fontSizes.lg};
        `;
      case 'md':
      default:
        return css`
          width: 2.5rem;
          height: 2.5rem;
          font-size: ${theme.fontSizes.md};
        `;
    }
  }}

  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary.main};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary.main}dd;
            box-shadow: ${theme.shadows.sm};
          }
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary.main}ee;
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary.main};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.main}dd;
            box-shadow: ${theme.shadows.sm};
          }
          &:active:not(:disabled) {
            background-color: ${theme.colors.secondary.main}ee;
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.error.main};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${theme.colors.error.main}dd;
            box-shadow: ${theme.shadows.sm};
          }
          &:active:not(:disabled) {
            background-color: ${theme.colors.error.main}ee;
          }
        `;
      case 'ghost':
      default:
        return css`
          background-color: transparent;
          color: ${theme.colors.text.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.text.primary}11;
          }
          &:active:not(:disabled) {
            background-color: ${theme.colors.text.primary}22;
          }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled,
  label,
  ...restProps
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      aria-label={label}
      {...restProps}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </Button>
  );
};

export default IconButton;
