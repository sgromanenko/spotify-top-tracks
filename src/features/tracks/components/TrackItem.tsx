import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { SpotifyTrack } from '../../../services/spotify';

interface TrackItemProps {
  track: SpotifyTrack;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

interface TrackContainerProps {
  isSelected: boolean;
}

const TrackContainer = styled.div<TrackContainerProps>`
  display: grid;
  grid-template-columns: auto minmax(45px, 10%) 1fr auto;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.background.elevated : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 0.25rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: auto minmax(45px, 15%) 1fr auto;
    padding: 0.5rem;
  }
`;

const TrackNumber = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: 1rem;
  width: 1.5rem;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-right: 0.5rem;
    font-size: 0.75rem;
  }
`;

const TrackImage = styled.img`
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-right: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 40px;
    height: 40px;
    margin-right: 0.5rem;
  }
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TrackName = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.8rem;
  }
`;

const ArtistName = styled.p`
  font-size: 0.8rem;
  margin: 0.1rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.7rem;
  }
`;

const AlbumName = styled.p`
  font-size: 0.75rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.7;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.65rem;
  }
`;

const AudioControl = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 1rem;
`;

interface PlayButtonProps {
  isPlaying?: boolean;
  disabled?: boolean;
}

const PlayButton = styled.button<PlayButtonProps>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  background-color: ${({ theme, isPlaying }) =>
    isPlaying ? theme.colors.primary.main : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: ${({ theme, isPlaying }) =>
      isPlaying ? theme.colors.primary.dark : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* Accessibility enhancements */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 30px;
    height: 30px;
  }
`;

interface AudioStatusProps {
  isPlaying: boolean;
}

const AudioStatus = styled.div<AudioStatusProps>`
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  overflow: hidden;
  opacity: ${({ isPlaying }) => (isPlaying ? 1 : 0)};
  transition: opacity 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ isPlaying }) => (isPlaying ? '100%' : '0')};
    background-color: ${({ theme }) => theme.colors.primary.main};
    animation: ${({ isPlaying }) => (isPlaying ? 'progressAnimation 30s linear' : 'none')};

    @keyframes progressAnimation {
      0% {
        width: 0;
      }
      100% {
        width: 100%;
      }
    }
  }
`;

interface PreviewUnavailableProps {
  hasPreview: boolean;
}

const PreviewUnavailable = styled.div<PreviewUnavailableProps>`
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.error.light};
  opacity: ${({ hasPreview }) => (hasPreview ? 0 : 0.7)};
`;

// SVG icons
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z" />
  </svg>
);

/**
 * Component to display a single track with playback controls
 */
const TrackItem: React.FC<TrackItemProps> = ({ track, index, isSelected = false, onClick }) => {
  const progressIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_progress, setProgress] = useState(0);
  const hasPreview = Boolean(track.preview_url);
  const artistNames = track.artists.map(artist => artist.name).join(', ');
  const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/45';

  const handlePlaybackEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.addEventListener('ended', handlePlaybackEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handlePlaybackEnded);
      }
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [track.preview_url, hasPreview, handlePlaybackEnded]);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering track selection

      if (!hasPreview || !audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      } else {
        // Stop any other playing audio first
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(audio => audio.pause());

        // Play this track
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });

        // Update progress
        progressIntervalRef.current = window.setInterval(() => {
          if (audioRef.current) {
            const currentProgress =
              (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(currentProgress);
          }
        }, 1000);
      }

      setIsPlaying(!isPlaying);
    },
    [isPlaying, hasPreview],
  );

  const handleContainerClick = () => {
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <TrackContainer
      isSelected={isSelected}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${track.name} by ${artistNames}`}
    >
      <TrackNumber aria-hidden="true">{index + 1}</TrackNumber>
      <TrackImage src={albumImage} alt={`Album cover for ${track.album.name}`} />
      <TrackInfo>
        <TrackName title={track.name}>{track.name}</TrackName>
        <ArtistName title={artistNames}>{artistNames}</ArtistName>
        <AlbumName title={track.album.name}>{track.album.name}</AlbumName>
      </TrackInfo>
      <AudioControl>
        <PlayButton
          onClick={togglePlay}
          disabled={!hasPreview}
          isPlaying={isPlaying}
          aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          type="button"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </PlayButton>
        <AudioStatus isPlaying={isPlaying} aria-hidden="true" />
      </AudioControl>
      {!hasPreview && <span className="sr-only">No audio preview available</span>}
      <PreviewUnavailable hasPreview={hasPreview} aria-hidden="true">
        No preview
      </PreviewUnavailable>
    </TrackContainer>
  );
};

export default React.memo(TrackItem);
