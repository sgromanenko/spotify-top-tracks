import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { SpotifyTrack } from '../api/spotify';

interface TrackItemProps {
  track: SpotifyTrack;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

interface TrackContainerProps {
  isSelected?: boolean;
}

interface PreviewUnavailableProps {
  hasPreview: boolean;
}

const TrackContainer = styled.div<TrackContainerProps>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: ${props =>
    props.isSelected ? 'rgba(29, 185, 84, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: ${props =>
      props.isSelected ? 'rgba(29, 185, 84, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 576px) {
    grid-template-columns: auto auto 1fr auto;
    padding: 1rem;
  }
`;

const TrackNumber = styled.div`
  font-size: 1rem;
  font-weight: bold;
  min-width: 2rem;
  display: none;

  @media (min-width: 576px) {
    display: block;
  }
`;

const TrackImage = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 0.25rem;
  margin-right: 0.75rem;
  object-fit: cover;

  @media (min-width: 576px) {
    width: 3.5rem;
    height: 3.5rem;
    margin-right: 1rem;
  }
`;

const TrackInfo = styled.div`
  flex: 1;
  overflow: hidden;
  min-width: 0;
`;

const TrackName = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 576px) {
    font-size: 1rem;
  }
`;

const ArtistName = styled.p`
  margin: 0;
  color: #b3b3b3;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AlbumName = styled.p`
  margin: 0.25rem 0 0 0;
  color: #b3b3b3;
  font-size: 0.75rem;
  display: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 768px) {
    display: block;
  }
`;

const AudioControl = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 0.5rem;
`;

const PlayButton = styled.button`
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  position: relative;

  &:hover,
  &:focus {
    background-color: #1ed760;
    transform: scale(1.05);
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(1);
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }

  @media (min-width: 576px) {
    width: 3rem;
    height: 3rem;
  }
`;

const AudioStatus = styled.div<{ isPlaying: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => (props.isPlaying ? '#1ed760' : 'transparent')};
  border: 2px solid ${props => (props.isPlaying ? '#1ed760' : 'transparent')};
  display: ${props => (props.isPlaying ? 'block' : 'none')};

  @media (min-width: 576px) {
    width: 12px;
    height: 12px;
    top: -6px;
    right: -6px;
  }
`;

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3L12 8L4 13V3Z" fill="white" />
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="3" width="3" height="10" fill="white" />
    <rect x="9" y="3" width="3" height="10" fill="white" />
  </svg>
);

const PreviewUnavailable = styled.div<PreviewUnavailableProps>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 1rem;
  color: #b3b3b3;
  display: none;

  @media (min-width: 768px) {
    ${props =>
      !props.hasPreview &&
      `
      display: block;
    `}
  }
`;

const TrackItem: React.FC<TrackItemProps> = ({ track, index, isSelected = false, onClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const albumImage =
    track.album.images.length > 0 ? track.album.images[0].url : 'https://via.placeholder.com/60';

  const artistNames = track.artists.map(artist => artist.name).join(', ');
  const hasPreview = !!track.preview_url;

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const togglePlay = (e: React.MouseEvent) => {
    if (!track.preview_url) return;

    e.stopPropagation();
    e.preventDefault();

    if (!audio) {
      const newAudio = new Audio(track.preview_url);

      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.addEventListener('error', err => {
        console.error('Audio playback error:', err);
        setIsPlaying(false);
      });

      setAudio(newAudio);

      newAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
        });
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Failed to play audio:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleContainerClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <TrackContainer isSelected={isSelected} onClick={handleContainerClick}>
      <TrackNumber>{index + 1}</TrackNumber>
      <TrackImage src={albumImage} alt={track.album.name} />
      <TrackInfo>
        <TrackName title={track.name}>{track.name}</TrackName>
        <ArtistName title={artistNames}>{artistNames}</ArtistName>
        <AlbumName title={track.album.name}>{track.album.name}</AlbumName>
      </TrackInfo>
      <AudioControl>
        <PlayButton
          onClick={togglePlay}
          disabled={!track.preview_url}
          title={track.preview_url ? 'Play preview' : 'No preview available'}
          type="button"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </PlayButton>
        <AudioStatus isPlaying={isPlaying} />
      </AudioControl>
      <PreviewUnavailable hasPreview={hasPreview}>No preview</PreviewUnavailable>
    </TrackContainer>
  );
};

export default TrackItem;
