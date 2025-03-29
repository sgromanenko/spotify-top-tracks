import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getUserPlaylists, SpotifyPlaylist } from '../api/spotify';

const Container = styled.div`
  width: 100%;
  padding: 1rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;

  @media (min-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
`;

const PlaylistCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PlaylistImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const PlaylistInfo = styled.div`
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (min-width: 576px) {
    padding: 1rem;
  }
`;

const PlaylistName = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: white;

  @media (min-width: 576px) {
    font-size: 1rem;
  }
`;

const PlaylistTracks = styled.p`
  font-size: 0.75rem;
  color: #b3b3b3;
  margin: 0;
  margin-top: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #1db954;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: white;
`;

const EmptyStateText = styled.p`
  font-size: 0.9rem;
  color: #b3b3b3;
  margin: 0;
`;

const PlaylistsSection: React.FC = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserPlaylists();
        setPlaylists(data);
      } catch (error) {
        setError('Failed to fetch playlists');
        console.error('Failed to fetch playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) {
    return (
      <Container>
        <SectionTitle>Your Playlists</SectionTitle>
        <LoadingContainer>
          <div>
            <LoadingSpinner />
            <LoadingText>Loading your playlists...</LoadingText>
          </div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <SectionTitle>Your Playlists</SectionTitle>
        <EmptyStateContainer>
          <EmptyStateTitle>Error Loading Playlists</EmptyStateTitle>
          <EmptyStateText>{error}</EmptyStateText>
        </EmptyStateContainer>
      </Container>
    );
  }

  if (playlists.length === 0) {
    return (
      <Container>
        <SectionTitle>Your Playlists</SectionTitle>
        <EmptyStateContainer>
          <EmptyStateTitle>No Playlists Found</EmptyStateTitle>
          <EmptyStateText>
            You don&apos;t have any playlists yet or we couldn&apos;t access them.
          </EmptyStateText>
        </EmptyStateContainer>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>Your Playlists</SectionTitle>
      <PlaylistsGrid>
        {playlists.map(playlist => (
          <PlaylistCard key={playlist.id}>
            <PlaylistImage
              src={playlist.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image'}
              alt={playlist.name}
            />
            <PlaylistInfo>
              <PlaylistName title={playlist.name}>{playlist.name}</PlaylistName>
              <PlaylistTracks>{playlist.tracks.total} tracks</PlaylistTracks>
            </PlaylistInfo>
          </PlaylistCard>
        ))}
      </PlaylistsGrid>
    </Container>
  );
};

export default PlaylistsSection;
