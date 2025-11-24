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
  isLoadingInitial: boolean;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
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
      } else if (selectedTrack) {
        // If we had a selected track, try to find it in the new data
        const trackExists = data.find(track => track.id === selectedTrack.id);
        if (!trackExists && data.length > 0) {
          // If the track doesn't exist in the new data, select the first one
          setSelectedTrack(data[0]);
        }
      }
    } catch (err) {
      setError('Failed to fetch your top tracks. The token might have expired.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsLoadingInitial(false);
    }
  }, [trackLimit, timeRange, selectedTrack]);

  // Fetch tracks only on initial load and when trackLimit or timeRange changes
  useEffect(() => {
    refreshTracks();
  }, [trackLimit, timeRange, refreshTracks]);

  // Optimize track selection to avoid unnecessary state changes
  const handleSetSelectedTrack = useCallback(
    (track: SpotifyTrack) => {
      // Only update if it's a different track to avoid unnecessary re-renders
      if (!selectedTrack || selectedTrack.id !== track.id) {
        setSelectedTrack(track);
      }
    },
    [selectedTrack],
  );

  const value = {
    tracks,
    selectedTrack,
    loading,
    error,
    timeRange,
    trackLimit,
    setSelectedTrack: handleSetSelectedTrack,
    setTimeRange,
    setTrackLimit,
    refreshTracks,
    isLoadingInitial,
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
