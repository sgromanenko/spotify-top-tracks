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
  shuffleState: boolean;
  repeatMode: 'off' | 'context' | 'track';
  error: string | null;
  playTrack: (trackUri: string) => void;
  togglePlay: () => void;
  previousTrack: () => void;
  nextTrack: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'off' | 'context' | 'track') => void;
  seekToPosition: (positionMs: number) => void;
  getAvailableDevices: () => Promise<any[]>;
  transferPlayback: (deviceId: string) => Promise<void>;
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

  // Derived state
  const shuffleState = playerState?.shuffle ?? false;
  const repeatMode: 'off' | 'context' | 'track' = 
    playerState?.repeat_mode === 1 ? 'context' : 
    playerState?.repeat_mode === 2 ? 'track' : 'off';

  // Initialize the player
  useEffect(() => {
    let localPlayer: any = null;
    let isMounted = true;

    const setupPlayer = () => {
      if (!isMounted) return;
      
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
        if (!isMounted) return;
        console.error('Initialization error:', message);
        setError(`Player initialization failed: ${message}`);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        console.error('Authentication error:', message);
        setError(`Authentication failed: ${message}`);
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        console.error('Account error:', message);
        setError(`Account error: ${message}. Premium account is required.`);
      });

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        console.error('Playback error:', message);
        setError(`Playback error: ${message}`);
      });

      // Ready event
      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
        
        // Auto-transfer playback to this device to make it active
        const transferPlayback = async (retries = 3) => {
          if (!isMounted) return;
          try {
             await fetch(`https://api.spotify.com/v1/me/player`, {
              method: 'PUT',
              body: JSON.stringify({ device_ids: [device_id], play: false }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('Playback transferred successfully');
          } catch (e) {
            console.error('Failed to transfer playback:', e);
            if (retries > 0 && isMounted) {
              console.log(`Retrying transfer playback (${retries} retries left)...`);
              setTimeout(() => transferPlayback(retries - 1), 1000);
            }
          }
        };
        // Wait a bit for the device to be registered on the server side
        setTimeout(() => transferPlayback(), 500);
      });

      // Not ready event
      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      // Player state changed
      spotifyPlayer.addListener('player_state_changed', (state: PlayerState) => {
        if (!isMounted) return;
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
          if (!isMounted) return;
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          } else {
            console.error('Failed to connect to Spotify');
            setError('Failed to connect to Spotify');
          }
        })
        .catch((err: Error) => {
          if (!isMounted) return;
          console.error('Error connecting to Spotify:', err);
          setError(`Connection error: ${err.message}`);
        });

      if (isMounted) {
        setPlayer(spotifyPlayer);
        localPlayer = spotifyPlayer;
      } else {
        spotifyPlayer.disconnect();
      }
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
      isMounted = false;
      if (localPlayer) {
        localPlayer.disconnect();
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
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          console.error('Device not found or not active. Attempting to reactivate...');
          // Try to transfer playback again
          try {
            await fetch(`https://api.spotify.com/v1/me/player`, {
              method: 'PUT',
              body: JSON.stringify({ device_ids: [deviceId], play: false }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            // Wait a bit and try to play again
            setTimeout(async () => {
              await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({ uris: [trackUri] }),
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
            }, 500);
          } catch (retryError) {
            console.error('Failed to reactivate device:', retryError);
            setError('Device is not available. Please ensure Spotify is open or select a different device.');
          }
        } else if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Playback error:', errorData);
          setError(`Playback failed: ${errorData?.error?.message || response.statusText}`);
        }
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

  // Seek to position
  const seekToPosition = useCallback((positionMs: number) => {
    if (!player) return;
    player.seek(positionMs);
  }, [player]);

  // Toggle shuffle
  const toggleShuffle = useCallback(async () => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${!shuffleState}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  }, [token, shuffleState]);

  // Set repeat mode
  const setRepeatMode = useCallback(async (mode: 'off' | 'context' | 'track') => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${mode}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  }, [token]);

  // Get available devices
  const getAvailableDevices = useCallback(async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }, [token]);

  // Transfer playback
  const transferPlayback = useCallback(async (targetDeviceId: string) => {
    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        body: JSON.stringify({ device_ids: [targetDeviceId], play: true }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  }, [token]);

  const value = {
    player,
    deviceId,
    playerState,
    isReady,
    isPlaying,
    shuffleState,
    repeatMode,
    error,
    playTrack,
    togglePlay,
    previousTrack,
    nextTrack,
    toggleShuffle,
    setRepeatMode,
    seekToPosition,
    getAvailableDevices,
    transferPlayback,
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
