import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import { getAudioFeatures, SpotifyTrack } from '../../../services/spotify';

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

const FeaturesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
`;

const FeatureLabel = styled.label`
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;

  span.value {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

interface ProgressBarProps {
  value: number;
  color?: string;
}

const ProgressBar = styled.div<ProgressBarProps>`
  height: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => `${props.value}%`};
    background-color: ${props => props.color || '#1DB954'};
    border-radius: ${({ theme }) => theme.borderRadius.pill};
    transition: width 0.5s ease;
  }
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error.main};
  text-align: center;
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
 * Returns a color based on the value (0-1)
 */
const getColorForValue = (value: number): string => {
  if (value < 0.33) return '#F45B69'; // Red
  if (value < 0.66) return '#F9C74F'; // Yellow
  return '#90BE6D'; // Green
};

/**
 * Get a human-friendly description for a feature value
 */
const getDescription = (feature: string, value: number): string => {
  if (value < 0.33) {
    switch (feature) {
      case 'danceability':
        return 'Less danceable';
      case 'energy':
        return 'Calm';
      case 'valence':
        return 'More sad/negative';
      case 'acousticness':
        return 'Less acoustic';
      case 'instrumentalness':
        return 'Vocal-focused';
      case 'liveness':
        return 'Studio recording';
      case 'speechiness':
        return 'More musical';
      default:
        return 'Low';
    }
  } else if (value < 0.66) {
    switch (feature) {
      case 'danceability':
        return 'Moderately danceable';
      case 'energy':
        return 'Moderate energy';
      case 'valence':
        return 'Neutral mood';
      case 'acousticness':
        return 'Mixed acoustic/electronic';
      case 'instrumentalness':
        return 'Mix of vocals and instruments';
      case 'liveness':
        return 'Some audience presence';
      case 'speechiness':
        return 'Balanced speech/music';
      default:
        return 'Medium';
    }
  } else {
    switch (feature) {
      case 'danceability':
        return 'Very danceable';
      case 'energy':
        return 'High energy';
      case 'valence':
        return 'More happy/positive';
      case 'acousticness':
        return 'Very acoustic';
      case 'instrumentalness':
        return 'Instrumental';
      case 'liveness':
        return 'Live performance';
      case 'speechiness':
        return 'Speech-focused';
      default:
        return 'High';
    }
  }
};

interface AudioFeature {
  name: string;
  value: number;
  description?: string;
}

/**
 * Component to display the audio features of a Spotify track
 */
const AudioFeatures: React.FC<AudioFeaturesProps> = ({ track }) => {
  const [features, setFeatures] = useState<AudioFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioFeatures = useCallback(async (trackId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAudioFeatures(trackId);

      if (data) {
        // Map features and format them
        const relevantFeatures: AudioFeature[] = [
          { name: 'Danceability', value: data.danceability },
          { name: 'Energy', value: data.energy },
          { name: 'Valence (Positivity)', value: data.valence },
          { name: 'Acousticness', value: data.acousticness },
          { name: 'Instrumentalness', value: data.instrumentalness },
          { name: 'Liveness', value: data.liveness },
          { name: 'Speechiness', value: data.speechiness }
        ];

        // Add human-friendly descriptions
        const featuresWithDescriptions = relevantFeatures.map(feature => ({
          ...feature,
          description: getDescription(feature.name.toLowerCase(), feature.value)
        }));

        setFeatures(featuresWithDescriptions);
      }
    } catch (err) {
      setError('Failed to load audio features for this track');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (track?.id) {
      fetchAudioFeatures(track.id);
    } else {
      setFeatures([]);
    }
  }, [track, fetchAudioFeatures]);

  const retryFetch = () => {
    if (track?.id) {
      fetchAudioFeatures(track.id);
    }
  };

  if (!track) {
    return (
      <Container>
        <NoTrackContainer>
          <p>Select a track to view its audio features</p>
        </NoTrackContainer>
      </Container>
    );
  }

  const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/80';
  const artistNames = track.artists.map(artist => artist.name).join(', ');

  return (
    <Container>
      <Header>
        <Title>Audio Features</Title>
        <Subtitle>Explore the musical characteristics of this track</Subtitle>
      </Header>

      <TrackInfo>
        <AlbumCover src={albumImage} alt={`Album cover for ${track.album.name}`} />
        <TrackDetails>
          <TrackName title={track.name}>{track.name}</TrackName>
          <ArtistName title={artistNames}>{artistNames}</ArtistName>
          <AlbumName title={track.album.name}>{track.album.name}</AlbumName>
        </TrackDetails>
      </TrackInfo>

      {loading ? (
        <LoadingContainer>Loading audio features...</LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={retryFetch} variant="secondary" size="small">
            Retry
          </Button>
        </ErrorContainer>
      ) : (
        <FeaturesContainer>
          {features.map(feature => (
            <FeatureItem key={feature.name}>
              <FeatureLabel>
                {feature.name}
                <span className="value">{Math.round(feature.value * 100)}%</span>
              </FeatureLabel>
              <ProgressBar value={feature.value * 100} color={getColorForValue(feature.value)} />
              <small>{feature.description}</small>
            </FeatureItem>
          ))}
        </FeaturesContainer>
      )}
    </Container>
  );
};

export default React.memo(AudioFeatures);
