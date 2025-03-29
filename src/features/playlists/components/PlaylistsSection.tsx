import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import { getUserPlaylists, SpotifyPlaylist } from '../../../services/spotify';

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

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const PlaylistCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.small};
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    background-color: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const PlaylistCover = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const PlaylistInfo = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PlaylistName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlaylistDescription = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const PlaylistStats = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const NoPlaylistsMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem 0;
`;

/**
 * Component to display user's playlists from Spotify
 */
const PlaylistsSection: React.FC = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      setError('Failed to fetch your playlists. The token might have expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const getPlaylistCover = (playlist: SpotifyPlaylist) => {
    return playlist.images[0]?.url || 'https://via.placeholder.com/300?text=No+Image';
  };

  const sanitizeDescription = (description: string) => {
    // Remove HTML tags from description if present
    return description?.replace(/<[^>]*>?/gm, '') || 'No description';
  };

  return (
    <Container>
      <Header>
        <Title>Your Spotify Playlists</Title>
        <Subtitle>Browse through your collection of saved playlists</Subtitle>
      </Header>

      {error && (
        <>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={fetchPlaylists} variant="primary">
            Try Again
          </Button>
        </>
      )}

      {loading ? (
        <LoadingText>Loading your playlists...</LoadingText>
      ) : playlists.length === 0 ? (
        <NoPlaylistsMessage>You don&apos;t have any playlists yet</NoPlaylistsMessage>
      ) : (
        <PlaylistsGrid>
          {playlists.map(playlist => (
            <PlaylistCard key={playlist.id}>
              <PlaylistCover
                src={getPlaylistCover(playlist)}
                alt={`Cover for playlist ${playlist.name}`}
              />
              <PlaylistInfo>
                <PlaylistName title={playlist.name}>{playlist.name}</PlaylistName>
                <PlaylistDescription title={sanitizeDescription(playlist.description)}>
                  {sanitizeDescription(playlist.description)}
                </PlaylistDescription>
                <PlaylistStats>{playlist.tracks.total} tracks</PlaylistStats>
              </PlaylistInfo>
            </PlaylistCard>
          ))}
        </PlaylistsGrid>
      )}
    </Container>
  );
};

export default React.memo(PlaylistsSection);
