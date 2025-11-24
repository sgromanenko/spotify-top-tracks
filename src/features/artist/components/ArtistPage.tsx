import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { 
  getArtist, 
  getArtistTopTracks, 
  getArtistAlbums, 
  getArtistRelatedArtists,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAlbum
} from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';
import Skeleton from '../../../components/ui/Skeleton';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.space.xl};
  padding: ${({ theme }) => theme.space.xl} 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ArtistImage = styled.img`
  width: 232px;
  height: 232px;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.large};
  object-fit: cover;
`;

const ArtistInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const ArtistType = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const ArtistName = styled.h1`
  font-size: 4rem; // Large title
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin: 0;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Stats = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.lg};
  margin-top: ${({ theme }) => theme.space.md};
`;

const PlayButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: black;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    background-color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const FollowButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.text.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackRow = styled.div`
  display: grid;
  grid-template-columns: 40px 4fr 3fr 1fr;
  align-items: center;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.space.lg};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.paper};
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.space.sm};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 4px 0 0;
`;

const ArtistPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playTrack } = usePlayer();
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [artistData, tracksData, albumsData, relatedData] = await Promise.all([
          getArtist(id),
          getArtistTopTracks(id),
          getArtistAlbums(id),
          getArtistRelatedArtists(id)
        ]);
        
        setArtist(artistData);
        setTopTracks(tracksData);
        setAlbums(albumsData);
        setRelatedArtists(relatedData);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Skeleton width="232px" height="232px" borderRadius="50%" />
          <ArtistInfo>
            <Skeleton width="100px" height="20px" />
            <Skeleton width="300px" height="60px" />
            <Skeleton width="200px" height="20px" />
          </ArtistInfo>
        </Header>
      </PageContainer>
    );
  }

  if (!artist) return <div>Artist not found</div>;

  return (
    <PageContainer>
      <Header>
        <ArtistImage src={artist.images[0]?.url} alt={artist.name} />
        <ArtistInfo>
          <ArtistType>Artist</ArtistType>
          <ArtistName>{artist.name}</ArtistName>
          <Stats>{artist.followers.total.toLocaleString()} followers</Stats>
          <ActionButtons>
            <PlayButton onClick={() => topTracks.length > 0 && playTrack(topTracks[0].uri)}>
              <Play size={28} fill="currentColor" />
            </PlayButton>
            <FollowButton>Follow</FollowButton>
            <MoreHorizontal size={32} color="#b3b3b3" />
          </ActionButtons>
        </ArtistInfo>
      </Header>

      <Section>
        <SectionTitle>Popular</SectionTitle>
        <TrackList>
          {topTracks.slice(0, 5).map((track, index) => (
            <TrackRow key={track.id} onClick={() => playTrack(track.uri)}>
              <span>{index + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={track.album.images[2]?.url} alt="" style={{ width: 40, height: 40 }} />
                <span style={{ color: 'white' }}>{track.name}</span>
              </div>
              <span>{track.popularity ? `${track.popularity.toLocaleString()}` : '-'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Heart size={16} />
                <span>{formatDuration(track.duration_ms)}</span>
              </div>
            </TrackRow>
          ))}
        </TrackList>
      </Section>

      <Section>
        <SectionTitle>Discography</SectionTitle>
        <Grid>
          {albums.map(album => (
            <Card key={album.id}>
              <CardImage src={album.images[0]?.url} alt={album.name} />
              <CardTitle>{album.name}</CardTitle>
              <CardSubtitle>{album.release_date.split('-')[0]} • {album.album_type}</CardSubtitle>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Fans also like</SectionTitle>
        <Grid>
          {relatedArtists.slice(0, 6).map(related => (
            <Card key={related.id}>
              <CardImage src={related.images[0]?.url} alt={related.name} style={{ borderRadius: '50%' }} />
              <CardTitle>{related.name}</CardTitle>
              <CardSubtitle>Artist</CardSubtitle>
            </Card>
          ))}
        </Grid>
      </Section>
    </PageContainer>
  );
};

export default ArtistPage;
