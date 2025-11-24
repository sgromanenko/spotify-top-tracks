import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Play } from 'lucide-react';
import { getRecentlyPlayed, getNewReleases, getUserPlaylists, SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';

// ... (styles remain the same)

const Home = () => {
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      const [recent, releases, playlists] = await Promise.all([
        getRecentlyPlayed(6),
        getNewReleases(6),
        getUserPlaylists(6)
      ]);
      setRecentTracks(recent);
      setNewReleases(releases);
      setFeaturedPlaylists(playlists);
    };

    fetchData();
  }, []);

  const handlePlay = (e: React.MouseEvent, trackUri: string) => {
    e.stopPropagation();
    playTrack(trackUri);
  };

  return (
    <HomeContainer>
      <Section>
        <SectionTitle>Recently Played</SectionTitle>
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
      </Section>

      <Section>
        <SectionTitle>New Releases</SectionTitle>
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
      </Section>

      <Section>
        <SectionTitle>Your Playlists</SectionTitle>
        {featuredPlaylists.length > 0 ? (
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
        )}
      </Section>
    </HomeContainer>
  );
};

export default Home;
