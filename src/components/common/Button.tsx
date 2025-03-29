import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * A reusable button component with various styling options
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      hasIcon={!!icon}
      iconPosition={iconPosition}
      type={type}
      {...rest}
    >
      {icon && iconPosition === 'left' && <IconWrapper>{icon}</IconWrapper>}
      {children}
      {icon && iconPosition === 'right' && <IconWrapper>{icon}</IconWrapper>}
    </StyledButton>
  );
};

// Styled components
interface StyledButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  hasIcon: boolean;
  iconPosition: 'left' | 'right';
  disabled?: boolean;
}

const sizeStyles = {
  small: css`
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  `,
  medium: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  `,
  large: css`
    padding: 1rem 2rem;
    font-size: 1rem;
  `
};

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  gap: 0.5rem;

  ${props => sizeStyles[props.size]}

  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background-color: #1db954;
          color: white;
          border: none;

          &:hover:not(:disabled),
          &:focus:not(:disabled) {
            background-color: #1ed760;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: none;
          }
        `;
      case 'secondary':
        return css`
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover:not(:disabled),
          &:focus:not(:disabled) {
            background-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: white;
          border: none;
          padding-left: 0.5rem;
          padding-right: 0.5rem;

          &:hover:not(:disabled),
          &:focus:not(:disabled) {
            color: #1db954;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Accessibility enhancements */
  &:focus {
    outline: 2px solid #1db954;
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid #1db954;
    outline-offset: 2px;
  }
`;

export default Button;
