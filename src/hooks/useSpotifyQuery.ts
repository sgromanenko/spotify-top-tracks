import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SpotifyPlaylist, SpotifyTrack, TimeRange } from '@/services/spotify';
import { useAuthStore } from '@/stores/auth';

// Query keys factory
export const spotifyKeys = {
  all: ['spotify'] as const,
  tracks: () => [...spotifyKeys.all, 'tracks'] as const,
  track: (id: string) => [...spotifyKeys.tracks(), id] as const,
  topTracks: (timeRange: TimeRange, limit: number, offset: number) =>
    [...spotifyKeys.tracks(), 'top', timeRange, limit, offset] as const,
  recentTracks: () => [...spotifyKeys.tracks(), 'recent'] as const,
  savedTracks: () => [...spotifyKeys.tracks(), 'saved'] as const,
  playlists: () => [...spotifyKeys.all, 'playlists'] as const,
  playlist: (id: string) => [...spotifyKeys.playlists(), id] as const,
  user: () => [...spotifyKeys.all, 'user'] as const,
  userProfile: (id: string) => [...spotifyKeys.user(), id] as const,
  search: (query: string, type: string) => [...spotifyKeys.all, 'search', query, type] as const,
  recommendations: (seeds: string[]) => [...spotifyKeys.all, 'recommendations', seeds] as const,
} as const;

// API client with authentication
const spotifyApi = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = useAuthStore.getState().token;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await useAuthStore.getState().refreshAccessToken();
        // Retry the request with new token
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            ...options,
            headers: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });

          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.statusText}`);
          }

          return retryResponse.json();
        }
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Track endpoints
  async getTopTracks(
    timeRange: TimeRange = 'long_term',
    limit = 20,
    offset = 0
  ): Promise<{ items: SpotifyTrack[]; total: number; limit: number; offset: number; next: string | null; previous: string | null }> {
    return this.request(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    );
  },

  async getRecentTracks(
    limit = 20
  ): Promise<{ items: Array<{ track: SpotifyTrack; played_at: string }> }> {
    return this.request(`/me/player/recently-played?limit=${limit}`);
  },

  async getSavedTracks(
    limit = 20,
    offset = 0
  ): Promise<{ items: Array<{ track: SpotifyTrack; added_at: string }> }> {
    return this.request(`/me/tracks?limit=${limit}&offset=${offset}`);
  },

  // Playlist endpoints
  async getPlaylists(limit = 20, offset = 0): Promise<{ items: SpotifyPlaylist[] }> {
    return this.request(`/me/playlists?limit=${limit}&offset=${offset}`);
  },

  async getPlaylist(
    id: string
  ): Promise<SpotifyPlaylist & { tracks: { items: Array<{ track: SpotifyTrack }> } }> {
    return this.request(`/playlists/${id}`);
  },

  // User endpoints
  async getCurrentUser(): Promise<any> {
    return this.request('/me');
  },

  // Search endpoints
  async search(query: string, type: string, limit = 20): Promise<any> {
    return this.request(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  },

  // Recommendations
  async getRecommendations(
    seedTracks?: string[],
    seedArtists?: string[],
    seedGenres?: string[]
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const params = new URLSearchParams();
    if (seedTracks?.length) params.append('seed_tracks', seedTracks.join(','));
    if (seedArtists?.length) params.append('seed_artists', seedArtists.join(','));
    if (seedGenres?.length) params.append('seed_genres', seedGenres.join(','));

    return this.request(`/recommendations?${params.toString()}`);
  },

  // Track actions
  async saveTrack(trackId: string): Promise<void> {
    return this.request(`/me/tracks`, {
      method: 'PUT',
      body: JSON.stringify({ ids: [trackId] }),
    });
  },

  async unsaveTrack(trackId: string): Promise<void> {
    return this.request(`/me/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({ ids: [trackId] }),
    });
  },

  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    return this.request(`/me/tracks/contains?ids=${trackIds.join(',')}`);
  },
};

// Custom hooks
export const useTopTracks = (
  timeRange: TimeRange = 'long_term',
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: spotifyKeys.topTracks(timeRange, limit, offset),
    queryFn: () => spotifyApi.getTopTracks(timeRange, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false; // Don't retry auth errors
      }
      return failureCount < 3;
    },
  });
};

export const useRecentTracks = (limit = 20) => {
  return useQuery({
    queryKey: spotifyKeys.recentTracks(),
    queryFn: () => spotifyApi.getRecentTracks(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSavedTracks = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: [...spotifyKeys.savedTracks(), limit, offset],
    queryFn: () => spotifyApi.getSavedTracks(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePlaylists = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: [...spotifyKeys.playlists(), limit, offset],
    queryFn: () => spotifyApi.getPlaylists(limit, offset),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: spotifyKeys.playlist(id),
    queryFn: () => spotifyApi.getPlaylist(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: spotifyKeys.user(),
    queryFn: () => spotifyApi.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useSearch = (query: string, type: string) => {
  return useQuery({
    queryKey: spotifyKeys.search(query, type),
    queryFn: () => spotifyApi.search(query, type),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecommendations = (
  seedTracks?: string[],
  seedArtists?: string[],
  seedGenres?: string[]
) => {
  const seeds = [...(seedTracks || []), ...(seedArtists || []), ...(seedGenres || [])];

  return useQuery({
    queryKey: spotifyKeys.recommendations(seeds),
    queryFn: () => spotifyApi.getRecommendations(seedTracks, seedArtists, seedGenres),
    enabled: seeds.length > 0 && seeds.length <= 5, // Spotify allows max 5 seeds
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation hooks
export const useSaveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => spotifyApi.saveTrack(trackId),
    onSuccess: (_, trackId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: spotifyKeys.savedTracks() });
      queryClient.invalidateQueries({ queryKey: spotifyKeys.user() });
    },
    onError: error => {
      console.error('Failed to save track:', error);
    },
  });
};

export const useUnsaveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => spotifyApi.unsaveTrack(trackId),
    onSuccess: (_, trackId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: spotifyKeys.savedTracks() });
      queryClient.invalidateQueries({ queryKey: spotifyKeys.user() });
    },
    onError: error => {
      console.error('Failed to unsave track:', error);
    },
  });
};

export const useCheckSavedTracks = (trackIds: string[]) => {
  return useQuery({
    queryKey: [...spotifyKeys.savedTracks(), 'check', trackIds],
    queryFn: () => spotifyApi.checkSavedTracks(trackIds),
    enabled: trackIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
