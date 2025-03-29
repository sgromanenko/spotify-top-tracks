import apiClient from '../api/client';

/**
 * Interface for Spotify artist data
 */
export interface SpotifyArtist {
  name: string;
  id: string;
}

/**
 * Interface for Spotify track data
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  preview_url: string | null;
}

/**
 * Interface for Spotify playlist data
 */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
  };
}

/**
 * Type representing the time range for fetching user data
 */
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

/**
 * Fetches the user's top tracks from Spotify API
 * @param limit - Maximum number of tracks to return (1-50)
 * @param timeRange - Time range for popularity calculation
 * @returns Promise that resolves to array of track objects
 */
export async function getTopTracks(
  limit: number = 10,
  timeRange: TimeRange = 'long_term',
): Promise<SpotifyTrack[]> {
  try {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const response = await apiClient<{ items: SpotifyTrack[] }>({
      method: 'GET',
      endpoint: `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    });
    return response.items || [];
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
}

/**
 * Fetches the user's playlists from Spotify API
 * @param limit - Maximum number of playlists to return
 * @returns Promise that resolves to array of playlist objects
 */
export async function getUserPlaylists(limit: number = 20): Promise<SpotifyPlaylist[]> {
  try {
    const response = await apiClient<{ items: SpotifyPlaylist[] }>({
      method: 'GET',
      endpoint: `v1/me/playlists?limit=${limit}`,
    });
    return response.items || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
}

/**
 * Fetches the user's saved tracks from Spotify API
 * @param limit - Maximum number of tracks to return
 * @returns Promise that resolves to array of track objects
 */
export async function getSavedTracks(limit: number = 20): Promise<SpotifyTrack[]> {
  try {
    const response = await apiClient<{ items: { track: SpotifyTrack }[] }>({
      method: 'GET',
      endpoint: `v1/me/tracks?limit=${limit}`,
    });
    return (response.items || []).map(item => item.track);
  } catch (error) {
    console.error('Error fetching saved tracks:', error);
    return [];
  }
}

/**
 * Fetches the audio features for a track from Spotify API
 * @param trackId - Spotify ID of the track
 * @returns Promise that resolves to the audio features object
 */
export async function getAudioFeatures(trackId: string): Promise<any> {
  try {
    return await apiClient<any>({
      method: 'GET',
      endpoint: `v1/audio-features/${trackId}`,
    });
  } catch (error) {
    console.error('Error fetching audio features:', error);
    throw error;
  }
}
