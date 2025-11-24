import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | undefined;
  errorInfo: ErrorInfo | undefined;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 400px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.error.main};
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  font-size: 1rem;
  max-width: 500px;
  line-height: 1.5;
`;

const ErrorDetails = styled.details`
  margin-bottom: 1.5rem;
  text-align: left;
  max-width: 600px;
  width: 100%;
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ErrorStack = styled.pre`
  background: ${({ theme }) => theme.colors.background.elevated};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const DefaultErrorFallback: React.FC<{
  error?: Error;
  errorInfo?: ErrorInfo;
  onRetry: () => void;
}> = ({ error, errorInfo, onRetry }) => (
  <ErrorContainer>
    <ErrorIcon>⚠️</ErrorIcon>
    <ErrorTitle>Something went wrong</ErrorTitle>
    <ErrorMessage>
      We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact
      support if the problem persists.
    </ErrorMessage>

  {import.meta.env.DEV && (error || errorInfo) && (
      <ErrorDetails>
        <ErrorSummary>Show error details (development only)</ErrorSummary>
        {error && (
          <ErrorStack>
            <strong>Error:</strong> {error.toString()}
          </ErrorStack>
        )}
        {errorInfo && (
          <ErrorStack>
            <strong>Component Stack:</strong> {errorInfo.componentStack}
          </ErrorStack>
        )}
      </ErrorDetails>
    )}

    <RetryButton onClick={onRetry}>Try Again</RetryButton>
  </ErrorContainer>
);

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined, errorInfo: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: undefined };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to error reporting service in production
  if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Production error:', error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
