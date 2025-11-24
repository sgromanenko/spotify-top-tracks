import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { SpotifyTrack } from '@/services/spotify';

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface PlayerState {
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
  position: number;
  duration: number;
  paused: boolean;
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
}

interface PlayerStoreState {
  player: any;
  deviceId: string | null;
  playerState: PlayerState | null;
  isReady: boolean;
  isPlaying: boolean;
  error: string | null;
  repeatMode: 'off' | 'context' | 'track';
  shuffleState: boolean;
  volume: number;
}

interface PlayerStoreActions {
  initializePlayer: (token: string) => Promise<void>;
  playTrack: (trackUri: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  setRepeatMode: (mode: 'off' | 'context' | 'track') => Promise<void>;
  seekToPosition: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getAvailableDevices: () => Promise<SpotifyDevice[]>;
  transferPlayback: (deviceId: string) => Promise<void>;
  setPlayerState: (state: PlayerState | null) => void;
  setError: (error: string | null) => void;
  setReady: (ready: boolean) => void;
  setDeviceId: (deviceId: string | null) => void;
}

type PlayerStore = PlayerStoreState & PlayerStoreActions;

const PLAYER_NAME = 'Spotify Enhanced Web Player';

export const usePlayerStore = create<PlayerStore>()(
  devtools((set, get) => ({
    // State
    player: null,
    deviceId: null,
    playerState: null,
    isReady: false,
    isPlaying: false,
    error: null,
    repeatMode: 'off',
    shuffleState: false,
    volume: 0.5,

    // Actions
    initializePlayer: async (token: string) => {
      if (!window.Spotify || !window.Spotify.PlayerSDKReady) {
        set({ error: 'Spotify SDK not ready' });
        return;
      }

      try {
        const spotifyPlayer = new window.Spotify.Player({
          name: PLAYER_NAME,
          getOAuthToken: (cb: (token: string) => void) => cb(token),
          volume: 0.5,
        });

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
          set({ error: `Initialization error: ${message}` });
        });

        spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
          set({ error: `Authentication error: ${message}` });
        });

        spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
          set({ error: `Account error: ${message}` });
        });

        spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
          set({ error: `Playback error: ${message}` });
        });

        // Playback status updates
        spotifyPlayer.addListener('player_state_changed', (state: PlayerState | null) => {
          set({
            playerState: state,
            isPlaying: !state?.paused,
          });
        });

        // Ready
        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          set({
            deviceId: device_id,
            isReady: true,
            error: null,
          });
        });

        // Not Ready
        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          set({
            deviceId: device_id,
            isReady: false,
          });
        });

        // Connect to the player
        const success = await spotifyPlayer.connect();
        if (success) {
          set({ player: spotifyPlayer });
        } else {
          set({ error: 'Failed to connect to Spotify player' });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Player initialization failed',
        });
      }
    },

    playTrack: async (trackUri: string) => {
      const { player, deviceId } = get();
      if (!player || !deviceId) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to play track',
        });
      }
    },

    togglePlay: async () => {
      const { player, isPlaying } = get();
      if (!player) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        if (isPlaying) {
          await player.pause();
        } else {
          await player.resume();
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to toggle playback',
        });
      }
    },

    previousTrack: async () => {
      const { player } = get();
      if (!player) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        await player.previousTrack();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to play previous track',
        });
      }
    },

    nextTrack: async () => {
      const { player } = get();
      if (!player) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        await player.nextTrack();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to play next track',
        });
      }
    },

    toggleShuffle: async () => {
      const { shuffleState } = get();
      const newShuffleState = !shuffleState;

      try {
        await fetch('https://api.spotify.com/v1/me/player/shuffle', {
          method: 'PUT',
          body: JSON.stringify({ state: newShuffleState }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        set({ shuffleState: newShuffleState });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to toggle shuffle',
        });
      }
    },

    setRepeatMode: async (mode: 'off' | 'context' | 'track') => {
      try {
        await fetch('https://api.spotify.com/v1/me/player/repeat', {
          method: 'PUT',
          body: JSON.stringify({ state: mode }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        set({ repeatMode: mode });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to set repeat mode',
        });
      }
    },

    seekToPosition: async (positionMs: number) => {
      const { player } = get();
      if (!player) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        await player.seek(positionMs);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to seek to position',
        });
      }
    },

    setVolume: async (volume: number) => {
      const { player } = get();
      if (!player) {
        set({ error: 'Player not ready' });
        return;
      }

      try {
        await player.setVolume(volume);
        set({ volume });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to set volume',
        });
      }
    },

    getAvailableDevices: async (): Promise<SpotifyDevice[]> => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }

        const data = await response.json();
        return data.devices || [];
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to get devices',
        });
        return [];
      }
    },

    transferPlayback: async (deviceId: string) => {
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          body: JSON.stringify({ device_ids: [deviceId], play: false }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        set({ deviceId });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to transfer playback',
        });
      }
    },

    setPlayerState: (state: PlayerState | null) => set({ playerState: state }),
    setError: (error: string | null) => set({ error }),
    setReady: (ready: boolean) => set({ isReady: ready }),
    setDeviceId: (deviceId: string | null) => set({ deviceId }),
  }))
);
