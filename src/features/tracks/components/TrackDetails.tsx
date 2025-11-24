import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { SpotifyTrack } from '../../../services/spotify';
import { getTrackLyrics } from '../../../services/lyrics';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background: rgba(16, 16, 24, 0.7);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
`;

const AlbumCover = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TrackName = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #fff;
`;

const ArtistName = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #1db954;
`;

const AlbumName = styled.p`
  font-size: 1rem;
  margin: 0 0 8px 0;
  color: #b3b3b3;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const ExplicitTag = styled.span`
  background: #b3b3b3;
  color: #121212;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 8px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
`;

const LyricsContainer = styled.div`
  white-space: pre-line;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: #e0e0e0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const LoadingText = styled.p`
  color: #b3b3b3;
  font-style: italic;
`;

const ErrorText = styled.p`
  color: #e74c3c;
`;

const SpotifyLink = styled.a`
  color: #1db954;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

interface TrackDetailsProps {
  track: SpotifyTrack;
}

// Helper to format milliseconds to MM:SS format
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Helper to convert popularity to stars (0-5)
const getPopularityStars = (popularity = 0): string => {
  const starCount = Math.round(popularity / 20);
  return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
};

const TrackDetails: React.FC<TrackDetailsProps> = ({ track }) => {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState<boolean>(true);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!track) return;

      setLyricsLoading(true);
      setLyricsError(null);

      try {
        const result = await getTrackLyrics(track.id, {
          title: track.name,
          artist: track.artists[0]?.name || '',
          isrc: track.external_ids?.isrc || '',
        });

        setLyrics(result);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLyricsError('Unable to load lyrics. Please try again later.');
      } finally {
        setLyricsLoading(false);
      }
    };

    fetchLyrics();
  }, [track]);

  if (!track) return null;

  const albumImage = track.album.images[0]?.url || '';
  const artistNames = track.artists.map(artist => artist.name).join(', ');

  return (
    <Container>
      <Header>
        <AlbumCover src={albumImage} alt={`${track.album.name} cover`} />
        <TrackInfo>
          <TrackName>{track.name}</TrackName>
          <ArtistName>{artistNames}</ArtistName>
          <AlbumName>{track.album.name}</AlbumName>

          <MetaInfo>
            {track.explicit && (
              <MetaItem>
                <ExplicitTag>E</ExplicitTag>
              </MetaItem>
            )}
            <MetaItem>{formatDuration(track.duration_ms)}</MetaItem>
            {track.popularity !== undefined && (
              <MetaItem>Popularity: {getPopularityStars(track.popularity)}</MetaItem>
            )}
          </MetaInfo>

          {track.external_urls?.spotify && (
            <SpotifyLink
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Spotify
            </SpotifyLink>
          )}
        </TrackInfo>
      </Header>

      <Section>
        <SectionTitle>Lyrics</SectionTitle>
        {lyricsLoading ? (
          <LoadingText>Loading lyrics...</LoadingText>
        ) : lyricsError ? (
          <ErrorText>{lyricsError}</ErrorText>
        ) : lyrics ? (
          <LyricsContainer>{lyrics}</LyricsContainer>
        ) : (
          <LoadingText>No lyrics found for this track.</LoadingText>
        )}
      </Section>
    </Container>
  );
};

export default TrackDetails;
