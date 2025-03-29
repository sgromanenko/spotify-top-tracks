import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTopTracks, SpotifyTrack, TimeRange } from '../api/spotify';
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

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1rem;
  color: #b3b3b3;
  padding: 2rem 0;
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const RefreshButton = styled.button`
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 1.5rem auto 0;

  &:hover,
  &:focus {
    background-color: #1ed760;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    outline: none;
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #b3b3b3;
`;

const Select = styled.select`
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  position: relative;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: #1db954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
  }
`;

const TracksContainer = styled.div`
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;

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
  color: #b3b3b3;
  padding: 2rem 0;
`;

interface TopTracksProps {
  onTrackSelect?: (track: SpotifyTrack) => void;
}

const TopTracks: React.FC<TopTracksProps> = ({ onTrackSelect }) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trackLimit, setTrackLimit] = useState<number>(10);
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopTracks(trackLimit, timeRange);
      setTracks(data);

      // Select the first track by default if we have onTrackSelect
      if (data.length > 0 && onTrackSelect && !selectedTrackId) {
        setSelectedTrackId(data[0].id);
        onTrackSelect(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch your top tracks. The token might have expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [trackLimit, timeRange, onTrackSelect, selectedTrackId]);

  useEffect(() => {
    fetchTracks();
  }, [trackLimit, timeRange, fetchTracks]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTrackLimit(Number(event.target.value));
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(event.target.value as TimeRange);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'short_term':
        return 'last 4 weeks';
      case 'medium_term':
        return 'last 6 months';
      case 'long_term':
        return 'all time';
      default:
        return 'listening history';
    }
  };

  const handleTrackClick = (track: SpotifyTrack) => {
    setSelectedTrackId(track.id);
    if (onTrackSelect) {
      onTrackSelect(track);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Your Top Spotify Tracks</Title>
        <Subtitle>Based on your {getTimeRangeLabel()}</Subtitle>
      </Header>

      <Controls>
        <SelectContainer>
          <SelectLabel htmlFor="track-limit">Number of Tracks</SelectLabel>
          <Select id="track-limit" value={trackLimit} onChange={handleLimitChange}>
            <option value={5}>5 tracks</option>
            <option value={10}>10 tracks</option>
            <option value={20}>20 tracks</option>
            <option value={50}>50 tracks</option>
          </Select>
        </SelectContainer>

        <SelectContainer>
          <SelectLabel htmlFor="time-range">Time Period</SelectLabel>
          <Select id="time-range" value={timeRange} onChange={handleTimeRangeChange}>
            <option value="short_term">Last 4 Weeks</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="long_term">All Time</option>
          </Select>
        </SelectContainer>
      </Controls>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingText>Loading your top tracks...</LoadingText>
      ) : (
        <>
          {tracks.length === 0 ? (
            <NoTracksMessage>No tracks found for this time period</NoTracksMessage>
          ) : (
            <TracksContainer>
              {tracks.map((track, index) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  isSelected={track.id === selectedTrackId}
                  onClick={() => handleTrackClick(track)}
                />
              ))}
            </TracksContainer>
          )}

          <RefreshButton onClick={fetchTracks}>Refresh Tracks</RefreshButton>
        </>
      )}
    </Container>
  );
};

export default TopTracks;
