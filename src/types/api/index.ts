/**
 * API Types
 * 
 * Request and response types for API calls
 */

/**
 * Recommendation request options
 */
export interface RecommendationOptions {
  seedTracks?: string[];
  seedArtists?: string[];
  seedGenres?: string[];
  targets?: {
    energy?: number;
    valence?: number;
    danceability?: number;
    [key: string]: number | undefined;
  };
  limit?: number;
}

/**
 * API Error response
 */
export interface ApiError {
  status: number;
  message: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
