import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  ${({ position }) => (position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledInput = styled.input<{
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  hasError: boolean;
}>`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 1px solid
    ${({ theme, hasError }) => (hasError ? theme.colors.error.main : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: ${({ theme }) => theme.transitions.fast};

  ${({ hasLeftIcon }) =>
    hasLeftIcon &&
    css`
      padding-left: 2.5rem;
    `}

  ${({ hasRightIcon }) =>
    hasRightIcon &&
    css`
      padding-right: 2.5rem;
    `}
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error.main : theme.colors.primary.main};
    box-shadow: 0 0 0 2px
      ${({ theme, hasError }) =>
        hasError ? `${theme.colors.error.main}33` : `${theme.colors.primary.main}33`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  &:disabled {
    background-color: ${({ theme }) => `${theme.colors.border}33`};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.space.xs};
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, fullWidth = false, ...rest }, ref) => {
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <Label htmlFor={rest.id}>{label}</Label>}
        <InputWrapper>
          {leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
          <StyledInput
            ref={ref}
            hasLeftIcon={!!leftIcon}
            hasRightIcon={!!rightIcon}
            hasError={!!error}
            aria-invalid={!!error}
            aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
            {...rest}
          />
          {rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
        </InputWrapper>
        {error && (
          <ErrorMessage id={rest.id ? `${rest.id}-error` : undefined}>{error}</ErrorMessage>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
