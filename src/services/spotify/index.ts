import apiClient from '../api/client';
import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyPlaylist,
  TimeRange,
} from '@/types';
import type { RecommendationOptions } from '@/types/api';

// Re-export types for backward compatibility
export type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyPlaylist,
  TimeRange,
};

/**
 * Fetches the user's top tracks from Spotify API
 * @param limit - Maximum number of tracks to return (1-50)
 * @param timeRange - Time range for popularity calculation
 * @returns Promise that resolves to array of track objects
 */
export async function getTopTracks(
  limit = 10,
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
export async function getUserPlaylists(limit = 20): Promise<SpotifyPlaylist[]> {
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
export async function getSavedTracks(limit = 20): Promise<SpotifyTrack[]> {
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
 * Fetches the user's recently played tracks
 * @param limit - Maximum number of tracks to return
 * @returns Promise that resolves to array of track objects
 */
export async function getRecentlyPlayed(limit = 20): Promise<SpotifyTrack[]> {
  try {
    const response = await apiClient<{ items: { track: SpotifyTrack }[] }>({
      method: 'GET',
      endpoint: `v1/me/player/recently-played?limit=${limit}`,
    });
    return (response.items || []).map(item => item.track);
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return [];
  }
}

/**
 * Fetches new releases
 * @param limit - Maximum number of albums to return
 * @returns Promise that resolves to array of album objects
 */
export async function getNewReleases(limit = 10): Promise<SpotifyAlbum[]> {
  try {
    const response = await apiClient<{ albums: { items: SpotifyAlbum[] } }>({
      method: 'GET',
      endpoint: `v1/browse/new-releases?limit=${limit}`,
    });
    return response.albums?.items || [];
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
}

/**
 * Fetches featured playlists
 * @param limit - Maximum number of playlists to return
 * @returns Promise that resolves to array of playlist objects
 */
export async function getFeaturedPlaylists(limit = 10): Promise<SpotifyPlaylist[]> {
  try {
    const response = await apiClient<{ playlists: { items: SpotifyPlaylist[] } }>({
      method: 'GET',
      // Add locale to help with region-specific content
      endpoint: `v1/browse/featured-playlists?limit=${limit}&locale=en_US`,
    });
    return response.playlists?.items || [];
  } catch (error) {
    // Silently fail for featured playlists as it's often region-locked or unavailable
    // This prevents 404 noise in the console
    return [];
  }
}

/**
 * Fetches recommendations based on seed tracks/artists/genres and target attributes
 */
export async function getRecommendations(options: RecommendationOptions): Promise<SpotifyTrack[]> {
  try {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    
    if (options.seedTracks?.length) params.append('seed_tracks', options.seedTracks.join(','));
    if (options.seedArtists?.length) params.append('seed_artists', options.seedArtists.join(','));
    if (options.seedGenres?.length) params.append('seed_genres', options.seedGenres.join(','));
    
    if (options.targets) {
      Object.entries(options.targets).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(`target_${key}`, value.toString());
        }
      });
    }

    const response = await apiClient<{ tracks: SpotifyTrack[] }>({
      method: 'GET',
      endpoint: `v1/recommendations?${params.toString()}`,
    });
    return response.tracks || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

/**
 * Search for tracks, artists, albums, and playlists
 * @param query - Search query
 * @param types - Array of types to search for
 * @param limit - Maximum number of results per type
 * @returns Promise that resolves to search results
 */
export async function search(
  query: string,
  types: string[] = ['track', 'artist', 'album', 'playlist'],
  limit = 10
): Promise<any> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: types.join(','),
      limit: limit.toString(),
    });

    const response = await apiClient<any>({
      method: 'GET',
      endpoint: `v1/search?${params.toString()}`,
    });
    return response;
  } catch (error) {
    console.error('Error searching:', error);
    return {};
  }
}

/**
 * Fetches the user's saved albums
 * @param limit - Maximum number of albums to return
 * @returns Promise that resolves to array of album objects
 */
export async function getUserAlbums(limit = 20): Promise<SpotifyAlbum[]> {
  try {
    const response = await apiClient<{ items: { album: SpotifyAlbum }[] }>({
      method: 'GET',
      endpoint: `v1/me/albums?limit=${limit}`,
    });
    return (response.items || []).map(item => item.album);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

/**
 * Fetches the user's followed artists
 * @param limit - Maximum number of artists to return
 * @returns Promise that resolves to array of artist objects
 */
export async function getFollowedArtists(limit = 20): Promise<SpotifyArtist[]> {
  try {
    const response = await apiClient<{ artists: { items: SpotifyArtist[] } }>({
      method: 'GET',
      endpoint: `v1/me/following?type=artist&limit=${limit}`,
    });
    return response.artists?.items || [];
  } catch (error) {
    console.error('Error fetching followed artists:', error);
    return [];
  }
}

/**
 * Create a new playlist
 * @param userId - Spotify user ID
 * @param name - Playlist name
 * @param description - Playlist description
 * @returns Promise that resolves to the created playlist object
 */
export async function createPlaylist(userId: string, name: string, description: string): Promise<SpotifyPlaylist | null> {
  try {
    const response = await apiClient<SpotifyPlaylist>({
      method: 'POST',
      endpoint: `v1/users/${userId}/playlists`,
      body: {
        name,
        description,
        public: false,
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
}

/**
 * Add tracks to a playlist
 * @param playlistId - Spotify playlist ID
 * @param uris - Array of track URIs
 * @returns Promise that resolves to true if successful
 */
export async function addTracksToPlaylist(playlistId: string, uris: string[]): Promise<boolean> {
  try {
    await apiClient({
      method: 'POST',
      endpoint: `v1/playlists/${playlistId}/tracks`,
      body: {
        uris,
      },
    });
    return true;
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    return false;
  }
}
/**
 * Check if tracks are saved in the user's library
 * @param ids - Array of track IDs
 * @returns Promise that resolves to array of booleans
 */
export async function checkUserSavedTracks(ids: string[]): Promise<boolean[]> {
  try {
    const response = await apiClient<boolean[]>({
      method: 'GET',
      endpoint: `v1/me/tracks/contains?ids=${ids.join(',')}`,
    });
    return response || [];
  } catch (error) {
    console.error('Error checking saved tracks:', error);
    return [];
  }
}

/**
 * Save tracks to the user's library
 * @param ids - Array of track IDs
 * @returns Promise that resolves to true if successful
 */
export async function saveTracksForUser(ids: string[]): Promise<boolean> {
  try {
    await apiClient({
      method: 'PUT',
      endpoint: `v1/me/tracks?ids=${ids.join(',')}`,
    });
    return true;
  } catch (error) {
    console.error('Error saving tracks:', error);
    return false;
  }
}

/**
 * Remove tracks from the user's library
 * @param ids - Array of track IDs
 * @returns Promise that resolves to true if successful
 */
export async function removeTracksForUser(ids: string[]): Promise<boolean> {
  try {
    await apiClient({
      method: 'DELETE',
      endpoint: `v1/me/tracks?ids=${ids.join(',')}`,
    });
    return true;
  } catch (error) {
    console.error('Error removing tracks:', error);
    return false;
  }
}
/**
 * Fetches additional track information from Spotify API
 * @param trackId The Spotify track ID
 * @returns Promise that resolves to track details object
 */
export async function getTrackDetails(trackId: string): Promise<any> {
  try {
    if (!trackId) {
      console.error('Invalid track ID provided');
      throw new Error('Invalid track ID');
    }

    const response = await apiClient({
      method: 'GET',
      endpoint: `v1/tracks/${trackId}`,
    });

    return response;
  } catch (error) {
    console.error('Error fetching track details:', error);
    throw error;
  }
}
/**
 * Get artist details
 * @param artistId - Spotify artist ID
 */
export async function getArtist(artistId: string): Promise<SpotifyArtist | null> {
  try {
    const response = await apiClient<SpotifyArtist>({
      method: 'GET',
      endpoint: `v1/artists/${artistId}`,
    });
    return response;
  } catch (error) {
    console.error('Error fetching artist:', error);
    return null;
  }
}

/**
 * Get artist's top tracks
 * @param artistId - Spotify artist ID
 * @param market - Country code (default: US)
 */
export async function getArtistTopTracks(artistId: string, market = 'US'): Promise<SpotifyTrack[]> {
  try {
    const response = await apiClient<{ tracks: SpotifyTrack[] }>({
      method: 'GET',
      endpoint: `v1/artists/${artistId}/top-tracks?market=${market}`,
    });
    return response.tracks || [];
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    return [];
  }
}

/**
 * Get artist's albums
 * @param artistId - Spotify artist ID
 * @param limit - Max results
 */
export async function getArtistAlbums(artistId: string, limit = 20): Promise<SpotifyAlbum[]> {
  try {
    const response = await apiClient<{ items: SpotifyAlbum[] }>({
      method: 'GET',
      endpoint: `v1/artists/${artistId}/albums?include_groups=album,single&limit=${limit}`,
    });
    return response.items || [];
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return [];
  }
}

/**
 * Get related artists
 * @param artistId - Spotify artist ID
 */
export async function getArtistRelatedArtists(artistId: string): Promise<SpotifyArtist[]> {
  try {
    const response = await apiClient<{ artists: SpotifyArtist[] }>({
      method: 'GET',
      endpoint: `v1/artists/${artistId}/related-artists`,
    });
    return response.artists || [];
  } catch (error) {
    console.error('Error fetching related artists:', error);
    return [];
  }
}

/**
 * Get album details
 * @param albumId - Spotify album ID
 */
export async function getAlbum(albumId: string): Promise<SpotifyAlbum | null> {
  try {
    const response = await apiClient<SpotifyAlbum>({
      method: 'GET',
      endpoint: `v1/albums/${albumId}`,
    });
    return response;
  } catch (error) {
    console.error('Error fetching album:', error);
    return null;
  }
}

/**
 * Get playlist details
 * @param playlistId - Spotify playlist ID
 */
export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
  try {
    const response = await apiClient<SpotifyPlaylist>({
      method: 'GET',
      endpoint: `v1/playlists/${playlistId}`,
    });
    return response;
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
}
