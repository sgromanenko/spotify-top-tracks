import React, { forwardRef, SelectHTMLAttributes } from 'react';
import styled from 'styled-components';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
}

const SelectContainer = styled.div<{ fullWidth: boolean }>`
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

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    right: 1rem;
    width: 0.8rem;
    height: 0.5rem;
    background-color: ${({ theme }) => theme.colors.text.secondary};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    pointer-events: none;
  }
`;

const StyledSelect = styled.select<{ hasError: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 1px solid
    ${({ theme, hasError }) => (hasError ? theme.colors.error.main : theme.colors.divider)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: ${({ theme }) => theme.transitions.fast};
  appearance: none;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error.main : theme.colors.primary.main};
    box-shadow: 0 0 0 2px
      ${({ theme, hasError }) =>
        hasError ? `${theme.colors.error.main}30` : `${theme.colors.primary.main}30`};
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

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth = false, options, ...rest }, ref) => {
    return (
      <SelectContainer fullWidth={fullWidth}>
        {label && <Label htmlFor={rest.id}>{label}</Label>}
        <SelectWrapper>
          <StyledSelect
            ref={ref}
            hasError={!!error}
            aria-invalid={!!error}
            aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
            {...rest}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
        </SelectWrapper>
        {error && (
          <ErrorMessage id={rest.id ? `${rest.id}-error` : undefined}>{error}</ErrorMessage>
        )}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';

export default Select;
