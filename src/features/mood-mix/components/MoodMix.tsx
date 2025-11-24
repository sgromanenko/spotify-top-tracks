import React, { useState } from 'react';
import styled from 'styled-components';
import { Sliders, Play, Save, RefreshCw } from 'lucide-react';
import { getRecommendations, createPlaylist, addTracksToPlaylist, SpotifyTrack, getTopTracks } from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const ControlsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.space.xl};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.background.default};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.fast};

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.space.md};
  margin-top: ${({ theme }) => theme.space.md};
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const TrackRow = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  transition: ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.paper};
  }
`;

const TrackImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-right: ${({ theme }) => theme.space.md};
`;

const TrackInfo = styled.div`
  flex: 1;
`;

const TrackName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ArtistName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MoodMix = () => {
  const [energy, setEnergy] = useState(50);
  const [valence, setValence] = useState(50);
  const [danceability, setDanceability] = useState(50);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { playTrack } = usePlayer();
  const { user } = useAuth();

  const generateMix = async () => {
    setLoading(true);
    try {
      // Get user's top artists to use as seeds for better personalization
      const topArtists = await getTopTracks(5, 'short_term'); // Actually getting tracks to get artists
      
      // Extract artist IDs (up to 2) and maybe a genre
      const allArtistIds = topArtists.flatMap((t: SpotifyTrack) => t.artists.map((a: { id: string }) => a.id));
      const uniqueArtistIds = Array.from(new Set(allArtistIds));
      const seedArtists = uniqueArtistIds.slice(0, 2);
      const seedGenres = seedArtists.length === 0 ? ['pop', 'dance'] : []; // Fallback if no top artists
      
      // Convert 0-100 slider values to 0.0-1.0 for API
      const targetEnergy = energy / 100;
      const targetValence = valence / 100;
      const targetDanceability = danceability / 100;
      
      const data = await getRecommendations({
        seedArtists: seedArtists.length > 0 ? seedArtists : undefined,
        seedGenres: seedGenres.length > 0 ? seedGenres : undefined,
        targets: {
          energy: targetEnergy,
          valence: targetValence,
          danceability: targetDanceability,
        },
        limit: 20
      });
      
      setTracks(data);
    } catch (err) {
      console.error('Failed to generate mix:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePlaylist = async () => {
    if (!user || tracks.length === 0) return;
    setSaving(true);
    
    const playlist = await createPlaylist(
      user.id, 
      `Mood Mix: ${new Date().toLocaleDateString()}`, 
      `Generated based on Energy: ${energy}%, Mood: ${valence}%, Danceability: ${danceability}%`
    );
    
    if (playlist) {
      const uris = tracks.map(t => `spotify:track:${t.id}`);
      await addTracksToPlaylist(playlist.id, uris);
      alert('Playlist saved to your library!');
    }
    
    setSaving(false);
  };

  return (
    <Container>
      <Header>
        <Title>Mood Mix</Title>
        <Subtitle>Create the perfect playlist for your current vibe</Subtitle>
      </Header>

      <ControlsContainer>
        <SliderGroup>
          <Label>
            <span>Energy</span>
            <span>{energy}%</span>
          </Label>
          <Slider 
            type="range" 
            min="0" 
            max="100" 
            value={energy} 
            onChange={(e) => setEnergy(parseInt(e.target.value))} 
          />
        </SliderGroup>

        <SliderGroup>
          <Label>
            <span>Mood (Valence)</span>
            <span>{valence}%</span>
          </Label>
          <Slider 
            type="range" 
            min="0" 
            max="100" 
            value={valence} 
            onChange={(e) => setValence(parseInt(e.target.value))} 
          />
        </SliderGroup>

        <SliderGroup>
          <Label>
            <span>Danceability</span>
            <span>{danceability}%</span>
          </Label>
          <Slider 
            type="range" 
            min="0" 
            max="100" 
            value={danceability} 
            onChange={(e) => setDanceability(parseInt(e.target.value))} 
          />
        </SliderGroup>

        <ButtonGroup>
          <Button onClick={generateMix} disabled={loading}>
            {loading ? <RefreshCw className="spin" size={20} /> : <Sliders size={20} />}
            Generate Mix
          </Button>
          {tracks.length > 0 && (
            <Button variant="secondary" onClick={savePlaylist} disabled={saving}>
              <Save size={20} />
              Save Playlist
            </Button>
          )}
        </ButtonGroup>
      </ControlsContainer>

      {tracks.length > 0 && (
        <TrackList>
          {tracks.map((track) => (
            <TrackRow key={track.id} onClick={() => playTrack(track.id)}>
              <TrackImage src={track.album.images[0]?.url} alt={track.name} />
              <TrackInfo>
                <TrackName>{track.name}</TrackName>
                <ArtistName>{track.artists.map(a => a.name).join(', ')}</ArtistName>
              </TrackInfo>
              <Play size={20} color="#1DB954" />
            </TrackRow>
          ))}
        </TrackList>
      )}
    </Container>
  );
};

export default MoodMix;
