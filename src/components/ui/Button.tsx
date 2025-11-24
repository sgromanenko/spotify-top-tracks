import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ButtonContainer = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: ${({ theme }) => theme.transitions.normal};
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: ${theme.space.xs} ${theme.space.sm};
          font-size: ${theme.fontSizes.xs};
        `;
      case 'lg':
        return css`
          padding: ${theme.space.md} ${theme.space.lg};
          font-size: ${theme.fontSizes.md};
        `;
      case 'md':
      default:
        return css`
          padding: ${theme.space.sm} ${theme.space.md};
          font-size: ${theme.fontSizes.sm};
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

const IconWrapper = styled.span<{ isLeftIcon: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ isLeftIcon }) => (isLeftIcon ? 'margin-right: 0.5rem;' : 'margin-left: 0.5rem;')}
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...restProps
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      {...restProps}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <IconWrapper isLeftIcon>{leftIcon}</IconWrapper>}
      {children}
      {!isLoading && rightIcon && <IconWrapper isLeftIcon={false}>{rightIcon}</IconWrapper>}
    </ButtonContainer>
  );
};

export default Button;
