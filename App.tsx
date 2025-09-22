import React, { useState, useCallback, useMemo, useContext, createContext, useEffect, useRef } from 'react';
import type { Screen, WorkoutConfig, WorkoutPhase, User, Track } from './types';
import { WorkoutType, MusicSource } from './types';
import { auth } from './firebaseConfig';
// FIX: The import from 'firebase/auth' is no longer needed as we are using the v8 namespaced API.

import { spotifyConfig } from './spotifyConfig';

import {
  RunningIcon, HiitIcon, WalkingIcon, YogaIcon, HeartIcon, FlameIcon, PaceIcon,
  UserIcon, DumbbellIcon, OfflineIcon, ArrowLeftIcon
} from './components/icons';
import { getNextTrack, getCurrentPhase } from './musicEngine';

// FIX: Added minimal TypeScript definitions for the Spotify Web Playback SDK.
// This resolves 'Cannot find namespace "Spotify"' and errors related to 'window.Spotify'.
declare namespace Spotify {
  // These are simplified types to match usage in this file.
  export interface Player {
    addListener(event: 'ready' | 'not_ready', cb: ({ device_id }: { device_id: string }) => void): boolean;
    addListener(event: 'player_state_changed', cb: (state: PlaybackState | null) => void): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
  }
  export interface Track {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
  }
  export interface PlaybackState {
    track_window: { current_track: Track };
    paused: boolean;
  }
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: any) => Spotify.Player;
    };
  }
}


// --- Constants ---
const USER_AVATAR_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYFxMZGCIfIh8hHysjJikoHRUWJDUlKC0vMjIyGSI4PTcwPCsxMi8BCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//EAEgQAAIBAgQDBgIHBgQDBgsAAAECEQADBBIhMQVBUQYTImFxgZGhMrHB0RQjQlLwFTNicpLh8SQ0U2OCorLC0uJ0k7M2g9P/xAAaAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUG/8QALBEBAQACAgEDAwQCAwEBAAAAAAECEQMSITEEE0FRBSJhcUKBkbHwM5Gh0f/xAAwDAQACEQMRAD8A+4ooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiigKKKKAooooCiiig-';
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'];
const MUSIC_GENRES = ['Calm', 'Energetic', 'Ambient', 'Folk', 'Bollywood', 'Tamil Hits'];
const WORKOUT_TYPES = [
  { type: WorkoutType.Running, icon: RunningIcon, category: 'CARDIO' },
  { type: WorkoutType.HIIT, icon: HiitIcon, category: 'STRENGTH' },
  { type: WorkoutType.Walking, icon: WalkingIcon, category: 'CARDIO' },
  { type: WorkoutType.Yoga, icon: YogaIcon, category: 'FLEXIBILITY' },
];
const MUSIC_SOURCES = [MusicSource.Spotify, MusicSource.Local, MusicSource.Regional];
const INITIAL_PHASES: WorkoutPhase[] = [
  { id: 1, name: 'Warm-Up', duration: 5, musicGenre: 'Calm' },
  { id: 2, name: 'High Intensity', duration: 20, musicGenre: 'Energetic' },
  { id: 3, name: 'Rest', duration: 5, musicGenre: 'Ambient' },
  { id: 4, name: 'Cooldown', duration: 5, musicGenre: 'Calm' },
];
const ROOT_SCREENS: Screen[] = ['WORKOUT_SELECTION', 'OFFLINE_MANAGER', 'SETTINGS'];


// --- Authentication Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // FIX: Changed from onAuthStateChanged(auth, ...) to auth.onAuthStateChanged(...) for Firebase v8 compatibility.
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userDataString = localStorage.getItem(`rhythmFitUserData_${firebaseUser.uid}`);
        const userData = userDataString ? JSON.parse(userDataString) : { onboarded: false };
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          onboarded: userData.onboarded || false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem(`rhythmFitUserData_${currentUser.uid}`, JSON.stringify({ onboarded: updatedUser.onboarded }));
      return updatedUser;
    });
  };

  // FIX: Changed from signInWithEmailAndPassword(auth, ...) to auth.signInWithEmailAndPassword(...) for Firebase v8 compatibility.
  const login = async (email: string, pass: string) => { setLoading(true); setError(null); try { await auth.signInWithEmailAndPassword(email, pass); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  // FIX: Changed from createUserWithEmailAndPassword(auth, ...) to auth.createUserWithEmailAndPassword(...) for Firebase v8 compatibility.
  const signup = async (email: string, pass: string) => { setLoading(true); setError(null); try { const cred = await auth.createUserWithEmailAndPassword(email, pass); localStorage.setItem(`rhythmFitUserData_${cred.user.uid}`, JSON.stringify({ onboarded: false })); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  // FIX: Changed from signOut(auth) to auth.signOut() for Firebase v8 compatibility.
  const logout = async () => { try { await auth.signOut(); } catch (e: any) { setError(e.message); } };

  return <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading, error }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Spotify Context ---
interface SpotifyContextType {
  token: string | null;
  player: Spotify.Player | null;
  connect: () => void;
  deviceId: string | null;
  isPaused: boolean;
  currentTrack: Spotify.Track | null;
  playTrack: (uri: string) => void;
  togglePlay: () => void;
}
const SpotifyContext = createContext<SpotifyContextType | null>(null);

const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('spotify_access_token'));
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  
  useEffect(() => {
    const hash = window.location.hash;
    let localToken = token;

    if (!localToken && hash) {
      const params = new URLSearchParams(hash.substring(1));
      localToken = params.get('access_token');
      const expiresIn = params.get('expires_in');
      
      if (localToken && expiresIn) {
        window.location.hash = "";
        const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
        localStorage.setItem('spotify_access_token', localToken);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        setToken(localToken);
      }
    }

    const expiryTime = localStorage.getItem('spotify_token_expiry');
    if (localToken && expiryTime && new Date().getTime() > parseInt(expiryTime)) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_token_expiry');
      setToken(null);
      localToken = null;
    }

    if (!localToken) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'RhythmFit Web Player',
        getOAuthToken: cb => { cb(localToken!); },
        volume: 0.5
      });
      setPlayer(spotifyPlayer);
    };
  }, []);
  
  useEffect(() => {
    if (!player) return;

    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', (state) => {
      if (!state) return;
      setCurrentTrack(state.track_window.current_track);
      setIsPaused(state.paused);
    });

    player.connect();
    return () => { player.disconnect() };
  }, [player]);

  const connect = () => {
    localStorage.removeItem('spotify_access_token');
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyConfig.clientId}&response_type=token&redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&scope=${encodeURIComponent(spotifyConfig.scopes.join(' '))}`;
    window.location.href = authUrl;
  };

  const playTrack = async (uri: string) => {
    if (!deviceId || !token) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  };

  const togglePlay = () => {
    player?.togglePlay();
  };

  return <SpotifyContext.Provider value={{ token, player, connect, deviceId, isPaused, currentTrack, playTrack, togglePlay }}>{children}</SpotifyContext.Provider>;
}

const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error("useSpotify must be used within a SpotifyProvider");
  return context;
};

// --- Reusable UI Components ---

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'tertiary', disabled?: boolean }> = ({ onClick, children, className = '', variant = 'primary', disabled = false }) => {
  const baseClasses = 'w-full text-center py-4 px-6 rounded-xl font-bold text-lg transition-all transform duration-300';
  const activeClasses = 'hover:scale-[1.02] active:scale-95';
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-lime text-black shadow-lg shadow-brand-lime/30 hover:shadow-xl hover:shadow-brand-lime/40',
    secondary: 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30 hover:shadow-xl hover:shadow-brand-cyan/40',
    tertiary: 'bg-dark-card border border-cyan-500/30 text-light-text'
  }[variant];

  return <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${className} ${disabled ? disabledClasses : activeClasses}`}>{children}</button>;
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-dark-card rounded-2xl p-6 border border-cyan-500/20 ${className} ${onClick ? 'cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:bg-cyan-900/20' : ''}`}>
    {children}
  </div>
);

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string; label: string; value: string; unit: string; icon: React.ReactNode; }> = ({ percentage, size = 120, strokeWidth = 10, color = 'stroke-brand-lime', label, value, unit, icon }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0" width={size} height={size}>
        <circle className="text-cyan-500/20" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle
          className={`${color} transition-[stroke-dashoffset] duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-light-text">
        <div className="text-gray-400 mb-1">{icon}</div>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-medium-text">{unit}</span>
      </div>
    </div>
  );
};


// --- Screen Components ---

const AuthScreen: React.FC<{ navigateTo: (s: Screen) => void }> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen text-light-text animate-fade-in">
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-black text-light-text">RhythmFit</h1>
        <p className="text-medium-text text-xl mt-2">Adaptive music for your workout.</p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <Button onClick={() => navigateTo('SIGNUP')} variant="primary">Sign Up</Button>
        <Button onClick={() => navigateTo('LOGIN')} variant="secondary">Log In</Button>
      </div>
    </div>
  );
};

const AuthForm: React.FC<{
  title: string;
  buttonText: string;
  action: (email: string, pass: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  switchFormText: string;
  onSwitchForm: () => void;
  switchFormButtonText: string;
  variant?: 'primary' | 'secondary';
}> = ({ title, buttonText, action, loading, error, switchFormText, onSwitchForm, switchFormButtonText, variant = 'primary' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (email && password) {
      await action(email, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen text-light-text animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      <div className="w-full max-w-sm space-y-6">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-card p-4 rounded-lg border border-cyan-500/20 focus:ring-brand-cyan focus:border-brand-cyan" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark-card p-4 rounded-lg border border-cyan-500/20 focus:ring-brand-cyan focus:border-brand-cyan" />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <Button onClick={handleSubmit} disabled={loading} variant={variant}>{loading ? 'Processing...' : buttonText}</Button>
        <p className="text-center text-medium-text">{switchFormText} <button onClick={onSwitchForm} className="font-bold text-brand-cyan">{switchFormButtonText}</button></p>
      </div>
    </div>
  );
};


const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const nextStep = () => setStep(s => (s < totalSteps ? s + 1 : s));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <>
          <h1 className="text-5xl font-black text-light-text text-center">Welcome!</h1>
          <p className="text-medium-text text-lg mt-2 text-center">Let's set up your profile.</p>
          <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">{LANGUAGES.slice(0, 4).map(lang => <button key={lang} onClick={nextStep} className="bg-dark-card p-4 rounded-lg text-light-text hover:bg-cyan-900/30 border border-cyan-500/20 transition-all transform hover:scale-105">{lang}</button>)}</div>
        </>;
      case 2:
        return <>
          <h2 className="text-3xl font-bold text-light-text text-center">Connect Your Device</h2>
          <p className="text-medium-text mt-2 text-center">Connect a wearable for accurate tracking.</p>
          <div className="flex flex-col gap-4 mt-8 w-full max-w-sm"><Button onClick={nextStep} variant="secondary">Connect Wearable</Button><Button onClick={nextStep} variant="tertiary">Use Phone Sensors</Button></div>
        </>;
      case 3:
        return <>
          <h2 className="text-3xl font-bold text-light-text text-center">Permissions</h2>
          <p className="text-medium-text mt-2 text-center">We need a few permissions for the full experience.</p>
          <div className="space-y-4 mt-8 text-left w-full max-w-sm"><div className="bg-dark-card p-4 rounded-lg flex items-center justify-between border border-cyan-500/20"><span>Heart Rate & Motion</span><span className="text-brand-cyan">Required</span></div><div className="bg-dark-card p-4 rounded-lg flex items-center justify-between border border-cyan-500/20"><span>File Access</span><span className="text-gray-400">Optional</span></div></div>
          <div className="mt-8 w-full max-w-sm"><Button onClick={nextStep} variant="secondary">Grant Permissions</Button></div>
        </>;
      case 4:
        return <>
          <h2 className="text-3xl font-bold text-light-text text-center">You're All Set!</h2>
          <p className="text-medium-text mt-2 text-center">Let's start your first workout.</p>
          <div className="mt-8 w-full max-w-sm"><Button onClick={onComplete} variant="primary">Let's Go!</Button></div>
        </>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen text-light-text animate-fade-in">
      <div className="flex-grow flex flex-col items-center justify-center w-full">{renderStep()}</div>
      <div className="flex items-center gap-2 mt-8">{[...Array(totalSteps)].map((_, i) => <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-brand-cyan' : 'w-2 bg-cyan-500/30'}`}></div>)}</div>
    </div>
  );
};

const WorkoutSelectionScreen: React.FC<{ navigateTo: (s: Screen) => void, setWorkoutConfig: React.Dispatch<React.SetStateAction<WorkoutConfig>> }> = ({ navigateTo, setWorkoutConfig }) => {
  const [type, setType] = useState<WorkoutType>(WorkoutType.Running);
  const [musicSource, setMusicSource] = useState<MusicSource>(MusicSource.Spotify);
  const { token: spotifyToken, connect: connectToSpotify } = useSpotify();
  
  const handleStart = () => {
    setWorkoutConfig(prev => ({ ...prev, type, musicSource, phases: INITIAL_PHASES }));
    navigateTo('PHASE_SETUP');
  };

  const showSpotifyConnect = musicSource === MusicSource.Spotify && !spotifyToken;

  return (
    <div className="p-6 text-light-text animate-fade-in">
      <section>
        <div className="space-y-4">
          {WORKOUT_TYPES.map(w => (
            <div key={w.type} onClick={() => setType(w.type)} className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer border-2 transition-all transform hover:scale-[1.02] ${type === w.type ? 'bg-brand-cyan/10 border-brand-cyan scale-105' : 'bg-dark-card border-transparent'}`}>
              <div className={`p-3 rounded-lg bg-gray-900/50 ${type === w.type ? 'text-brand-lime' : 'text-brand-cyan'}`}><w.icon className="w-8 h-8" /></div>
              <div><span className="font-bold text-lg text-light-text">{w.type}</span><p className="text-sm text-brand-lime font-semibold tracking-wider">{w.category}</p></div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-medium-text">Music Source</h2>
        <div className="flex gap-2 bg-dark-card p-1 rounded-full border border-cyan-500/20">
          {MUSIC_SOURCES.map(source => <button key={source} onClick={() => setMusicSource(source)} className={`flex-1 py-2 px-1 rounded-full text-sm font-semibold transition-colors duration-300 ${musicSource === source ? 'bg-brand-cyan text-black' : 'text-medium-text hover:bg-cyan-500/10'}`}>{source}</button>)}
        </div>
      </section>

      <div className="mt-12">
        {showSpotifyConnect ? (
          <Button onClick={connectToSpotify} variant="secondary">Connect to Spotify</Button>
        ) : (
          <Button onClick={handleStart} variant="primary">Start Workout</Button>
        )}
      </div>
    </div>
  );
};

const PhaseSetupScreen: React.FC<{ navigateTo: (s: Screen) => void, workoutConfig: WorkoutConfig, setWorkoutConfig: React.Dispatch<React.SetStateAction<WorkoutConfig>> }> = ({ navigateTo, workoutConfig, setWorkoutConfig }) => {
  const totalDuration = useMemo(() => workoutConfig.phases.reduce((sum, phase) => sum + phase.duration, 0), [workoutConfig.phases]);
  const handleDurationChange = (id: number, newDuration: number) => { setWorkoutConfig(prev => ({...prev, phases: prev.phases.map(p => p.id === id ? {...p, duration: Math.max(1, newDuration)} : p)})); };
  const handleGenreChange = (id: number, newGenre: string) => { setWorkoutConfig(prev => ({...prev, phases: prev.phases.map(p => p.id === id ? {...p, musicGenre: newGenre} : p)})); };

  return (
    <div className="p-6 text-light-text animate-fade-in">
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Timeline ({totalDuration} min)</h2>
        <div className="w-full flex h-4 rounded-full overflow-hidden bg-dark-card border border-cyan-500/20">
          {workoutConfig.phases.map((phase) => <div key={phase.id} style={{ width: `${(phase.duration / totalDuration) * 100}%` }} className={`
            ${phase.name === 'Warm-Up' && 'bg-blue-500'} ${phase.name === 'High Intensity' && 'bg-red-500'}
            ${phase.name === 'Rest' && 'bg-green-500'} ${phase.name === 'Cooldown' && 'bg-purple-500'} transition-all duration-300`}></div>)}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {workoutConfig.phases.map((phase) => (
          <Card key={phase.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{phase.name}</h3>
              <div className="flex items-center gap-2"><input type="number" value={phase.duration} onChange={(e) => handleDurationChange(phase.id, parseInt(e.target.value) || 0)} className="w-16 bg-gray-900 text-light-text text-center rounded-md p-1 border border-cyan-500/20" /><span className="text-medium-text">min</span></div>
            </div>
            <div className="mt-4"><label className="text-sm text-medium-text">Music Style</label><select value={phase.musicGenre} onChange={e => handleGenreChange(phase.id, e.target.value)} className="w-full bg-gray-900 text-light-text rounded-md p-2 mt-1 border border-cyan-500/20">{MUSIC_GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}</select></div>
          </Card>
        ))}
      </div>
      <div className="mt-12"><Button onClick={() => navigateTo('LIVE_WORKOUT')} variant="secondary">Begin Exercise</Button></div>
    </div>
  );
};

const HeartRateChart: React.FC<{ data: number[]; className?: string }> = ({ data, className = '' }) => {
  const viewBoxWidth = 300;
  const viewBoxHeight = 100;
  const minHr = 40;
  const maxHr = 200;

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-medium-text w-full h-24">
        Recording heart rate data...
      </div>
    );
  }

  const maxPoints = 300; // Show last 5 minutes of data
  const chartData = data.length > maxPoints ? data.slice(data.length - maxPoints) : data;

  const points = chartData.map((hr, index) => {
    const x = (index / (chartData.length > 1 ? chartData.length - 1 : 1)) * viewBoxWidth;
    const y = viewBoxHeight - ((Math.max(minHr, Math.min(maxHr, hr)) - minHr) / (maxHr - minHr)) * viewBoxHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const areaPoints = `0,${viewBoxHeight} ${points} ${viewBoxWidth},${viewBoxHeight}`;
  
  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#hrGradient)"
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
};


const LiveWorkoutScreen: React.FC<{ navigateTo: (s: Screen) => void, workoutConfig: WorkoutConfig }> = ({ navigateTo, workoutConfig }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentHeartRate, setCurrentHeartRate] = useState(70);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([70]);
  const [engineTrack, setEngineTrack] = useState<Track | null>(null);
  
  const { playTrack, togglePlay, currentTrack: spotifyTrack, isPaused: isSpotifyPaused } = useSpotify();
  
  const isPaused = workoutConfig.musicSource === MusicSource.Spotify ? isSpotifyPaused : !isSpotifyPaused; // Local state not implemented
  const currentPhase = useMemo(() => getCurrentPhase(workoutConfig.phases, elapsedTime), [workoutConfig.phases, elapsedTime]);
  
  const lastPlayedUri = useRef<string | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const workoutInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setCurrentHeartRate(prevHr => {
        let targetHr = currentPhase.name === 'High Intensity' ? 160 : (currentPhase.name === 'Warm-Up' ? 110 : 80);
        const newHr = prevHr + (targetHr - prevHr) * 0.1 + (Math.random() - 0.5) * 4;
        const finalHr = Math.round(Math.max(60, Math.min(190, newHr)));
        setHeartRateHistory(prevHistory => [...prevHistory, finalHr]);
        return finalHr;
      });
    }, 1000);
    return () => clearInterval(workoutInterval);
  }, [isPaused, currentPhase]);

  useEffect(() => {
     const newTrack = getNextTrack(currentHeartRate, currentPhase);
     if (newTrack.id !== engineTrack?.id) {
        setEngineTrack(newTrack);
        if (workoutConfig.musicSource === MusicSource.Spotify && newTrack.spotifyUri && newTrack.spotifyUri !== lastPlayedUri.current) {
          playTrack(newTrack.spotifyUri);
          lastPlayedUri.current = newTrack.spotifyUri;
        }
     }
  }, [currentHeartRate, currentPhase, engineTrack, workoutConfig.musicSource, playTrack]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const displayTrack = workoutConfig.musicSource === MusicSource.Spotify && spotifyTrack
    ? { title: spotifyTrack.name, artist: spotifyTrack.artists[0].name, albumArt: spotifyTrack.album.images[0].url, bpm: engineTrack?.bpm }
    : { title: engineTrack?.title, artist: engineTrack?.artist, albumArt: engineTrack?.albumArtUrl || "https://picsum.photos/64", bpm: engineTrack?.bpm };

  return (
    <div className="p-6 text-light-text flex flex-col h-full animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-lime">{currentPhase.name} Phase</h1>
        <p className="text-lg text-medium-text">{workoutConfig.type}</p>
        {workoutConfig.offline && <p className="text-sm text-yellow-400 mt-1">Offline Mode</p>}
      </div>

      <div className="grid grid-cols-2 gap-8 my-10 mx-auto">
        <CircularProgress percentage={(currentHeartRate / 200) * 100} label="Heart Rate" value={String(currentHeartRate)} unit="BPM" icon={<HeartIcon className="w-6 h-6 text-red-500" />} color="stroke-red-500" />
        <CircularProgress percentage={65} label="Calories" value="210" unit="KCAL" icon={<FlameIcon className="w-6 h-6 text-orange-500" />} color="stroke-orange-500" />
        <CircularProgress percentage={90} label="Pace" value="5'30" unit="MIN/KM" icon={<PaceIcon className="w-6 h-6 text-brand-cyan" />} color="stroke-brand-cyan" />
        <CircularProgress percentage={elapsedTime / (workoutConfig.phases.reduce((a, b) => a + b.duration, 0) * 60) * 100} label="Time" value={formatTime(elapsedTime)} unit="MIN" icon={<PaceIcon className="w-6 h-6 text-brand-lime" />} color="stroke-brand-lime" />
      </div>

      <Card className="my-8 p-4">
        <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="font-semibold text-sm text-medium-text">Heart Rate Trend</h3>
            <div className="flex items-center gap-1 text-red-500 text-sm font-bold">
                <HeartIcon className="w-4 h-4" />
                <span>{currentHeartRate} BPM</span>
            </div>
        </div>
        <HeartRateChart data={heartRateHistory} className="w-full h-24" />
      </Card>

      <Card className="mt-auto">
        <div className="flex items-center gap-4">
          <img src={displayTrack.albumArt} alt="Album Art" className="w-16 h-16 rounded-lg" />
          <div>
            <p className="font-bold text-lg text-light-text truncate">{displayTrack.title || 'Loading...'}</p>
            <p className="text-medium-text">{displayTrack.artist || '...'}</p>
            <p className="text-sm text-brand-lime">Tempo: {displayTrack.bpm || '...'} BPM</p>
          </div>
        </div>
      </Card>
      
      <div className="flex items-center justify-around mt-8">
        <button onClick={togglePlay} className="bg-brand-lime text-black w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold transition-transform transform hover:scale-105 active:scale-95 shadow-glow-lime">
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
        <button onClick={() => navigateTo('WORKOUT_SELECTION')} className="bg-red-500/20 text-red-500 w-20 h-20 rounded-full flex items-center justify-center font-semibold transition-transform transform hover:scale-105 active:scale-95">
          STOP
        </button>
      </div>
    </div>
  );
};


const OfflineManagerScreen: React.FC = () => (
  <div className="p-6 text-light-text animate-fade-in">
    <Card className="mt-8"><h2 className="text-xl font-semibold mb-2">Storage</h2><div className="flex justify-between text-sm text-medium-text mb-1"><span>Used</span><span>Available</span></div><div className="w-full bg-cyan-900/50 rounded-full h-2.5"><div className="bg-brand-cyan h-2.5 rounded-full" style={{width: '45%'}}></div></div><div className="flex justify-between text-sm text-medium-text mt-1"><span>1.8 GB</span><span>4.2 GB</span></div></Card>
    <section className="mt-8"><h2 className="text-xl font-semibold mb-4">Downloaded Playlists</h2><div className="space-y-3">{['HIIT Power-Up', 'Yoga Flow Ambient', 'Running Tempo Hits'].map(playlist => <div key={playlist} className="bg-dark-card border border-cyan-500/20 p-4 rounded-lg flex justify-between items-center"><p>{playlist}</p><button className="text-medium-text hover:text-light-text">...</button></div>)}</div></section>
    <section className="mt-8"><h2 className="text-xl font-semibold mb-4">Recent Offline Workouts</h2><div className="space-y-3">{['Morning HIIT - 2 days ago', 'Evening Run - 5 days ago'].map(workout => <div key={workout} className="bg-dark-card border border-cyan-500/20 p-4 rounded-lg"><p>{workout}</p></div>)}</div></section>
    <div className="mt-12"><Button onClick={() => {}} variant="secondary">Download More Music</Button></div>
  </div>
);

const SettingsScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const [selectedLang, setSelectedLang] = useState('English');
    return (
        <div className="p-6 text-light-text animate-fade-in">
            <Card className="mt-6 text-center">
              <img src={USER_AVATAR_BASE64} alt="User avatar" className="w-24 h-24 rounded-full border-4 border-brand-cyan object-cover mx-auto" />
              <p className="mt-4 text-xl font-bold">{user?.email}</p>
            </Card>
            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Language & Localization</h2>
                <Card>
                    <label htmlFor="language-select" className="block mb-2 text-sm font-medium text-medium-text">Display Language</label>
                    <select id="language-select" value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="bg-gray-900/50 border border-cyan-500/20 text-light-text text-sm rounded-lg focus:ring-brand-cyan block w-full p-2.5">{LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}</select>
                </Card>
            </section>
            <div className="mt-8"><Button onClick={logout} variant="tertiary">Log Out</Button></div>
        </div>
    );
};

const Header: React.FC<{navHistory: Screen[]; navigateBack: () => void;}> = ({ navHistory, navigateBack }) => {
    const activeScreen = navHistory[navHistory.length - 1];
    const showBackButton = navHistory.length > 1 && !ROOT_SCREENS.includes(activeScreen);
    const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const getTitle = () => {
        if (activeScreen === 'WORKOUT_SELECTION') return <div><p className="text-brand-lime font-semibold tracking-wider text-sm">{dateString.toUpperCase()}</p><h1 className="text-4xl font-black text-light-text">RhythmFit</h1></div>;
        const titles: Record<Screen, string> = {'AUTH': '', 'LOGIN': '', 'SIGNUP': '', 'ONBOARDING': '', 'WORKOUT_SELECTION': 'RhythmFit', 'PHASE_SETUP': 'Workout Phases', 'LIVE_WORKOUT': 'Live Workout', 'OFFLINE_MANAGER': 'Offline Mode', 'SETTINGS': 'Profile & Settings'};
        return <h1 className="text-3xl font-bold">{titles[activeScreen] || ''}</h1>;
    };

    return (
        <header className="px-6 pt-6 flex items-center justify-between min-h-[5rem]">
            <div className="flex items-center">
                {showBackButton && <button onClick={navigateBack} className="mr-4 p-2 rounded-full text-light-text bg-dark-card hover:bg-cyan-500/20"><ArrowLeftIcon className="w-6 h-6" /></button>}
                {getTitle()}
            </div>
            {activeScreen === 'WORKOUT_SELECTION' && <img src={USER_AVATAR_BASE64} alt="User avatar" className="w-12 h-12 rounded-full border-2 border-brand-cyan object-cover" />}
        </header>
    );
};

// --- Main App Logic ---
const AppCore: React.FC = () => {
  const { user, updateUser, loading, login, signup, error } = useAuth();
  const [navHistory, setNavHistory] = useState<Screen[]>(['AUTH']);
  
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>({ type: WorkoutType.Running, duration: 30, musicSource: MusicSource.Spotify, offline: false, phases: INITIAL_PHASES });
  const activeScreen = navHistory[navHistory.length - 1];

  useEffect(() => { if (user) { setNavHistory(['WORKOUT_SELECTION']); } else { setNavHistory(['AUTH']); } }, [user]);

  const navigateTo = (screen: Screen) => setNavHistory(prev => [...prev, screen]);
  const navigateBack = () => { if (navHistory.length > 1) setNavHistory(prev => prev.slice(0, -1)); };
  const navigateTab = (screen: Screen) => setNavHistory([screen]);
  const handleOnboardingComplete = () => { updateUser({ onboarded: true }); navigateTab('WORKOUT_SELECTION'); };
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-lime">Loading...</div>;

  if (!user) {
    switch (activeScreen) {
      case 'LOGIN': return <AuthForm title="Log In" buttonText="Log In" action={login} loading={loading} error={error} switchFormText="Don't have an account?" onSwitchForm={() => navigateTab('SIGNUP')} switchFormButtonText="Sign Up" variant="secondary" />;
      case 'SIGNUP': return <AuthForm title="Create Account" buttonText="Sign Up" action={signup} loading={loading} error={error} switchFormText="Already have an account?" onSwitchForm={() => navigateTab('LOGIN')} switchFormButtonText="Log In" variant="primary" />;
      default: return <AuthScreen navigateTo={navigateTo} />;
    }
  }

  if (!user.onboarded) return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'WORKOUT_SELECTION': return <WorkoutSelectionScreen navigateTo={navigateTo} setWorkoutConfig={setWorkoutConfig} />;
      case 'PHASE_SETUP': return <PhaseSetupScreen navigateTo={navigateTo} workoutConfig={workoutConfig} setWorkoutConfig={setWorkoutConfig} />;
      case 'LIVE_WORKOUT': return <LiveWorkoutScreen navigateTo={navigateTab} workoutConfig={workoutConfig} />;
      case 'OFFLINE_MANAGER': return <OfflineManagerScreen />;
      case 'SETTINGS': return <SettingsScreen />;
      default: return <WorkoutSelectionScreen navigateTo={navigateTo} setWorkoutConfig={setWorkoutConfig} />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-dark-bg to-[#08202B] min-h-screen font-sans">
      <Header navHistory={navHistory} navigateBack={navigateBack} />
      <main className="pb-24">{renderActiveScreen()}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#101E2B]/80 backdrop-blur-lg border-t border-cyan-500/20 p-2 flex justify-around">
        {ROOT_SCREENS.map(screen => {
          const item = { screen: screen, label: { 'WORKOUT_SELECTION': 'Workout', 'OFFLINE_MANAGER': 'Offline', 'SETTINGS': 'Profile' }[screen], icon: { 'WORKOUT_SELECTION': DumbbellIcon, 'OFFLINE_MANAGER': OfflineIcon, 'SETTINGS': UserIcon }[screen] };
          if (!item.icon || !item.label) return null;
          const isActive = activeScreen === item.screen;
          return <button key={item.screen} onClick={() => navigateTab(item.screen)} className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-all ${isActive ? 'text-brand-lime' : 'text-medium-text'}`}><div className={`p-2 rounded-full ${isActive ? 'bg-brand-cyan/20' : ''}`}><item.icon className={`w-7 h-7 mb-1 ${isActive ? 'text-brand-cyan' : ''}`} /></div><span className="text-xs font-semibold">{item.label}</span></button>
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SpotifyProvider>
        <AppCore />
      </SpotifyProvider>
    </AuthProvider>
  );
}