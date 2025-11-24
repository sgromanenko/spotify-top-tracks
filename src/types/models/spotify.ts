/**
 * Spotify API Data Models
 * 
 * Type definitions for Spotify entities returned from the API
 */

/**
 * Spotify Artist
 */
export interface SpotifyArtist {
  id: string;
  name: string;
  images?: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres?: string[];
  popularity?: number;
  external_urls?: {
    spotify: string;
  };
}

/**
 * Spotify Album
 */
export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
  total_tracks: number;
  album_type?: string;
  external_urls?: {
    spotify: string;
  };
}

/**
 * Spotify Track
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  track_number: number;
  preview_url: string | null;
  is_playable: boolean;
  popularity?: number;
  explicit?: boolean;
  external_urls?: {
    spotify: string;
  };
  external_ids?: {
    isrc: string;
  };
  uri?: string;
}

/**
 * Spotify Playlist
 */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
    id: string;
  };
  public?: boolean;
  collaborative?: boolean;
  external_urls?: {
    spotify: string;
  };
}

/**
 * Spotify Device (for Web Playback SDK)
 */
export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

/**
 * Time range for fetching user data
 */
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

/**
 * Player State from Web Playback SDK
 */
export interface PlayerState {
  paused: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat_mode: 0 | 1 | 2; // 0: off, 1: context, 2: track
  track_window: {
    current_track: {
      id: string;
      name: string;
      uri: string;
      album: {
        name: string;
        uri: string;
        images: Array<{ url: string }>;
      };
      artists: Array<{
        name: string;
        uri: string;
      }>;
    };
    previous_tracks: any[];
    next_tracks: any[];
  };
  disallows?: {
    pausing?: boolean;
    skipping_prev?: boolean;
    skipping_next?: boolean;
  };
}
