import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Music, Disc, Mic } from 'lucide-react';
import { getUserPlaylists, getSavedTracks, getUserAlbums, getFollowedArtists, SpotifyPlaylist, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';

const LibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const Tab = styled.button<{ active: boolean }>`
  background-color: ${({ theme, active }) => (active ? theme.colors.text.primary : theme.colors.background.elevated)};
  color: ${({ theme, active }) => (active ? theme.colors.background.default : theme.colors.text.primary)};
  border: none;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.lg};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, active }) => (active ? theme.colors.text.primary : theme.colors.background.paper)};
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
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.paper};
    transform: translateY(-4px);
  }
`;

const CardImage = styled.div<{ rounded?: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme, rounded }) => (rounded ? '50%' : theme.borderRadius.small)};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  background-color: ${({ theme }) => theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

const Library = () => {
  const [activeTab, setActiveTab] = useState<'playlists' | 'artists' | 'albums'>('playlists');
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'playlists' && playlists.length === 0) {
        const data = await getUserPlaylists(50);
        setPlaylists(data);
      } else if (activeTab === 'albums' && albums.length === 0) {
        const data = await getUserAlbums(50);
        setAlbums(data);
      } else if (activeTab === 'artists' && artists.length === 0) {
        const data = await getFollowedArtists(50);
        setArtists(data);
      }
    };

    fetchData();
  }, [activeTab, playlists.length, albums.length, artists.length]);

  return (
    <LibraryContainer>
      <Header>
        <Title>Your Library</Title>
        <Tabs>
          <Tab active={activeTab === 'playlists'} onClick={() => setActiveTab('playlists')}>
            Playlists
          </Tab>
          <Tab active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
            Artists
          </Tab>
          <Tab active={activeTab === 'albums'} onClick={() => setActiveTab('albums')}>
            Albums
          </Tab>
        </Tabs>
      </Header>

      {activeTab === 'playlists' && (
        <Grid>
          {playlists.map((playlist) => (
            <Card key={playlist.id}>
              <CardImage>
                {playlist.images?.[0]?.url ? (
                  <img src={playlist.images[0].url} alt={playlist.name} />
                ) : (
                  <Music size={48} color="#b3b3b3" />
                )}
              </CardImage>
              <CardTitle>{playlist.name}</CardTitle>
              <CardSubtitle>By {playlist.owner?.display_name || 'Spotify'}</CardSubtitle>
            </Card>
          ))}
        </Grid>
      )}

      {activeTab === 'artists' && (
        <Grid>
          {artists.map((artist: any) => (
            <Card key={artist.id}>
              <CardImage rounded>
                {artist.images?.[0]?.url ? (
                  <img src={artist.images[0].url} alt={artist.name} />
                ) : (
                  <Mic size={48} color="#b3b3b3" />
                )}
              </CardImage>
              <CardTitle>{artist.name}</CardTitle>
              <CardSubtitle>Artist</CardSubtitle>
            </Card>
          ))}
        </Grid>
      )}

      {activeTab === 'albums' && (
        <Grid>
          {albums.map((album) => (
            <Card key={album.id}>
              <CardImage>
                {album.images?.[0]?.url ? (
                  <img src={album.images[0].url} alt={album.name} />
                ) : (
                  <Disc size={48} color="#b3b3b3" />
                )}
              </CardImage>
              <CardTitle>{album.name}</CardTitle>
              <CardSubtitle>{album.artists.map(a => a.name).join(', ')}</CardSubtitle>
            </Card>
          ))}
        </Grid>
      )}
    </LibraryContainer>
  );
};

export default Library;
