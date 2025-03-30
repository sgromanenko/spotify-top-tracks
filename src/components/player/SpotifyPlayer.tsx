import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePlayer } from '../../context/PlayerContext';

const PlayerContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const PlayerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const AlbumArt = styled.img`
  width: 56px;
  height: 56px;
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

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  margin-top: 0.25rem;
`;

// Format time in MM:SS
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SpotifyPlayer: React.FC = () => {
  const { playerState, isReady, isPlaying, error, togglePlay, previousTrack, nextTrack } =
    usePlayer();
  const [progress, setProgress] = useState<number>(0);
  const [progressMs, setProgressMs] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

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
    }
  }, [playerState]);

  if (!isReady || !playerState) {
    return (
      <PlayerContainer>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          {error ? <ErrorMessage>{error}</ErrorMessage> : <p>Initializing Spotify Player...</p>}
        </div>
      </PlayerContainer>
    );
  }

  const track = playerState.track_window.current_track;
  const albumImage = track.album.images[0]?.url || '';
  const artistNames = track.artists.map(artist => artist.name).join(', ');

  return (
    <PlayerContainer>
      <NowPlaying>
        <AlbumArt src={albumImage} alt={`Album cover for ${track.album.name}`} />
        <TrackInfo>
          <TrackName>{track.name}</TrackName>
          <ArtistName>{artistNames}</ArtistName>
        </TrackInfo>
      </NowPlaying>

      <PlayerControls>
        <Button onClick={previousTrack}>⏮</Button>
        <Button onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</Button>
        <Button onClick={nextTrack}>⏭</Button>
      </PlayerControls>

      <ProgressContainer>
        <Progress width={progress} />
      </ProgressContainer>

      <PlayerStatus>
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(duration)}</span>
      </PlayerStatus>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </PlayerContainer>
  );
};

export default SpotifyPlayer;
