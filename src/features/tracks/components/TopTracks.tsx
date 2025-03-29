import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import { useSpotify } from '../../../context/SpotifyContext';
import { SpotifyTrack } from '../../../services/spotify';
import TrackItem from './TrackItem';

const Container = styled.div`
  width: 100%;
  padding: 1rem 0;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem 0;
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.2);
  color: ${({ theme }) => theme.colors.error.main};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 1rem;
  text-align: center;
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TracksContainer = styled.div`
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  /* Scrollbar styling */
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

  /* Adjust height for different screen sizes */
  @media (max-width: 576px) {
    max-height: calc(100vh - 300px);
  }

  @media (min-width: 768px) {
    max-height: calc(100vh - 380px);
  }

  @media (min-width: 992px) {
    max-height: calc(100vh - 400px);
  }
`;

const NoTracksMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem 0;
`;

interface TopTracksProps {
  onTrackSelect?: (track: SpotifyTrack) => void;
}

/**
 * Component to display and interact with the user's top tracks from Spotify
 */
const TopTracks: React.FC<TopTracksProps> = ({ onTrackSelect }) => {
  const {
    tracks,
    loading,
    error,
    trackLimit,
    timeRange,
    setTrackLimit,
    setTimeRange,
    refreshTracks,
    selectedTrack,
    setSelectedTrack,
  } = useSpotify();

  const handleTrackClick = useCallback(
    (track: SpotifyTrack) => {
      setSelectedTrack(track);
      if (onTrackSelect) {
        onTrackSelect(track);
      }
    },
    [onTrackSelect, setSelectedTrack],
  );

  // Generate options for select dropdowns
  const limitOptions = [
    { value: 10, label: 'Top 10' },
    { value: 20, label: 'Top 20' },
    { value: 30, label: 'Top 30' },
    { value: 50, label: 'Top 50' },
  ];

  const timeRangeOptions = [
    { value: 'short_term', label: 'Last Month' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  return (
    <Container>
      <Header>
        <Title>Your Top Tracks</Title>
        <Subtitle>
          Discover the tracks you&apos;ve had on repeat based on your listening history
        </Subtitle>
      </Header>

      <Controls>
        <Select
          options={limitOptions}
          value={trackLimit}
          onChange={e => setTrackLimit(Number(e.target.value))}
          label="Number of tracks"
          fullWidth
        />
        <Select
          options={timeRangeOptions}
          value={timeRange}
          onChange={e => setTimeRange(e.target.value as any)}
          label="Time range"
          fullWidth
        />
      </Controls>

      {error && (
        <>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={refreshTracks} variant="primary">
            Try Again
          </Button>
        </>
      )}

      {loading ? (
        <LoadingText>Loading your top tracks...</LoadingText>
      ) : tracks.length === 0 ? (
        <NoTracksMessage>No tracks found for the selected time range.</NoTracksMessage>
      ) : (
        <TracksContainer>
          {tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              isSelected={selectedTrack?.id === track.id}
              onClick={() => handleTrackClick(track)}
            />
          ))}
        </TracksContainer>
      )}
    </Container>
  );
};

export default TopTracks;
