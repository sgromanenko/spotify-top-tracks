import { useQuery } from '@tanstack/react-query';

import { getRecentlyPlayed } from '@/services/spotify';

export const useRecentTracks = (limit = 50) => {
  return useQuery({
    queryKey: ['recentTracks', limit],
    queryFn: () => getRecentlyPlayed(limit),
  });
};
