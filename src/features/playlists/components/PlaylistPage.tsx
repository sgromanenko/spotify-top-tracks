import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { 
  getPlaylist, 
  SpotifyPlaylist, 
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

const PlaylistImage = styled.img`
  width: 232px;
  height: 232px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  object-fit: cover;
`;

const PlaylistInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const PlaylistType = styled.span`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const PlaylistName = styled.h1`
  font-size: 4rem; // Large title
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin: 0;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  margin: 8px 0;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  strong {
    color: white;
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
  grid-template-columns: 40px 4fr 3fr 2fr 1fr;
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

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getPlaylist(id);
        setPlaylist(data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Skeleton width="232px" height="232px" />
          <PlaylistInfo>
            <Skeleton width="100px" height="20px" />
            <Skeleton width="300px" height="60px" />
            <Skeleton width="200px" height="20px" />
          </PlaylistInfo>
        </Header>
      </PageContainer>
    );
  }

  if (!playlist) return <div>Playlist not found</div>;

  return (
    <PageContainer>
      <Header>
        <PlaylistImage src={playlist.images[0]?.url} alt={playlist.name} />
        <PlaylistInfo>
          <PlaylistType>Playlist</PlaylistType>
          <PlaylistName>{playlist.name}</PlaylistName>
          <Description>{playlist.description}</Description>
          <MetaInfo>
            <strong>{playlist.owner.display_name}</strong>
            <span>•</span>
            <span>{playlist.tracks.total.toLocaleString()} songs</span>
          </MetaInfo>
          <ActionButtons>
            <PlayButton onClick={() => playTrack(playlist.uri)}>
              <Play size={28} fill="currentColor" />
            </PlayButton>
            <Heart size={32} color="#b3b3b3" style={{ cursor: 'pointer' }} />
            <MoreHorizontal size={32} color="#b3b3b3" style={{ cursor: 'pointer' }} />
          </ActionButtons>
        </PlaylistInfo>
      </Header>

      <TrackList>
        <div style={{ padding: '0 16px', marginBottom: '8px', display: 'grid', gridTemplateColumns: '40px 4fr 3fr 2fr 1fr', color: '#b3b3b3', fontSize: '12px', textTransform: 'uppercase' }}>
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Date Added</span>
          <Clock size={16} />
        </div>
        {playlist.tracks.items.map((item: any, index: number) => {
          const track = item.track;
          if (!track) return null;
          
          return (
            <TrackRow key={`${track.id}-${index}`} onClick={() => playTrack(track.uri)}>
              <span>{index + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={track.album.images[2]?.url} alt="" style={{ width: 40, height: 40 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'white', fontSize: '16px' }}>{track.name}</span>
                  <span style={{ color: '#b3b3b3' }}>{track.artists.map((a: any) => a.name).join(', ')}</span>
                </div>
              </div>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.album.name}</span>
              <span>{formatDate(item.added_at)}</span>
              <span>{formatDuration(track.duration_ms)}</span>
            </TrackRow>
          );
        })}
      </TrackList>
    </PageContainer>
  );
};

export default PlaylistPage;
