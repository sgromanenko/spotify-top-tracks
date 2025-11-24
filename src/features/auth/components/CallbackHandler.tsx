import { useAuthStore } from '@/stores/auth';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import LoadingIndicator from '../../../components/common/LoadingIndicator';
import { exchangeToken } from '../../../services/auth/spotifyAuth';
import { useAuth } from '../../../context/AuthContext';

/**
 * This component handles the callback from Spotify after authorization.
 * It exchanges the code for tokens and redirects to the app.
 */
const CallbackHandler: React.FC = () => {
  const { refreshAuthState } = useAuth();
  const [isProcessed, setIsProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRun = React.useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('spotify_auth_state');

      if (!code || !state || state !== storedState) {
        console.error('Invalid state or missing code');
        setError('Invalid authentication state');
        setIsProcessed(true);
        return;
      }

      try {
        const success = await exchangeToken(code);
        
        if (success) {
          console.log('Token successfully exchanged');
          // Trigger auth context update
          await refreshAuthState();
        } else {
          setError('Failed to exchange token');
        }
      } catch (err) {
        console.error('Error handling callback:', err);
        setError('Authentication failed');
      } finally {
        setIsProcessed(true);
      }
    };

    handleCallback();
  }, [refreshAuthState]);

  if (error) {
    // Redirect to login on error
    return <Navigate to="/login" replace />;
  }

  // Only redirect after we've handled the token
  if (!isProcessed) {
    return <LoadingIndicator fullScreen message="Processing Spotify authentication..." size="lg" />;
  }

  // Redirect to home page after handling the callback
  return <Navigate to="/" replace />;
};

export default CallbackHandler;
