import React from 'react';
import styled from 'styled-components';

import { SpotifyTrack } from '../../../services/spotify';

interface AudioFeaturesProps {
  track: SpotifyTrack | null;
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin: 0;
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const AlbumCover = styled.img`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  object-fit: cover;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const TrackName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.p`
  font-size: 0.85rem;
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AlbumName = styled.p`
  font-size: 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MessageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const NoTrackContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Component to display track information (audio features functionality has been removed)
 */
const AudioFeatures: React.FC<AudioFeaturesProps> = ({ track }) => {
  if (!track) {
    return (
      <Container>
        <NoTrackContainer>
          <p>Select a track to view details</p>
        </NoTrackContainer>
      </Container>
    );
  }

  const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/80';
  const artistNames = track.artists.map(artist => artist.name).join(', ');

  return (
    <Container>
      <Header>
        <Title>Track Details</Title>
        <Subtitle>Information about the selected track</Subtitle>
      </Header>

      <TrackInfo>
        <AlbumCover src={albumImage} alt={`Album cover for ${track.album.name}`} />
        <TrackDetails>
          <TrackName title={track.name}>{track.name}</TrackName>
          <ArtistName title={artistNames}>{artistNames}</ArtistName>
          <AlbumName title={track.album.name}>{track.album.name}</AlbumName>
        </TrackDetails>
      </TrackInfo>

      <MessageContainer>
        <p>
          <strong>Audio Features functionality has been removed</strong>
        </p>
        <p>
          The Spotify Audio Features API has been deprecated, so this feature has been removed from
          the application.
        </p>
        <p>Try playing the track preview instead to experience the music directly!</p>
      </MessageContainer>
    </Container>
  );
};

export default React.memo(AudioFeatures);
