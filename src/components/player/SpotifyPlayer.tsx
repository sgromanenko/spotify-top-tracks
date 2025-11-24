import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Shuffle, Repeat, Repeat1, Monitor, Smartphone, Speaker, Music, Heart } from 'lucide-react';
import { checkUserSavedTracks, saveTracksForUser, removeTracksForUser } from '@/services/spotify';

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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 95px;
  width: 100%;
`;

const PlayerContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  align-items: center;
  gap: 1rem;
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;

const MainControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
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
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s;
  width: 32px;
  height: 32px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const AlbumArt = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const TrackName = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ArtistName = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaceholderImage = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface ToggleButtonProps {
  active: boolean;
}

const ToggleButton = styled(Button)<ToggleButtonProps>`
  color: ${({ theme, active }) => (active ? theme.colors.primary.main : theme.colors.text.secondary)};
  
  &:hover {
    color: ${({ theme, active }) => (active ? theme.colors.primary.light : theme.colors.text.primary)};
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    height: 6px;
  }
`;

const Progress = styled.div<{ width: number }>`
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #1ed760, #1db954);
  border-radius: 2px;
  width: ${props => props.width}%;
  transition: width 0.1s linear;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  text-align: center;
  font-size: 0.7rem;
  padding: 0.25rem;
`;

const TimeText = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-variant-numeric: tabular-nums;
  min-width: 40px;
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
`;

const DeviceSelector = styled.div`
  position: relative;
  display: inline-block;
`;

const DeviceButton = styled(Button)``;

const DeviceDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  min-width: 220px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 0.5rem 0;
  z-index: 10;
  margin-bottom: 0.5rem;
`;

const DeviceItem = styled.div<{ isActive: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.background.elevated : 'transparent'};
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const DeviceName = styled.span`
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
`;

const ActiveBadge = styled.span`
  font-size: 0.7rem;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
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
  color: ${({ disabled }) => (disabled ? '#6B7280' : '#FFFFFF')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }
`;

// Primary play button
const PrimaryButton = styled(ControlButton)`
  width: 40px;
  height: 40px;
  background: #1db954;
  color: #000;
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.06);
    box-shadow: 0 6px 16px rgba(29, 185, 84, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }
`;

const SpotifyPlayer = () => {
  const {
    playerState,
    isReady,
    isPlaying,
    togglePlay,
    previousTrack,
    nextTrack,
    seekToPosition,
    error,
    shuffleState,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
    getAvailableDevices,
    transferPlayback,
  } = usePlayer();

  const [localError, setLocalError] = useState<string | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekPosition, setSeekPosition] = useState(0);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentTrackId = playerState?.track_window?.current_track?.id;

  // Sync error from context
  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if track is saved
  useEffect(() => {
    if (!currentTrackId) return;

    const checkSaved = async () => {
      const saved = await checkUserSavedTracks([currentTrackId]);
      setIsSaved(saved[0] || false);
    };

    checkSaved();
  }, [currentTrackId]);

  // Update progress from player state
  useEffect(() => {
    if (playerState) {
      setProgressMs(playerState.position);
      setDuration(playerState.duration);
    }
  }, [playerState]);

  // Progress animation when playing
  useEffect(() => {
    if (!isPlaying || !duration) return;

    const interval = setInterval(() => {
      setProgressMs(prev => {
        const next = prev + 1000;
        return next >= duration ? duration : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const progress = duration > 0 ? (progressMs / duration) * 100 : 0;

  const formatTime = (ms: number): string => {
    if (ms === 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if previous/next should be disabled
  const isPrevDisabled = !playerState?.track_window?.previous_tracks?.length;
  const isNextDisabled = !playerState?.track_window?.next_tracks?.length;

  // Handle device selector
  const handleDeviceSelectorClick = async () => {
    setShowDeviceSelector(!showDeviceSelector);
    if (!showDeviceSelector && getAvailableDevices) {
      const devices = await getAvailableDevices();
      setDevices(devices);
    }
  };

  const handleDeviceSelect = async (deviceId: string) => {
    if (transferPlayback) {
      await transferPlayback(deviceId);
      setShowDeviceSelector(false);
    }
  };

  // Handle repeat mode toggle
  const handleRepeatToggle = () => {
    if (!setRepeatMode) return;
    
    const modes: ('off' | 'context' | 'track')[] = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Get repeat icon based on mode
  const getRepeatIcon = () => {
    if (repeatMode === 'track') {
      return <Repeat1 size={18} />;
    }
    return <Repeat size={18} />;
  };

  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    const iconSize = 16;
    switch (type.toLowerCase()) {
      case 'computer':
        return <Monitor size={iconSize} />;
      case 'smartphone':
        return <Smartphone size={iconSize} />;
      case 'speaker':
        return <Speaker size={iconSize} />;
      default:
        return <Music size={iconSize} />;
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newPosition = Math.floor(duration * percentage);
    setSeekPosition(newPosition);
    seekToPosition(newPosition);
  };

  if (!isReady || !playerState) {
    return null;
  }

  // Track is guaranteed to exist because of the check above and in MainLayout
  const track = playerState.track_window.current_track;
  const artistNames = track.artists.map((artist: any) => artist.name).join(', ');

  const handleToggleSave = async () => {
    if (!currentTrackId) return;

    if (isSaved) {
      const success = await removeTracksForUser([currentTrackId]);
      if (success) setIsSaved(false);
    } else {
      const success = await saveTracksForUser([currentTrackId]);
      if (success) setIsSaved(true);
    }
  };

  return (
    <PlayerContainer>
      <PlayerContent>
        <NowPlaying>
          {track?.album?.images?.[0]?.url ? (
            <AlbumArt src={track.album.images[0].url} alt={track.name} />
          ) : (
            <PlaceholderImage>
              <Music size={24} />
            </PlaceholderImage>
          )}
          <TrackInfo>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrackName>{track.name}</TrackName>
              <Button 
                onClick={handleToggleSave}
                aria-label={isSaved ? "Remove from Liked Songs" : "Save to Liked Songs"}
                title={isSaved ? "Remove from Liked Songs" : "Save to Liked Songs"}
                style={{ 
                  color: isSaved ? '#1db954' : undefined,
                  padding: 0,
                  width: 'auto',
                  height: 'auto',
                  marginTop: '2px'
                }}
              >
                <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
              </Button>
            </div>
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
              <path fill="currentColor" d="M6 19h2V5H6v14zM9.5 12L20 5v14l-10.5-7z" />
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
            <Shuffle size={18} />
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
              <Monitor size={18} />
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
                      {getDeviceIcon(device.type)}
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

      <ProgressSection>
        <TimeText>{formatTime(progressMs)}</TimeText>
        <ProgressContainer onClick={handleProgressClick}>
          <Progress width={progress} />
        </ProgressContainer>
        <TimeText>{formatTime(duration)}</TimeText>
      </ProgressSection>

      {localError && <ErrorMessage>{localError}</ErrorMessage>}
    </PlayerContainer>
  );
};

export default SpotifyPlayer;
