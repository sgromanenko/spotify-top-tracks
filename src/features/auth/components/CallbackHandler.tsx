import { useAuthStore } from '@/stores/auth';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import LoadingIndicator from '../../../components/common/LoadingIndicator';
import { getAccessTokenFromHash, storeToken } from '../../../services/auth/spotifyAuth';

/**
 * This component handles the callback from Spotify after authorization.
 * It extracts the token from the URL hash, stores it, and redirects to the app.
 */
const CallbackHandler: React.FC = () => {
  const { setToken, setUser } = useAuthStore();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    // Extract token from URL hash
    const { token, expires_in } = getAccessTokenFromHash();

    // Store token if it exists
    if (token && expires_in) {
      storeToken(token, expires_in);
      console.log('Token successfully extracted and stored');

      // Update auth state in store
      setToken(token);

      // Fetch the current user's profile from Spotify and store it
      (async () => {
        try {
          const res = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
          const profile = await res.json();

          setUser({
            id: profile.id,
            spotifyId: profile.id,
            displayName: profile.display_name || profile.id,
            email: profile.email || '',
            profileImage: profile.images?.[0]?.url,
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
              privacy: {
                profileVisibility: 'public',
                listeningActivity: 'public',
              },
            },
            statistics: {
              totalListeningTime: 0,
              totalTracksPlayed: 0,
              favoriteGenres: [],
              topArtists: [],
              listeningStreak: 0,
              averageSessionLength: 0,
            },
            createdAt: new Date(),
            lastActive: new Date(),
          });
        } catch (e) {
          console.warn('Could not load Spotify user profile:', e);
        }
      })();
    } else {
      console.error('Failed to extract token from callback URL');
    }

    // Mark as processed after a short delay
    setTimeout(() => {
      setIsProcessed(true);
    }, 500);
  }, [setToken, setUser]);

  // Only redirect after we've handled the token
  if (!isProcessed) {
    return <LoadingIndicator fullScreen message="Processing Spotify authentication..." size="lg" />;
  }

  // Redirect to home page after handling the callback
  return <Navigate to="/" replace />;
};

export default CallbackHandler;
