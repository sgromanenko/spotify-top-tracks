import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getTopTracks, SpotifyTrack, TimeRange } from '../services/spotify';

interface SpotifyContextType {
  tracks: SpotifyTrack[];
  selectedTrack: SpotifyTrack | null;
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
  trackLimit: number;
  setSelectedTrack: (track: SpotifyTrack) => void;
  setTimeRange: (range: TimeRange) => void;
  setTrackLimit: (limit: number) => void;
  refreshTracks: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

interface SpotifyProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Spotify data
 */
export const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const [trackLimit, setTrackLimit] = useState<number>(10);

  /**
   * Refreshes the tracks from the Spotify API
   */
  const refreshTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopTracks(trackLimit, timeRange);
      setTracks(data);

      // Select first track by default if none is selected
      if (data.length > 0 && !selectedTrack) {
        setSelectedTrack(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch your top tracks. The token might have expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [trackLimit, timeRange, selectedTrack]);

  // Fetch tracks when trackLimit or timeRange changes
  useEffect(() => {
    refreshTracks();
  }, [trackLimit, timeRange, refreshTracks]);

  const value = {
    tracks,
    selectedTrack,
    loading,
    error,
    timeRange,
    trackLimit,
    setSelectedTrack,
    setTimeRange,
    setTrackLimit,
    refreshTracks,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

/**
 * Hook to use the Spotify context
 */
export const useSpotify = (): SpotifyContextType => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};
