import React from 'react';

import { getSpotifyAuth, exchangeToken } from '../../../services/auth/spotifyAuth';

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
      const success = await exchangeToken(code);
      
      if (success) {
        window.location.href = '/';
      } else {
        throw new Error('Token exchange failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      window.location.href = '/login';
    }
  };

  return <div>{/* Render your component content here */}</div>;
};

export default Login;
