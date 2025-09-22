import type { Track, WorkoutPhase } from './types';

// A mock library of music tracks with real Spotify URIs.
const mockMusicLibrary: Track[] = [
  // Calm tracks (for Warm-Up, Cooldown, Yoga)
  { id: 'c1', title: 'Weightless', artist: 'Marconi Union', genre: 'Calm', bpm: 60, duration: 488, spotifyUri: 'spotify:track:6kGyl5mPCg2oIJI05z4sF8', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273e3a479213c45a7a18f43e570' },
  { id: 'c2', title: 'Clair de Lune', artist: 'Claude Debussy', genre: 'Calm', bpm: 66, duration: 303, spotifyUri: 'spotify:track:7oKmMw9fKnB2P21A0F9n2A', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2734e26915e7636a0256424564c' },
  { id: 'c3', title: 'Reverie', artist: 'Aero', genre: 'Calm', bpm: 70, duration: 195, spotifyUri: 'spotify:track:28sXyQ0R42S09XW8vA5r0q', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2738b555653b664879f7d0c75b8' },

  // Ambient tracks (for Rest, Yoga)
  { id: 'a1', title: 'Music for Airports 1/1', artist: 'Brian Eno', genre: 'Ambient', bpm: 60, duration: 1023, spotifyUri: 'spotify:track:03b1b31I4TjAo8pGg4T6Sg', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273c683c592175e1106e12e1a42' },
  { id: 'a2', title: 'SubtractiveLAD', artist: 'Loscil', genre: 'Ambient', bpm: 55, duration: 322, spotifyUri: 'spotify:track:3Dz4oJGIROAb2k42vB3b96', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273d438965939e08119c36b3b5c' },
  
  // Energetic tracks (for HIIT, Running)
  { id: 'e1', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Energetic', bpm: 171, duration: 200, spotifyUri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
  { id: 'e2', title: 'Don\'t Stop Me Now', artist: 'Queen', genre: 'Energetic', bpm: 156, duration: 209, spotifyUri: 'spotify:track:5T8EDUDqKcs6OSOwIbvUTB', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273e3b79b5c3c7a31b14457e56a' },
  { id: 'e3', title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis', genre: 'Energetic', bpm: 146, duration: 258, spotifyUri: 'spotify:track:3bidbhpOYeV4knp8AIu8Xn', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b27384a60127a92003a2c5895e6f' },
  { id: 'e4', title: 'Bad Guy', artist: 'Billie Eilish', genre: 'Energetic', bpm: 135, duration: 194, spotifyUri: 'spotify:track:2Fxmhks0bxGSBdJ92vM42m', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273f0133c74a3f1b0a70f50e938' },
  { id: 'e5', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Energetic', bpm: 115, duration: 270, spotifyUri: 'spotify:track:32OlwpcMpofReS3apKCZp7', albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b27305929828551a37c8621b2289' },
];

interface EngineState {
  currentTrack: Track | null;
  lastPlayedIds: string[];
}

const engineState: EngineState = {
  currentTrack: null,
  lastPlayedIds: [],
};

export const getCurrentPhase = (phases: WorkoutPhase[], elapsedTimeInSeconds: number): WorkoutPhase => {
  let accumulatedDuration = 0;
  for (const phase of phases) {
    accumulatedDuration += phase.duration * 60;
    if (elapsedTimeInSeconds < accumulatedDuration) {
      return phase;
    }
  }
  return phases[phases.length - 1];
};

export const getNextTrack = (heartRate: number, currentPhase: WorkoutPhase): Track => {
  const relevantTracks = mockMusicLibrary.filter(track => track.genre === currentPhase.musicGenre);

  if (relevantTracks.length === 0) {
    return mockMusicLibrary[Math.floor(Math.random() * mockMusicLibrary.length)];
  }

  let targetBpm: number;
  if (currentPhase.name === 'High Intensity') {
    targetBpm = Math.min(heartRate * 1.05, 180); 
  } else {
    targetBpm = 75;
  }
  
  const availableTracks = relevantTracks.filter(t => t.id !== engineState.currentTrack?.id);

  if (availableTracks.length === 0) {
     return relevantTracks[0];
  }

  let bestTrack = availableTracks.reduce((prev, curr) => {
    return (Math.abs(curr.bpm - targetBpm) < Math.abs(prev.bpm - targetBpm) ? curr : prev);
  });
  
  engineState.currentTrack = bestTrack;
  
  return bestTrack;
};
