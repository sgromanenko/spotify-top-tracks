/**
 * User Models
 * 
 * Type definitions for user-related data
 */

/**
 * User Profile from auth store
 */
export interface UserProfile {
  id: string;
  spotifyId: string;
  displayName: string;
  email: string;
  profileImage?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    privacy: {
      profileVisibility: 'public' | 'private';
      listeningActivity: 'public' | 'private';
    };
  };
  statistics: {
    totalListeningTime: number;
    totalTracksPlayed: number;
    favoriteGenres: string[];
    topArtists: string[];
    listeningStreak: number;
    averageSessionLength: number;
  };
  createdAt: Date;
  lastActive: Date;
}
