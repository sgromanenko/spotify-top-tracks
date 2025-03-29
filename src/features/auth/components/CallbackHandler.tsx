import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import LoadingIndicator from '../../../components/common/LoadingIndicator';
import { useAuth } from '../../../context/AuthContext';
import { getAccessTokenFromHash, storeToken } from '../../../services/auth/spotifyAuth';

/**
 * This component handles the callback from Spotify after authorization.
 * It extracts the token from the URL hash, stores it, and redirects to the app.
 */
const CallbackHandler: React.FC = () => {
  const { refreshAuthState } = useAuth();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    // Extract token from URL hash
    const { token, expires_in } = getAccessTokenFromHash();

    // Store token if it exists
    if (token && expires_in) {
      storeToken(token, expires_in);
      console.log('Token successfully extracted and stored');

      // Update auth state in context
      refreshAuthState();
    } else {
      console.error('Failed to extract token from callback URL');
    }

    // Mark as processed after a short delay
    setTimeout(() => {
      setIsProcessed(true);
    }, 500);
  }, [refreshAuthState]);

  // Only redirect after we've handled the token
  if (!isProcessed) {
    return <LoadingIndicator fullScreen message="Processing Spotify authentication..." size="lg" />;
  }

  // Redirect to home page after handling the callback
  return <Navigate to="/" replace />;
};

export default CallbackHandler;
