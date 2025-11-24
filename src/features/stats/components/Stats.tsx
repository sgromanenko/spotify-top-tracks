import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getTopTracks, SpotifyTrack } from '../../../services/spotify';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const Header = styled.div`
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.space.xl};
`;

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.space.xl};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
  min-height: 400px;
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Stats = () => {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [popularityData, setPopularityData] = useState<any[]>([]);
  const [artistData, setArtistData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const tracks = await getTopTracks(50, 'long_term');
      setTopTracks(tracks);

      // Process data for charts
      const popularity = tracks.slice(0, 10).map(track => ({
        name: track.name.length > 15 ? track.name.substring(0, 15) + '...' : track.name,
        popularity: track.popularity || 0,
      }));
      setPopularityData(popularity);

      // Count artist occurrences
      const artistCounts: Record<string, number> = {};
      tracks.forEach(track => {
        track.artists.forEach(artist => {
          artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
        });
      });

      const artists = Object.entries(artistCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, value: count }));
      setArtistData(artists);
    };

    fetchData();
  }, []);

  const COLORS = ['#1DB954', '#1ED760', '#1AA34A', '#535353', '#B3B3B3'];

  return (
    <Container>
      <Header>
        <Title>Listening Stats</Title>
        <Subtitle>Insights into your listening habits based on your top tracks</Subtitle>
      </Header>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Top Tracks Popularity</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularityData}>
              <XAxis dataKey="name" stroke="#B3B3B3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#B3B3B3" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#282828', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="popularity" fill="#1DB954" radius={[4, 4, 0, 0]}>
                {popularityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Top Artists Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={artistData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {artistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#282828', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </Container>
  );
};

export default Stats;
