import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import LoadingIndicator from './LoadingIndicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, refreshAuthState } = useAuth();
  const location = useLocation();

  // Check auth state whenever the route is accessed
  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  if (loading) {
    return <LoadingIndicator fullScreen message="Verifying your authentication..." size="md" />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
