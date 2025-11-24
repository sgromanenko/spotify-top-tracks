import apiClient from './api/client';

interface LyricsSearchParams {
  title: string;
  artist: string;
  isrc?: string;
}

/**
 * Fetches lyrics for a given track using track details
 *
 * @param trackId The Spotify track ID
 * @param params Additional search parameters to help with lyrics search
 * @returns Promise that resolves to lyrics text or null if not found
 */
export async function getTrackLyrics(
  trackId: string,
  params: LyricsSearchParams,
): Promise<string | null> {
  try {
    // First attempt: try to get lyrics by track ID directly
    try {
      // Here we'd call our lyrics API with the Spotify track ID
      // This is a placeholder for an actual API integration
      console.log(`Fetching lyrics for track ID: ${trackId}`);

      // For demonstration, we'll simulate an API call with a 70% success rate
      const random = Math.random();
      if (random > 0.3) {
        return generatePlaceholderLyrics(params.title, params.artist);
      }
    } catch (error) {
      console.warn(`Failed to fetch lyrics by track ID, falling back to search: ${error}`);
      // Continue to next attempt
    }

    // Second attempt: try to get lyrics by ISRC if available
    if (params.isrc) {
      try {
        console.log(`Fetching lyrics by ISRC: ${params.isrc}`);
        // Simulated API call
        const random = Math.random();
        if (random > 0.4) {
          return generatePlaceholderLyrics(params.title, params.artist);
        }
      } catch (error) {
        console.warn(`Failed to fetch lyrics by ISRC, falling back to search: ${error}`);
        // Continue to next attempt
      }
    }

    // Final attempt: search by artist and title
    try {
      console.log(`Searching lyrics for: "${params.title}" by ${params.artist}`);
      // Simulated API call
      const random = Math.random();
      if (random > 0.5) {
        return generatePlaceholderLyrics(params.title, params.artist);
      }
    } catch (error) {
      console.error(`Failed to search lyrics: ${error}`);
      return null;
    }

    // If all attempts fail, return null
    console.warn(`No lyrics found for "${params.title}" by ${params.artist}`);
    return null;
  } catch (error) {
    console.error('Error in getTrackLyrics:', error);
    return null;
  }
}

/**
 * Fetches additional track information from Spotify API
 *
 * @param trackId The Spotify track ID
 * @returns Promise that resolves to track details object
 */
export async function getTrackDetails(trackId: string): Promise<any> {
  try {
    if (!trackId) {
      console.error('Invalid track ID provided');
      throw new Error('Invalid track ID');
    }

    console.log(`Fetching track details for: ${trackId}`);

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
 * TEMPORARY FUNCTION: Generates placeholder lyrics for demo purposes
 * This would be replaced by an actual lyrics API integration
 */
function generatePlaceholderLyrics(title: string, artist: string): string {
  return `[Generated placeholder lyrics for demonstration]
  
"${title}"
by ${artist}

Verse 1:
Words flow like a river through time
Memories echo in every line
The melody captures a moment so fine
In this song that's yours and mine

Chorus:
This is just a placeholder
For the lyrics we'd display
If we had a proper API
To fetch them today

Verse 2:
Digital notes dance across the screen
Representing words that convey what they mean
The emotion behind what's heard but not seen
In this music that makes us keen

(Chorus)

Bridge:
In a real implementation
We'd connect to a lyrics source
Showing the actual words
That would guide us through the course

(Chorus)

Outro:
So imagine the real lyrics here
As the music brings you cheer
This placeholder will disappear
When the actual API is near

© ${new Date().getFullYear()} Spotify Dev UI Demo`;
}
