import apiClient from '../api/client';

/**
 * Fetches detailed information about a track from Spotify API
 * @param trackId The Spotify ID of the track
 * @returns Promise resolving to the track details
 */
export async function fetchTrackInfo(trackId: string): Promise<any> {
  try {
    const response = await apiClient<any>({
      method: 'GET',
      endpoint: `v1/tracks/${trackId}`,
    });

    console.log('Track info response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching track info:', error);
    throw error;
  }
}

/**
 * Fetches lyrics for a track using the song name and artist
 * Note: This uses a mock implementation as Spotify API doesn't provide lyrics directly
 * In a real app, you would integrate with a lyrics API like Genius or Musixmatch
 * @param songName The name of the song
 * @param artistName The name of the artist
 * @returns Promise resolving to the lyrics
 */
export async function fetchLyrics(songName: string, artistName: string): Promise<string> {
  // In a real implementation, you would call a lyrics API here
  // For now, we'll return a mock response or simulate a network request

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock lyrics for demonstration
  // In production, you would integrate with a real lyrics API
  const mockLyrics = generateMockLyrics(songName, artistName);
  return mockLyrics;
}

/**
 * Generate mock lyrics for demonstration purposes
 * In a real app, you would replace this with a call to a lyrics API
 */
function generateMockLyrics(songName: string, artistName: string): string {
  // A small set of mock lyrics for demonstration
  const lyrics = `[Verse 1]
This is where the lyrics for "${songName}" by ${artistName} would appear
If this were connected to a real lyrics API

[Chorus]
Lyrics are not provided directly by the Spotify API
You would need to integrate with services like Genius or Musixmatch
To get real lyrics in a production application

[Verse 2]
In a real implementation, you would make an API call
To fetch the actual lyrics for this specific song
The display would look similar to this format

[Outro]
This is just a placeholder to demonstrate the UI
In your production app, replace this with real lyrics data`;

  return lyrics;
}

/**
 * Fetches artist information from Spotify API
 * @param artistId The Spotify ID of the artist
 * @returns Promise resolving to the artist details
 */
export async function fetchArtistInfo(artistId: string): Promise<any> {
  try {
    const response = await apiClient<any>({
      method: 'GET',
      endpoint: `v1/artists/${artistId}`,
    });

    return response;
  } catch (error) {
    console.error('Error fetching artist info:', error);
    throw error;
  }
}

/**
 * Fetches album information from Spotify API
 * @param albumId The Spotify ID of the album
 * @returns Promise resolving to the album details
 */
export async function fetchAlbumInfo(albumId: string): Promise<any> {
  try {
    const response = await apiClient<any>({
      method: 'GET',
      endpoint: `v1/albums/${albumId}`,
    });

    return response;
  } catch (error) {
    console.error('Error fetching album info:', error);
    throw error;
  }
}
