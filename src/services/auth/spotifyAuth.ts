const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Scopes determine what user data our app can access
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-playback-state',
  'user-modify-playback-state',
  'streaming',
  'app-remote-control',
].join('%20');

/**
 * Redirects the user to Spotify login page
 */
export const loginWithSpotify = (): void => {
  window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
};

/**
 * Extracts access token from URL hash after redirect
 */
export const getAccessTokenFromHash = (): { token: string | null; expires_in: number | null } => {
  if (!window.location.hash) {
    return { token: null, expires_in: null };
  }

  const hashParams = window.location.hash
    .substring(1)
    .split('&')
    .reduce(
      (acc, item) => {
        const [key, value] = item.split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

  return {
    token: hashParams.access_token || null,
    expires_in: hashParams.expires_in ? parseInt(hashParams.expires_in, 10) : null,
  };
};

/**
 * Stores token in localStorage with expiration time
 */
export const storeToken = (token: string, expiresIn: number): void => {
  const now = new Date();
  const expiresAt = now.getTime() + expiresIn * 1000;

  localStorage.setItem('spotify_access_token', token);
  localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
};

/**
 * Gets token from localStorage
 */
export const getStoredToken = (): string | null => {
  const token = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');

  if (!token || !expiresAt) {
    return null;
  }

  const now = new Date();
  if (now.getTime() > parseInt(expiresAt, 10)) {
    // Token expired, clear it
    clearStoredToken();
    return null;
  }

  return token;
};

/**
 * Clears token from localStorage
 */
export const clearStoredToken = (): void => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expires_at');
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getStoredToken() !== null;
};

/**
 * Logs out the user
 */
export const logout = (): void => {
  clearStoredToken();
  window.location.href = '/';
};
