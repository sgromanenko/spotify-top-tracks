const CLIENT_ID = import.meta.env.REACT_APP_SPOTIFY_CLIENT_ID as string | undefined;
const CLIENT_SECRET = import.meta.env.REACT_APP_SPOTIFY_CLIENT_SECRET as string | undefined;
const REDIRECT_URI =
  (import.meta.env.REACT_APP_REDIRECT_URI as string | undefined) ||
  (typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'http://localhost:3000/callback');

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  EXPIRES_AT: 'spotify_token_expires_at',
  AUTH_STATE: 'spotify_auth_state',
};

// Scopes determine what user data our app can access
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played',
  'streaming',
  'app-remote-control',
].join(' '); // Spotify API expects space-separated scopes for code flow

/**
 * Redirects the user to Spotify login page using Authorization Code Flow
 */
export const loginWithSpotify = (): void => {
  if (!CLIENT_ID) {
    console.error('REACT_APP_SPOTIFY_CLIENT_ID is not set');
    return;
  }

  // Generate random state for security
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem(KEYS.AUTH_STATE, state);

  // Build auth URL
  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('scope', SCOPES);
  url.searchParams.append('state', state);
  url.searchParams.append('show_dialog', 'true');

  window.location.href = url.toString();
};

/**
 * Exchanges authorization code for access and refresh tokens
 */
export const exchangeToken = async (code: string): Promise<boolean> => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing client credentials');
    return false;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    storeTokens(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch (error) {
    console.error('Token exchange error:', error);
    return false;
  }
};

/**
 * Refreshes the access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(KEYS.REFRESH_TOKEN);
  if (!refreshToken || !CLIENT_ID || !CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    // Update access token and expiration
    // Note: refresh token might not be returned if it hasn't rotated
    const newRefreshToken = data.refresh_token || refreshToken;
    storeTokens(data.access_token, newRefreshToken, data.expires_in);
    
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    // If refresh fails, clear everything to force re-login
    clearStoredToken();
    return null;
  }
};

/**
 * Stores tokens in localStorage
 */
export const storeTokens = (accessToken: string, refreshToken: string, expiresIn: number): void => {
  const now = new Date();
  const expiresAt = now.getTime() + expiresIn * 1000;

  localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(KEYS.EXPIRES_AT, expiresAt.toString());
};

/**
 * Gets valid access token, refreshing if necessary
 */
export const getStoredToken = async (): Promise<string | null> => {
  const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
  const expiresAt = localStorage.getItem(KEYS.EXPIRES_AT);

  if (!token || !expiresAt) {
    return null;
  }

  const now = new Date();
  // Refresh if expired or about to expire (within 5 minutes)
  if (now.getTime() > parseInt(expiresAt, 10) - 300000) {
    return await refreshAccessToken();
  }

  return token;
};

/**
 * Clears all auth data
 */
export const clearStoredToken = (): void => {
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.EXPIRES_AT);
  localStorage.removeItem(KEYS.AUTH_STATE);
};

/**
 * Checks if user is authenticated (has valid token or refresh token)
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(KEYS.ACCESS_TOKEN);
};

/**
 * Logs out the user
 */
export const logout = (): void => {
  clearStoredToken();
  window.location.href = '/login';
};

export const getSpotifyAuth = () => ({
  clientId: CLIENT_ID || '',
  clientSecret: CLIENT_SECRET || '',
  redirectUri: REDIRECT_URI,
});
