import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';

// Define types for Spotify Player SDK
declare global {
  interface Window {
    Spotify: {
      Player: new (options: any) => any;
      PlayerSDKReady?: boolean;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Define player state interface
interface PlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      name: string;
      uri: string;
      album: {
        name: string;
        uri: string;
        images: { url: string }[];
      };
      artists: { name: string; uri: string }[];
    };
    previous_tracks: any[];
    next_tracks: any[];
  };
}

// PlayerContext interface
interface PlayerContextType {
  player: any;
  deviceId: string | null;
  playerState: PlayerState | null;
  isReady: boolean;
  isPlaying: boolean;
  error: string | null;
  playTrack: (trackUri: string) => void;
  togglePlay: () => void;
  previousTrack: () => void;
  nextTrack: () => void;
}

// Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Player name displayed in Spotify Connect
const PLAYER_NAME = 'Spotify Top Tracks Web Player';

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the player
  useEffect(() => {
    const setupPlayer = () => {
      if (!token || !window.Spotify || !window.Spotify.PlayerSDKReady) {
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: PLAYER_NAME,
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.5,
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization error:', message);
        setError(`Player initialization failed: ${message}`);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication error:', message);
        setError(`Authentication failed: ${message}`);
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account error:', message);
        setError(`Account error: ${message}. Premium account is required.`);
      });

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Playback error:', message);
        setError(`Playback error: ${message}`);
      });

      // Ready event
      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      // Not ready event
      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      // Player state changed
      spotifyPlayer.addListener('player_state_changed', (state: PlayerState) => {
        if (!state) {
          console.log('No player state available');
          return;
        }

        console.log('Player state changed:', state);
        setPlayerState(state);
        setIsPlaying(!state.paused);
      });

      // Connect
      spotifyPlayer
        .connect()
        .then((success: boolean) => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          } else {
            console.error('Failed to connect to Spotify');
            setError('Failed to connect to Spotify');
          }
        })
        .catch((err: Error) => {
          console.error('Error connecting to Spotify:', err);
          setError(`Connection error: ${err.message}`);
        });

      setPlayer(spotifyPlayer);

      // Cleanup
      return () => {
        spotifyPlayer.disconnect();
      };
    };

    // Wait for SDK to be ready
    if (window.Spotify && window.Spotify.PlayerSDKReady) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        window.Spotify.PlayerSDKReady = true;
        setupPlayer();
      };
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  // Play a specific track
  const playTrack = useCallback(
    async (trackUri: string) => {
      if (!deviceId) {
        console.error('No device ID available');
        setError('No device ID available');
        return;
      }

      try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error playing track:', error);
        setError('Failed to play track');
      }
    },
    [deviceId, token],
  );

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    player.togglePlay();
  }, [player]);

  // Previous track
  const previousTrack = useCallback(() => {
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    player.previousTrack();
  }, [player]);

  // Next track
  const nextTrack = useCallback(() => {
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    player.nextTrack();
  }, [player]);

  const value = {
    player,
    deviceId,
    playerState,
    isReady,
    isPlaying,
    error,
    playTrack,
    togglePlay,
    previousTrack,
    nextTrack,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// Custom hook to use the player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
