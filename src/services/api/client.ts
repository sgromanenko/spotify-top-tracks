import { getStoredToken } from '../auth/spotifyAuth';

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

    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 401) {
        // Token expired - could trigger a refresh token flow here
        throw new Error('Your session has expired. Please log in again.');
      }

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
