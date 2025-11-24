import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePlayer } from '@/context/PlayerContext';

// Define Device interface to match the one in PlayerContext
interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

const PlayerContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  height: 110px;
`;

const PlayerContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 100%;
  overflow: hidden;
`;

const MainControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const SecondaryControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  width: 36px;
  height: 36px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AlbumArt = styled.img`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TrackName = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArtistName = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface ToggleButtonProps {
  active: boolean;
}

const ToggleButton = styled(Button)<ToggleButtonProps>`
  color: ${({ theme, active }) => (active ? theme.colors.primary.main : theme.colors.text.primary)};
  font-size: 1.2rem;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
`;

const Progress = styled.div<{ width: number }>`
  position: absolute;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 2px;
  width: ${props => props.width}%;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  text-align: center;
  font-size: 0.75rem;
  padding: 0.5rem;
`;

const PlayerStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.4rem;
  padding: 0 0.25rem;
`;

const DeviceSelector = styled.div`
  position: relative;
  display: inline-block;
`;

const DeviceButton = styled(Button)`
  font-size: 1rem;
`;

const DeviceDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  min-width: 200px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 0.5rem 0;
  z-index: 10;
  margin-bottom: 0.5rem;
`;

const DeviceItem = styled.div<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.background.elevated : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const DeviceIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 0.9rem;
`;

const DeviceName = styled.span`
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
`;

const ActiveBadge = styled.span`
  font-size: 0.7rem;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  margin-left: 0.5rem;
`;

// Vector icon wrapper
const Icon = styled.svg`
  width: 20px;
  height: 20px;
  display: block;
`;

// Secondary circular button
const ControlButton = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  color: ${({ disabled }) => (disabled ? '#B3B3B3' : '#FFFFFF')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid #1db954;
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

// Primary play/pause button
const PrimaryButton = styled(ControlButton)`
  width: 56px;
  height: 56px;
  background: #1db954;
  color: #000;
  box-shadow: 0 8px 24px rgba(29, 185, 84, 0.35);
  transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.03);
    box-shadow: 0 10px 28px rgba(29, 185, 84, 0.45);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

// Format time in MM:SS, format differently when duration is 0
const formatTime = (ms: number): string => {
  if (ms === 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Get next repeat mode
const getNextRepeatMode = (currentMode: string): 'off' | 'context' | 'track' => {
  switch (currentMode) {
    case 'off':
      return 'context';
    case 'context':
      return 'track';
    case 'track':
    default:
      return 'off';
  }
};

const SpotifyPlayer: React.FC = () => {
  const {
    playerState,
    isReady,
    isPlaying,
    error,
    togglePlay,
    previousTrack,
    nextTrack,
    toggleShuffle,
    setRepeatMode,
    repeatMode,
    shuffleState,
    seekToPosition,
    getAvailableDevices,
    transferPlayback,
    deviceId: currentDeviceId,
  } = usePlayer();
  
  const [progress, setProgress] = useState<number>(0);
  const [progressMs, setProgressMs] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [showDeviceSelector, setShowDeviceSelector] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  console.log('[SpotifyPlayer] Render - isReady:', isReady, 'playerState:', !!playerState);

  const currentTrack = playerState?.track_window?.current_track;
  const disallows = playerState?.disallows || {
    pausing: false,
    peeking_next: false,
    peeking_prev: false,
    resuming: false,
    seeking: false,
    skipping_next: false,
    skipping_prev: false,
  };

  // Determine if next/previous buttons should be disabled
  const isNextDisabled = disallows.skipping_next || !playerState?.track_window?.next_tracks?.length;
  const isPrevDisabled =
    disallows.skipping_prev || !playerState?.track_window?.previous_tracks?.length;

  // Update progress periodically when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        if (playerState) {
          const newProgress = Math.min(progressMs + 1000, playerState.duration);
          setProgressMs(newProgress);
          setProgress((newProgress / playerState.duration) * 100);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playerState, progressMs]);

  // Reset progress when track changes
  useEffect(() => {
    if (playerState) {
      setProgressMs(playerState.position);
      setProgress((playerState.position / playerState.duration) * 100);
      setDuration(playerState.duration);
      // Clear any local errors when track changes successfully
      setLocalError(null);
    }
  }, [playerState]);

  // Only show transient errors for a short time
  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => {
        setLocalError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch available devices when dropdown is opened
  const handleDeviceSelectorClick = async () => {
    if (!showDeviceSelector) {
      const availableDevices = await getAvailableDevices();
      setDevices(availableDevices);
    }
    setShowDeviceSelector(!showDeviceSelector);
  };

  // Handle device selection
  const handleDeviceSelect = async (deviceId: string) => {
    if (deviceId !== currentDeviceId) {
      await transferPlayback(deviceId);
    }
    setShowDeviceSelector(false);
  };

  // Close device selector when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDeviceSelector(false);
    };

    if (showDeviceSelector) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDeviceSelector]);

  // Handle repeat mode toggle
  const handleRepeatToggle = () => {
    if (!setRepeatMode) return;
    
    const modes: ('off' | 'context' | 'track')[] = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Handle seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState || !isReady) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;

    const seekPosition = Math.floor(playerState.duration * percentage);
    setProgressMs(seekPosition);
    setProgress(percentage * 100);

    // Call the seekToPosition function from PlayerContext
    seekToPosition(seekPosition);
  };

  if (!isReady) {
    return (
      <PlayerContainer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.9rem', color: '#B3B3B3' }}>
          {localError ? <ErrorMessage>{localError}</ErrorMessage> : <span>Initializing Spotify Player...</span>}
        </div>
      </PlayerContainer>
    );
  }

  // Default values when no track is playing
  const track = playerState?.track_window?.current_track || {
    name: 'Ready to Play',
    artists: [{ name: 'Select a track' }],
    album: { name: 'No Album', images: [] }
  };
  const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/42';
  const artistNames = track.artists.map((artist: any) => artist.name).join(', ');

  // Get repeat icon based on current mode
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'track':
        return '🔂'; // Repeat one
      case 'context':
        return '🔁'; // Repeat all
      case 'off':
      default:
        return '🔁'; // Repeat off (same icon, but not highlighted)
    }
  };

  return (
    <PlayerContainer>
      <PlayerContent>
        <NowPlaying>
          <AlbumArt src={albumImage} alt={`Album cover for ${track.album.name}`} />
          <TrackInfo>
            <TrackName>{track.name}</TrackName>
            <ArtistName>{artistNames}</ArtistName>
          </TrackInfo>
        </NowPlaying>

        <MainControls>
          <ControlButton
            onClick={previousTrack}
            disabled={isPrevDisabled}
            aria-label="Previous track"
            title={isPrevDisabled ? 'No previous tracks' : 'Previous track'}
          >
            <Icon viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M6 5h2v14H6V5zm3.5 7L20 19V5l-10.5 7z" />
            </Icon>
          </ControlButton>
          <PrimaryButton
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Icon viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#000" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </Icon>
              ) : (
                <Icon viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#000" d="M8 5v14l11-7L8 5z" />
                </Icon>
              )}
            </PrimaryButton>
            <ControlButton
              onClick={nextTrack}
              disabled={isNextDisabled}
              aria-label="Next track"
              title={isNextDisabled ? 'No next tracks' : 'Next track'}
            >
              <Icon viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M18 19h-2V5h2v14zM4 19l10.5-7L4 5v14z" />
              </Icon>
            </ControlButton>
        </MainControls>

        <SecondaryControls>
          <ToggleButton
            onClick={toggleShuffle}
            active={shuffleState}
            aria-label={shuffleState ? 'Disable shuffle' : 'Enable shuffle'}
            title={shuffleState ? 'Disable shuffle' : 'Enable shuffle'}
          >
            🔀
          </ToggleButton>
          <ToggleButton
            onClick={handleRepeatToggle}
            active={repeatMode !== 'off'}
            aria-label={`Repeat mode: ${repeatMode}`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {getRepeatIcon()}
          </ToggleButton>

          <DeviceSelector onClick={e => e.stopPropagation()}>
            <DeviceButton
              onClick={handleDeviceSelectorClick}
              aria-label="Select playback device"
              title="Select playback device"
            >
              📱
            </DeviceButton>

            {showDeviceSelector && (
              <DeviceDropdown>
                {devices.length === 0 ? (
                  <DeviceItem isActive={false}>
                    <DeviceName>No devices found</DeviceName>
                  </DeviceItem>
                ) : (
                  devices.map(device => (
                    <DeviceItem
                      key={device.id}
                      isActive={device.is_active}
                      onClick={() => handleDeviceSelect(device.id)}
                    >
                      <DeviceIcon>
                        {device.type === 'Computer'
                          ? '💻'
                          : device.type === 'Smartphone'
                            ? '📱'
                            : device.type === 'Speaker'
                              ? '🔊'
                              : '🎵'}
                      </DeviceIcon>
                      <DeviceName>{device.name}</DeviceName>
                      {device.is_active && <ActiveBadge>Active</ActiveBadge>}
                    </DeviceItem>
                  ))
                )}
              </DeviceDropdown>
            )}
          </DeviceSelector>
        </SecondaryControls>
      </PlayerContent>

      <ProgressContainer onClick={handleProgressClick}>
        <Progress width={progress} />
      </ProgressContainer>

      <PlayerStatus>
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(duration)}</span>
      </PlayerStatus>

      {localError && <ErrorMessage>{localError}</ErrorMessage>}
    </PlayerContainer>
  );
};

export default SpotifyPlayer;
