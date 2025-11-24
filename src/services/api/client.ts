import { getStoredToken, clearStoredToken } from '../auth/spotifyAuth';

const BASE_URL = 'https://api.spotify.com';

/**
 * Options for making API requests
 */
export interface ApiClientOptions {
  method: string;
  endpoint: string;
  body?: any;
  token?: string; // Make token optional as we'll get it from storage if not provided
}

/**
 * Standard API error format
 */
export interface ApiError {
  status: number;
  message: string;
}

/**
 * Makes a request to the Spotify API
 * @param options - Request configuration options
 * @returns Promise that resolves to the API response or error
 */
async function apiClient<T>({ method, endpoint, body, token }: ApiClientOptions): Promise<T> {
  try {
    // Use provided token or get from storage
    const authToken = token || getStoredToken();

    if (!authToken) {
      // If no token is available, redirect to login immediately
      console.warn('No authentication token available, redirecting to login...');
      window.location.href = '/login';
      throw new Error('No authentication token available');
    }

    const url = `${BASE_URL}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expired or invalid
      console.warn('Token expired or invalid (401), redirecting to login...');
      clearStoredToken();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      // Handle specific error status codes
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export default apiClient;
