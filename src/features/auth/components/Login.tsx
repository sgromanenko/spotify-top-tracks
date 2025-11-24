import React from 'react';

import { getSpotifyAuth } from '../../../services/auth/spotifyAuth';
import { refreshAccessToken } from '../../../services/auth/tokenRefresh';

const Login: React.FC = () => {
  const handleLogin = async () => {
    const auth = getSpotifyAuth();
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-read-currently-playing',
      'user-read-playback-state',
    ];

    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('spotify_auth_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', auth.clientId);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('redirect_uri', auth.redirectUri);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  };

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('spotify_auth_state');

    if (!code || !state || state !== storedState) {
      console.error('Invalid state or missing code');
      window.location.href = '/login';
      return;
    }

    try {
      const auth = getSpotifyAuth();
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${auth.clientId}:${auth.clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: auth.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Set up automatic token refresh
      await refreshAccessToken();

      window.location.href = '/';
    } catch (error) {
      console.error('Error during authentication:', error);
      window.location.href = '/login';
    }
  };

  return <div>{/* Render your component content here */}</div>;
};

export default Login;
