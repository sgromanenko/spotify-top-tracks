import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { search, SpotifyTrack, SpotifyArtist, SpotifyAlbum, SpotifyPlaylist } from '../../../services/spotify';
import { usePlayer } from '../../../context/PlayerContext';

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const SearchHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding-bottom: ${({ theme }) => theme.space.md};
  z-index: 10;
`;

const SearchInputContainer = styled.div`
  position: relative;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  padding-left: 3rem;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: ${({ theme }) => theme.transitions.default};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.paper};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResultsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
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
  }
`;

const CardImage = styled.div<{ rounded?: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme, rounded }) => (rounded ? '50%' : theme.borderRadius.small)};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};

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
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
`;

const TrackImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const TrackName = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    tracks?: { items: SpotifyTrack[] };
    artists?: { items: SpotifyArtist[] };
    albums?: { items: SpotifyAlbum[] };
    playlists?: { items: SpotifyPlaylist[] };
  }>({});
  const { playTrack } = usePlayer();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const data = await search(query);
        setResults(data);
      } else {
        setResults({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchInputContainer>
          <SearchIconWrapper>
            <SearchIcon size={20} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </SearchInputContainer>
      </SearchHeader>

      {results.tracks?.items && results.tracks.items.length > 0 && (
        <ResultsSection>
          <SectionTitle>Songs</SectionTitle>
          <TrackList>
            {results.tracks.items.slice(0, 5).map((track, index) => (
              <TrackRow key={track.id} onClick={() => playTrack(track.id)}>
                <span>{index + 1}</span>
                <TrackInfo>
                  <TrackImage src={track.album.images[2]?.url || track.album.images[0]?.url} alt={track.name} />
                  <div>
                    <TrackName>{track.name}</TrackName>
                    <div>{track.artists.map(a => a.name).join(', ')}</div>
                  </div>
                </TrackInfo>
                <span 
                  style={{ cursor: 'pointer', textDecoration: 'underline' }} 
                  onClick={(e) => { e.stopPropagation(); navigate(`/album/${track.album.id}`); }}
                >
                  {track.album.name}
                </span>
                <span>{formatDuration(track.duration_ms)}</span>
              </TrackRow>
            ))}
          </TrackList>
        </ResultsSection>
      )}

      {results.artists?.items && results.artists.items.length > 0 && (
        <ResultsSection>
          <SectionTitle>Artists</SectionTitle>
          <Grid>
            {results.artists.items.slice(0, 6).map((artist: any) => (
              <Card key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)}>
                <CardImage rounded>
                  <img src={artist.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={artist.name} />
                </CardImage>
                <CardTitle>{artist.name}</CardTitle>
                <CardSubtitle>Artist</CardSubtitle>
              </Card>
            ))}
          </Grid>
        </ResultsSection>
      )}

      {results.albums?.items && results.albums.items.length > 0 && (
        <ResultsSection>
          <SectionTitle>Albums</SectionTitle>
          <Grid>
            {results.albums.items.slice(0, 6).map((album) => (
              <Card key={album.id} onClick={() => navigate(`/album/${album.id}`)}>
                <CardImage>
                  <img src={album.images[0]?.url} alt={album.name} />
                </CardImage>
                <CardTitle>{album.name}</CardTitle>
                <CardSubtitle>{album.artists.map(a => a.name).join(', ')}</CardSubtitle>
              </Card>
            ))}
          </Grid>
        </ResultsSection>
      )}
    </SearchContainer>
  );
};

export default Search;
