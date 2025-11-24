import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Play } from 'lucide-react';
import { getRecentlyPlayed, getNewReleases, getUserPlaylists, SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';
import Skeleton from '../../../components/ui/Skeleton';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
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
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.paper};
    transform: translateY(-4px);
    
    .play-button {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  cursor: pointer;

  &:hover {
    transform: scale(1.05) !important;
    background-color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Home = () => {
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [recent, releases, playlists] = await Promise.all([
          getRecentlyPlayed(6),
          getNewReleases(6),
          getUserPlaylists(6)
        ]);
        setRecentTracks(recent);
        setNewReleases(releases);
        setFeaturedPlaylists(playlists);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlay = (e: React.MouseEvent, trackUri: string) => {
    e.stopPropagation();
    playTrack(trackUri);
  };

  const renderSkeletons = () => (
    <Grid>
      {[...Array(6)].map((_, i) => (
        <Card key={i} style={{ cursor: 'default' }}>
          <CardImage>
            <Skeleton height="100%" borderRadius="0" />
          </CardImage>
          <div style={{ marginTop: '12px' }}>
            <Skeleton width="70%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="40%" height="14px" />
          </div>
        </Card>
      ))}
    </Grid>
  );

  return (
    <HomeContainer>
      <Section>
        <SectionTitle>Recently Played</SectionTitle>
        {isLoading ? renderSkeletons() : (
          <Grid>
            {recentTracks.map((track) => (
              <Card key={track.id} onClick={() => playTrack(`spotify:track:${track.id}`)}>
              <CardImage>
                <img src={track.album.images[0]?.url} alt={track.name} />
                <PlayButton className="play-button" onClick={(e) => handlePlay(e, `spotify:track:${track.id}`)}>
                  <Play size={24} fill="currentColor" />
                </PlayButton>
              </CardImage>
              <CardTitle>{track.name}</CardTitle>
              <CardSubtitle>{track.artists.map(a => a.name).join(', ')}</CardSubtitle>
            </Card>
          ))}
        </Grid>
        )}
      </Section>

      <Section>
        <SectionTitle>New Releases</SectionTitle>
        {isLoading ? renderSkeletons() : (
          <Grid>
            {newReleases.map((album) => (
              <Card key={album.id}>
                <CardImage>
                  <img src={album.images[0]?.url} alt={album.name} />
                </CardImage>
                <CardTitle>{album.name}</CardTitle>
                <CardSubtitle>{album.artists.map(a => a.name).join(', ')}</CardSubtitle>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section>
        <SectionTitle>Your Playlists</SectionTitle>
        {isLoading ? renderSkeletons() : (
          featuredPlaylists.length > 0 ? (
            <Grid>
              {featuredPlaylists.map((playlist) => (
              <Card key={playlist.id}>
                <CardImage>
                  {playlist.images?.[0]?.url ? (
                    <img src={playlist.images[0].url} alt={playlist.name} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🎵</span>
                    </div>
                  )}
                </CardImage>
                <CardTitle>{playlist.name}</CardTitle>
                <CardSubtitle>{playlist.owner.display_name}</CardSubtitle>
              </Card>
            ))}
          </Grid>
        ) : (
          <CardSubtitle>No playlists found</CardSubtitle>
        )
        )}
      </Section>
    </HomeContainer>
  );
};

export default Home;
