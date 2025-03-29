// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token =
  'BQD-jvUnpr7mY8tFKCBH5owo4hDav_rI-N3TCkS7k7z9T6Hqut7CPyh-brOqYt2Yd10L3CLO6fq49nKEmyk1BqdxNdPCfm_4C_rx4vrbUrT_mmUT2c7Z8YczM51ocvw7PNUIZJ-z_kONfZf7s8bQZ0bksQ9lXHkTIgRh0EQ_CuxqNhN-21mNjaTC2tPz0AX0pWIisFStN6pODIH-R-b9NraB2oDy1LP0Ux0XH07CvxVcdMP_Mel4r9JbdrMG--qw57y4DMS91cfZHlkuv6E7cDU7AzsV83bNEdH2';

interface SpotifyArtist {
  name: string;
  id: string;
}

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

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
  };
}

export async function fetchWebApi(endpoint: string, method: string, body?: any) {
  try {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        error: {
          status: res.status,
          message: errorData?.error?.message || `HTTP Error ${res.status}: ${res.statusText}`
        }
      };
    }

    return await res.json();
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: {
        status: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export async function getTopTracks(
  limit = 10,
  timeRange: TimeRange = 'long_term'
): Promise<SpotifyTrack[]> {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  const response = await fetchWebApi(
    `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    'GET'
  );

  if (response.error) {
    console.error('Error fetching top tracks:', response.error);
    return [];
  }

  return response.items || [];
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const response = await fetchWebApi('v1/me/playlists?limit=20', 'GET');

  if (response.error) {
    console.error('Error fetching playlists:', response.error);
    return [];
  }

  return response.items || [];
}

export async function getSavedTracks(limit = 20): Promise<SpotifyTrack[]> {
  const response = await fetchWebApi(`v1/me/tracks?limit=${limit}`, 'GET');

  if (response.error) {
    console.error('Error fetching saved tracks:', response.error);
    return [];
  }

  return (response.items || []).map((item: any) => item.track);
}

// Get audio features for a track (danceability, energy, tempo, etc.)
export async function getAudioFeatures(trackId: string): Promise<any> {
  const response = await fetchWebApi(`v1/audio-features/${trackId}`, 'GET');

  if (response.error) {
    console.error('Error fetching audio features:', response.error);
  }

  return response;
}
