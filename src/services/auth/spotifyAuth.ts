const CLIENT_ID = import.meta.env.REACT_APP_SPOTIFY_CLIENT_ID as string | undefined;
const REDIRECT_URI =
  (import.meta.env.REACT_APP_REDIRECT_URI as string | undefined) ||
  (typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'http://localhost:3000/callback');

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  EXPIRES_AT: 'spotify_token_expires_at',
  AUTH_STATE: 'spotify_auth_state',
  CODE_VERIFIER: 'spotify_code_verifier',
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
  'user-follow-read',
  'streaming',
  'app-remote-control',
].join(' ');

/**
 * Generates a random string for the code verifier
 */
const generateCodeVerifier = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Generates the code challenge from the verifier
 */
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Redirects the user to Spotify login page using PKCE Flow
 */
export const loginWithSpotify = async (): Promise<void> => {
  if (!CLIENT_ID) {
    console.error('REACT_APP_SPOTIFY_CLIENT_ID is not set');
    return;
  }

  // Generate and store code verifier
  const codeVerifier = generateCodeVerifier(128);
  localStorage.setItem(KEYS.CODE_VERIFIER, codeVerifier);

  // Generate code challenge
  const codeChallenge = await generateCodeChallenge(codeVerifier);

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
  url.searchParams.append('code_challenge_method', 'S256');
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('show_dialog', 'true');

  window.location.href = url.toString();
};

/**
 * Exchanges authorization code for access and refresh tokens using PKCE
 */
interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface AuthError {
  error: string;
  error_description: string;
}

/**
 * Exchanges authorization code for access and refresh tokens using PKCE
 */
export const exchangeToken = async (code: string): Promise<boolean> => {
  if (!CLIENT_ID) {
    console.error('Missing client ID');
    return false;
  }

  const codeVerifier = localStorage.getItem(KEYS.CODE_VERIFIER);
  if (!codeVerifier) {
    console.error('Missing code verifier');
    return false;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as AuthError;
      console.error('Token exchange failed:', errorData);
      throw new Error(errorData.error_description || 'Failed to exchange code for token');
    }

    const data = await response.json() as TokenResponse;
    // We might not get a refresh token if the scope hasn't changed, but for auth code flow we usually do
    storeTokens(data.access_token, data.refresh_token || '', data.expires_in);
    
    // Clean up verifier
    localStorage.removeItem(KEYS.CODE_VERIFIER);
    
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
  if (!refreshToken || !CLIENT_ID) {
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as AuthError;
      console.error('Token refresh failed:', errorData);
      throw new Error(errorData.error_description || 'Failed to refresh token');
    }

    const data = await response.json() as TokenResponse;
    
    // Update access token and expiration
    // Refresh token might not be returned if it hasn't changed
    const newRefreshToken = data.refresh_token || refreshToken;
    storeTokens(data.access_token, newRefreshToken, data.expires_in);
    
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Only clear tokens if it's a fatal error (like invalid_grant), not network error
    // For now, we'll keep the existing behavior but it's worth noting
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
  localStorage.removeItem(KEYS.CODE_VERIFIER);
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
  clientSecret: '', // Not used in PKCE
  redirectUri: REDIRECT_URI,
});
