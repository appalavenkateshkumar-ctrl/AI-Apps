export type Screen = 
  | 'AUTH'
  | 'LOGIN'
  | 'SIGNUP'
  | 'ONBOARDING'
  | 'WORKOUT_SELECTION'
  | 'PHASE_SETUP'
  | 'LIVE_WORKOUT'
  | 'OFFLINE_MANAGER'
  | 'SETTINGS';

export interface User {
  uid: string;
  email: string | null;
  onboarded: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: 'Calm' | 'Energetic' | 'Ambient' | 'Folk' | 'Bollywood' | 'Tamil Hits';
  bpm: number;
  duration: number; // in seconds
  spotifyUri?: string;
  albumArtUrl?: string;
}

export enum WorkoutType {
  Running = 'Running',
  HIIT = 'HIIT',
  Walking = 'Walking',
  Yoga = 'Yoga',
}

export enum MusicSource {
  Spotify = 'Spotify',
  Local = 'Local Music',
  Regional = 'Regional Playlist',
}

export interface WorkoutPhase {
  id: number;
  name: 'Warm-Up' | 'High Intensity' | 'Rest' | 'Cooldown';
  duration: number; // in minutes
  musicGenre: string;
}

export interface WorkoutConfig {
  type: WorkoutType;
  duration: number; // in minutes
  musicSource: MusicSource;
  offline: boolean;
  phases: WorkoutPhase[];
}