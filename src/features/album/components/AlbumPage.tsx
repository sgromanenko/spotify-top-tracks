import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { 
  getAlbum, 
  SpotifyAlbum, 
  SpotifyTrack 
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

const AlbumImage = styled.img`
  width: 232px;
  height: 232px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  object-fit: cover;
`;

const AlbumInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const AlbumType = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const AlbumName = styled.h1`
  font-size: 4rem; // Large title
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin: 0;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  a {
    color: white;
    font-weight: bold;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
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

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackRow = styled.div`
  display: grid;
  grid-template-columns: 40px 4fr 1fr;
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

const Copyright = styled.div`
  margin-top: ${({ theme }) => theme.space.xl};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playTrack } = usePlayer();
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getAlbum(id);
        setAlbum(data);
      } catch (error) {
        console.error('Error fetching album:', error);
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
          <Skeleton width="232px" height="232px" />
          <AlbumInfo>
            <Skeleton width="100px" height="20px" />
            <Skeleton width="300px" height="60px" />
            <Skeleton width="200px" height="20px" />
          </AlbumInfo>
        </Header>
      </PageContainer>
    );
  }

  if (!album) return <div>Album not found</div>;

  return (
    <PageContainer>
      <Header>
        <AlbumImage src={album.images[0]?.url} alt={album.name} />
        <AlbumInfo>
          <AlbumType>{album.album_type}</AlbumType>
          <AlbumName>{album.name}</AlbumName>
          <MetaInfo>
            {album.artists.map((artist, i) => (
              <React.Fragment key={artist.id}>
                <Link to={`/artist/${artist.id}`}>{artist.name}</Link>
                {i < album.artists.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
            <span>•</span>
            <span>{album.release_date.split('-')[0]}</span>
            <span>•</span>
            <span>{album.total_tracks} songs</span>
          </MetaInfo>
          <ActionButtons>
            <PlayButton onClick={() => playTrack(album.uri)}>
              <Play size={28} fill="currentColor" />
            </PlayButton>
            <Heart size={32} color="#b3b3b3" style={{ cursor: 'pointer' }} />
            <MoreHorizontal size={32} color="#b3b3b3" style={{ cursor: 'pointer' }} />
          </ActionButtons>
        </AlbumInfo>
      </Header>

      <TrackList>
        <div style={{ padding: '0 16px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '40px 4fr 1fr', color: '#b3b3b3', fontSize: '12px', textTransform: 'uppercase' }}>
          <span>#</span>
          <span>Title</span>
          <Clock size={16} />
        </div>
        {album.tracks?.items.map((track: any, index: number) => (
          <TrackRow key={track.id} onClick={() => playTrack(track.uri)}>
            <span>{index + 1}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: '16px' }}>{track.name}</span>
              <span style={{ color: '#b3b3b3' }}>{track.artists.map((a: any) => a.name).join(', ')}</span>
            </div>
            <span>{formatDuration(track.duration_ms)}</span>
          </TrackRow>
        ))}
      </TrackList>

      <Copyright>
        {album.copyrights?.map((c: any, i: number) => (
          <div key={i}>{c.text}</div>
        ))}
      </Copyright>
    </PageContainer>
  );
};

export default AlbumPage;
