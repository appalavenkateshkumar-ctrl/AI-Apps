import React, { useState, useCallback, useMemo } from 'react';
import type { Screen, WorkoutConfig, WorkoutPhase } from './types';
import { WorkoutType, MusicSource } from './types';
import {
  RunningIcon, HiitIcon, WalkingIcon, YogaIcon, HeartIcon, FlameIcon, PaceIcon,
  UserIcon, DumbbellIcon, OfflineIcon
} from './components/icons';

// Constants
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

// --- Reusable UI Components ---

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'tertiary' }> = ({ onClick, children, className = '', variant = 'primary' }) => {
  const baseClasses = 'w-full text-center py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 duration-300';
  const variantClasses = {
    primary: 'bg-brand-lime text-black shadow-lg shadow-brand-lime/30 hover:shadow-xl hover:shadow-brand-lime/40',
    secondary: 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30 hover:shadow-xl hover:shadow-brand-cyan/40',
    tertiary: 'bg-dark-card border border-cyan-500/30 text-light-text'
  }[variant];

  return <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>{children}</button>;
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

const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setStep(s => (s < totalSteps ? s + 1 : s));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-5xl font-black text-light-text text-center">RhythmFit</h1>
            <p className="text-medium-text text-lg mt-2 text-center">Adaptive music for your workout.</p>
            <p className="text-sm mt-12 text-center text-gray-500">Select your preferred language to continue.</p>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
              {LANGUAGES.slice(0, 4).map(lang => (
                <button key={lang} onClick={nextStep} className="bg-dark-card p-4 rounded-lg text-light-text hover:bg-cyan-900/30 border border-cyan-500/20 transition-all transform hover:scale-105 active:scale-100">{lang}</button>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold text-light-text text-center">Connect Your Device</h2>
            <p className="text-medium-text mt-2 text-center">Connect a wearable for accurate tracking or use your phone's sensors.</p>
            <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
              <Button onClick={nextStep} variant="secondary">Connect Wearable</Button>
              <Button onClick={nextStep} variant="tertiary">Use Phone Sensors</Button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold text-light-text text-center">Permissions</h2>
            <p className="text-medium-text mt-2 text-center">We need a few permissions to provide the full experience.</p>
            <div className="space-y-4 mt-8 text-left w-full max-w-sm">
              <div className="bg-dark-card p-4 rounded-lg flex items-center justify-between border border-cyan-500/20"><span>Heart Rate & Motion</span><span className="text-brand-cyan">Required</span></div>
              <div className="bg-dark-card p-4 rounded-lg flex items-center justify-between border border-cyan-500/20"><span>File Access (for local music)</span><span className="text-gray-400">Optional</span></div>
            </div>
            <div className="mt-8 w-full max-w-sm">
              <Button onClick={nextStep} variant="secondary">Grant Permissions</Button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-3xl font-bold text-light-text text-center">You're All Set!</h2>
            <p className="text-medium-text mt-2 text-center">Let's start your first workout and feel the rhythm.</p>
            <div className="mt-8 w-full max-w-sm">
              <Button onClick={onComplete} variant="primary">Let's Go!</Button>
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen text-light-text animate-fade-in">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        {renderStep()}
      </div>
      <div className="flex items-center gap-2 mt-8">
        {[...Array(totalSteps)].map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-brand-cyan' : 'w-2 bg-cyan-500/30'}`}></div>
        ))}
      </div>
    </div>
  );
};

const WorkoutSelectionScreen: React.FC<{ setScreen: (s: Screen) => void, setWorkoutConfig: React.Dispatch<React.SetStateAction<WorkoutConfig>> }> = ({ setScreen, setWorkoutConfig }) => {
  const [type, setType] = useState<WorkoutType>(WorkoutType.Running);
  const [duration, setDuration] = useState(30);
  const [musicSource, setMusicSource] = useState<MusicSource>(MusicSource.Spotify);
  const [offline, setOffline] = useState(false);

  const startWorkout = () => {
    setWorkoutConfig({ type, duration, musicSource, offline, phases: INITIAL_PHASES });
    setScreen('PHASE_SETUP');
  };

  return (
    <div className="p-6 text-light-text animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chest, January 20</h1>
          <p className="text-medium-text">1/4 weekly workouts done</p>
        </div>
        <img src={`https://i.pravatar.cc/48?u=user`} alt="User avatar" className="w-12 h-12 rounded-full border-2 border-brand-cyan" />
      </header>

      <section className="mt-8">
        <div className="space-y-4">
          {WORKOUT_TYPES.map(w => (
            <div key={w.type} onClick={() => setType(w.type)}
                 className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer border-2 transition-all transform hover:scale-[1.02] ${type === w.type ? 'bg-brand-cyan/10 border-brand-cyan scale-105' : 'bg-dark-card border-transparent'}`}>
              <div className={`p-3 rounded-lg bg-gray-900/50 ${type === w.type ? 'text-brand-lime' : 'text-brand-cyan'}`}>
                 <w.icon className="w-8 h-8" />
              </div>
              <div>
                <span className="font-bold text-lg text-light-text">{w.type}</span>
                <p className="text-sm text-brand-lime font-semibold tracking-wider">{w.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-medium-text">Music Source</h2>
        <div className="flex gap-2 bg-dark-card p-1 rounded-full border border-cyan-500/20">
          {MUSIC_SOURCES.map(source => (
            <button key={source} onClick={() => setMusicSource(source)} className={`flex-1 py-2 px-1 rounded-full text-sm font-semibold transition-colors duration-300 ${musicSource === source ? 'bg-brand-cyan text-black' : 'text-medium-text hover:bg-cyan-500/10'}`}>
              {source}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Button onClick={startWorkout} variant="primary">Start Workout</Button>
      </div>
    </div>
  );
};

const PhaseSetupScreen: React.FC<{ setScreen: (s: Screen) => void, workoutConfig: WorkoutConfig, setWorkoutConfig: React.Dispatch<React.SetStateAction<WorkoutConfig>> }> = ({ setScreen, workoutConfig, setWorkoutConfig }) => {
  const totalDuration = useMemo(() => workoutConfig.phases.reduce((sum, phase) => sum + phase.duration, 0), [workoutConfig.phases]);
  
  const handleDurationChange = (id: number, newDuration: number) => {
    setWorkoutConfig(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === id ? {...p, duration: Math.max(1, newDuration)} : p)
    }));
  };

  const handleGenreChange = (id: number, newGenre: string) => {
     setWorkoutConfig(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === id ? {...p, musicGenre: newGenre} : p)
    }));
  };

  return (
    <div className="p-6 text-light-text animate-fade-in">
      <h1 className="text-3xl font-bold">Workout Phases</h1>
      <p className="text-medium-text mt-1">Adjust the timeline for your session.</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Timeline ({totalDuration} min)</h2>
        <div className="w-full flex h-4 rounded-full overflow-hidden bg-dark-card border border-cyan-500/20">
          {workoutConfig.phases.map((phase) => (
            <div key={phase.id} style={{ width: `${(phase.duration / totalDuration) * 100}%` }} className={`
              ${phase.name === 'Warm-Up' && 'bg-blue-500'}
              ${phase.name === 'High Intensity' && 'bg-red-500'}
              ${phase.name === 'Rest' && 'bg-green-500'}
              ${phase.name === 'Cooldown' && 'bg-purple-500'}
              transition-all duration-300
            `}></div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {workoutConfig.phases.map((phase) => (
          <Card key={phase.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{phase.name}</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={phase.duration}
                  onChange={(e) => handleDurationChange(phase.id, parseInt(e.target.value) || 0)}
                  className="w-16 bg-gray-900 text-light-text text-center rounded-md p-1 border border-cyan-500/20"
                />
                <span className="text-medium-text">min</span>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-medium-text">Music Style</label>
              <select 
                value={phase.musicGenre} 
                onChange={e => handleGenreChange(phase.id, e.target.value)}
                className="w-full bg-gray-900 text-light-text rounded-md p-2 mt-1 border border-cyan-500/20"
              >
                {MUSIC_GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Button onClick={() => setScreen('LIVE_WORKOUT')} variant="secondary">Begin Exercise</Button>
      </div>
    </div>
  );
};


const LiveWorkoutScreen: React.FC<{ setScreen: (s: Screen) => void, workoutConfig: WorkoutConfig }> = ({ setScreen, workoutConfig }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="p-6 text-light-text flex flex-col h-full animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-lime">High Intensity Phase</h1>
        <p className="text-lg text-medium-text">{workoutConfig.type}</p>
        {workoutConfig.offline && <p className="text-sm text-yellow-400 mt-1">Offline Mode</p>}
      </div>

      <div className="grid grid-cols-2 gap-8 my-10 mx-auto">
        <CircularProgress percentage={80} label="Heart Rate" value="165" unit="BPM" icon={<HeartIcon className="w-6 h-6 text-red-500" />} color="stroke-red-500" />
        <CircularProgress percentage={65} label="Calories" value="210" unit="KCAL" icon={<FlameIcon className="w-6 h-6 text-orange-500" />} color="stroke-orange-500" />
        <CircularProgress percentage={90} label="Pace" value="5'30" unit="MIN/KM" icon={<PaceIcon className="w-6 h-6 text-brand-cyan" />} color="stroke-brand-cyan" />
        <CircularProgress percentage={75} label="Time" value="22:15" unit="MIN" icon={<PaceIcon className="w-6 h-6 text-brand-lime" />} color="stroke-brand-lime" />
      </div>

      <Card className="mt-auto">
        <div className="flex items-center gap-4">
          <img src="https://picsum.photos/64" alt="Album Art" className="w-16 h-16 rounded-lg" />
          <div>
            <p className="font-bold text-lg text-light-text">Adrenaline Rush</p>
            <p className="text-medium-text">Energetic Beats</p>
            <p className="text-sm text-brand-lime">Tempo: 150 BPM</p>
          </div>
        </div>
        <div className="w-full bg-cyan-900/50 rounded-full h-1 mt-4">
          <div className="bg-brand-lime h-1 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </Card>
      
      <div className="flex items-center justify-around mt-8">
        <button onClick={() => setIsPaused(!isPaused)} className="bg-brand-lime text-black w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold transition-transform transform hover:scale-105 active:scale-95 shadow-glow-lime">
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
        <button onClick={() => setScreen('WORKOUT_SELECTION')} className="bg-red-500/20 text-red-500 w-20 h-20 rounded-full flex items-center justify-center font-semibold transition-transform transform hover:scale-105 active:scale-95">
          STOP
        </button>
      </div>
    </div>
  );
};


const OfflineManagerScreen: React.FC = () => (
  <div className="p-6 text-light-text animate-fade-in">
    <h1 className="text-3xl font-bold">Offline Mode</h1>
    
    <Card className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Storage</h2>
      <div className="flex justify-between text-sm text-medium-text mb-1">
        <span>Used</span>
        <span>Available</span>
      </div>
      <div className="w-full bg-cyan-900/50 rounded-full h-2.5">
        <div className="bg-brand-cyan h-2.5 rounded-full" style={{width: '45%'}}></div>
      </div>
      <div className="flex justify-between text-sm text-medium-text mt-1">
        <span>1.8 GB</span>
        <span>4.2 GB</span>
      </div>
    </Card>

    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Downloaded Playlists</h2>
      <div className="space-y-3">
        {['HIIT Power-Up', 'Yoga Flow Ambient', 'Running Tempo Hits'].map(playlist => (
          <div key={playlist} className="bg-dark-card border border-cyan-500/20 p-4 rounded-lg flex justify-between items-center">
            <p>{playlist}</p>
            <button className="text-medium-text hover:text-light-text transition-transform transform hover:scale-125">...</button>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Offline Workouts</h2>
      <div className="space-y-3">
        {['Morning HIIT - 2 days ago', 'Evening Run - 5 days ago'].map(workout => (
          <div key={workout} className="bg-dark-card border border-cyan-500/20 p-4 rounded-lg">
            <p>{workout}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="mt-12">
      <Button onClick={() => {}} variant="secondary">Download More Music</Button>
    </div>
  </div>
);

const SettingsScreen: React.FC = () => {
    const [selectedLang, setSelectedLang] = useState('English');
    
    return (
        <div className="p-6 text-light-text animate-fade-in">
            <h1 className="text-3xl font-bold">Settings</h1>

            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Language & Localization</h2>
                <Card>
                    <label htmlFor="language-select" className="block mb-2 text-sm font-medium text-medium-text">Display Language</label>
                    <select 
                        id="language-select" 
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="bg-gray-900/50 border border-cyan-500/20 text-light-text text-sm rounded-lg focus:ring-brand-cyan focus:border-brand-cyan block w-full p-2.5"
                    >
                        {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
                    </select>

                    <label htmlFor="region-select" className="block mt-6 mb-2 text-sm font-medium text-medium-text">Regional Music Preference</label>
                    <select id="region-select" className="bg-gray-900/50 border border-cyan-500/20 text-light-text text-sm rounded-lg focus:ring-brand-cyan focus:border-brand-cyan block w-full p-2.5">
                        <option>Bollywood</option>
                        <option>Tamil Hits</option>
                        <option>Folk</option>
                        <option>International</option>
                    </select>

                    <div className="mt-6 border-t border-cyan-500/20 pt-4">
                        <h3 className="text-medium-text mb-2">Preview ({selectedLang})</h3>
                        <div className="p-4 bg-gray-900/50 rounded-lg">
                            <p className="font-bold text-light-text">New Workout</p>
                            <p className="text-sm text-medium-text mt-1">Start your session now!</p>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('WORKOUT_SELECTION');
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>({
    type: WorkoutType.Running,
    duration: 30,
    musicSource: MusicSource.Spotify,
    offline: false,
    phases: INITIAL_PHASES,
  });

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };
  
  const renderActiveScreen = useCallback(() => {
    switch (activeScreen) {
      case 'WORKOUT_SELECTION':
        return <WorkoutSelectionScreen setScreen={setActiveScreen} setWorkoutConfig={setWorkoutConfig} />;
      case 'PHASE_SETUP':
        return <PhaseSetupScreen setScreen={setActiveScreen} workoutConfig={workoutConfig} setWorkoutConfig={setWorkoutConfig} />;
      case 'LIVE_WORKOUT':
        return <LiveWorkoutScreen setScreen={setActiveScreen} workoutConfig={workoutConfig} />;
      case 'OFFLINE_MANAGER':
        return <OfflineManagerScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      default:
        return <WorkoutSelectionScreen setScreen={setActiveScreen} setWorkoutConfig={setWorkoutConfig} />;
    }
  }, [activeScreen, workoutConfig]);


  if (!isOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-gradient-to-b from-dark-bg to-[#08202B] min-h-screen font-sans">
      <main className="pb-24">
        {renderActiveScreen()}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-[#101E2B]/80 backdrop-blur-lg border-t border-cyan-500/20 p-2 flex justify-around">
        {[
          { screen: 'WORKOUT_SELECTION', label: 'Workout', icon: DumbbellIcon },
          { screen: 'OFFLINE_MANAGER', label: 'Offline', icon: OfflineIcon },
          { screen: 'SETTINGS', label: 'Profile', icon: UserIcon },
        ].map(item => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen as Screen)}
              className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-all transform hover:scale-110 active:scale-100 ${isActive ? 'text-brand-lime' : 'text-medium-text hover:text-light-text'}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-brand-cyan/20' : ''}`}>
                <item.icon className={`w-7 h-7 mb-1 transition-colors ${isActive ? 'text-brand-cyan' : ''}`} />
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
}