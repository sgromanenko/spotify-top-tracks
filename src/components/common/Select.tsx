import React, { SelectHTMLAttributes } from 'react';
import styled from 'styled-components';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * A reusable select dropdown component with accessibility features
 */
const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  fullWidth = false,
  id,
  ...rest
}) => {
  // Generate a unique ID if one is not provided
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <SelectContainer fullWidth={fullWidth}>
      {label && <SelectLabel htmlFor={selectId}>{label}</SelectLabel>}
      <StyledSelect id={selectId} hasError={!!error} {...rest}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectContainer>
  );
};

// Styled components
interface SelectContainerProps {
  fullWidth: boolean;
}

const SelectContainer = styled.div<SelectContainerProps>`
  display: flex;
  flex-direction: column;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  margin-bottom: 1rem;
`;

const SelectLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface StyledSelectProps {
  hasError: boolean;
}

const StyledSelect = styled.select<StyledSelectProps>`
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid
    ${({ theme, hasError }) => (hasError ? theme.colors.error.main : theme.colors.divider)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  width: 100%;
  position: relative;

  /* Custom dropdown arrow */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}30;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* For Firefox */
  @-moz-document url-prefix() {
    padding-right: 2rem;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export default Select;
