import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAudioFeatures, SpotifyTrack } from '../api/spotify';

interface AudioFeaturesProps {
  track: SpotifyTrack | null;
}

interface AudioFeature {
  name: string;
  value: number;
  description: string;
  color: string;
}

const Container = styled.div`
  width: 100%;
  padding: 1.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;

  @media (min-width: 992px) {
    position: sticky;
    top: 1rem;
  }
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.25rem;
  text-align: center;
  color: #ffffff;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (min-width: 576px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeatureName = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: #b3b3b3;
  text-transform: capitalize;
`;

interface FeatureBarProps {
  value: number;
  color: string;
}

const FeatureBar = styled.div<FeatureBarProps>`
  width: 100%;
  height: 0.375rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.value * 100}%;
    background-color: ${props => props.color};
    border-radius: 0.5rem;
  }
`;

const FeatureValue = styled.div`
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: bold;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #b3b3b3;
  font-size: 0.9rem;
  padding: 1.5rem 0;
`;

const NoTrackText = styled.p`
  text-align: center;
  color: #b3b3b3;
  font-size: 0.9rem;
  padding: 1.5rem 0;
`;

const TrackInfoCard = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
`;

const SmallAlbumArt = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 0.25rem;
  margin-right: 0.75rem;
`;

const TrackDetails = styled.div`
  flex: 1;
  overflow: hidden;
`;

const CardTrackName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardArtistName = styled.p`
  margin: 0;
  color: #b3b3b3;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AudioFeatures: React.FC<AudioFeaturesProps> = ({ track }) => {
  const [features, setFeatures] = useState<AudioFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioFeatures = async () => {
      if (!track) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getAudioFeatures(track.id);

        if (data && !data.error) {
          const relevantFeatures: AudioFeature[] = [
            {
              name: 'danceability',
              value: data.danceability || 0,
              description: 'How suitable the track is for dancing',
              color: '#1DB954',
            },
            {
              name: 'energy',
              value: data.energy || 0,
              description: 'Intensity and activity level',
              color: '#FF5722',
            },
            {
              name: 'acousticness',
              value: data.acousticness || 0,
              description: 'Confidence of being acoustic',
              color: '#2196F3',
            },
            {
              name: 'valence',
              value: data.valence || 0,
              description: 'Musical positiveness (happy, cheerful)',
              color: '#FFEB3B',
            },
            {
              name: 'instrumentalness',
              value: data.instrumentalness || 0,
              description: 'Whether a track contains no vocals',
              color: '#9C27B0',
            },
            {
              name: 'liveness',
              value: data.liveness || 0,
              description: 'Presence of audience in the recording',
              color: '#4CAF50',
            },
          ];
          setFeatures(relevantFeatures);
        } else {
          setError('Failed to fetch audio features: ' + (data.error?.message || 'Unknown error'));
        }
      } catch (err) {
        setError('Failed to fetch audio features');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFeatures();
  }, [track]);

  if (!track) {
    return (
      <Container>
        <NoTrackText>Select a track to see audio features</NoTrackText>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Title>Audio Features</Title>
        <LoadingText>Loading audio features...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Audio Features</Title>
        <LoadingText>{error}</LoadingText>
      </Container>
    );
  }

  const albumImage =
    track.album.images.length > 0
      ? track.album.images[track.album.images.length > 2 ? 2 : 0].url
      : 'https://via.placeholder.com/60';

  const artistNames = track.artists.map(artist => artist.name).join(', ');

  return (
    <Container>
      <Title>Audio Features</Title>

      <TrackInfoCard>
        <SmallAlbumArt src={albumImage} alt={track.album.name} />
        <TrackDetails>
          <CardTrackName title={track.name}>{track.name}</CardTrackName>
          <CardArtistName title={artistNames}>{artistNames}</CardArtistName>
        </TrackDetails>
      </TrackInfoCard>

      <FeaturesGrid>
        {features.map(feature => (
          <FeatureItem key={feature.name}>
            <FeatureName title={feature.description}>{feature.name}</FeatureName>
            <FeatureBar value={feature.value} color={feature.color} />
            <FeatureValue>{Math.round((feature.value || 0) * 100)}%</FeatureValue>
          </FeatureItem>
        ))}
      </FeaturesGrid>
    </Container>
  );
};

export default AudioFeatures;
