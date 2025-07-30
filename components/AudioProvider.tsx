import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { VinylRecord, VINYL_COLLECTION } from '../src/data/vinylCollection';

interface AudioContextType {
  currentRecord: VinylRecord | null;
  hoveredRecord: VinylRecord | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  playbackSpeed: number;
  vinylCollection: VinylRecord[];
  selectRecord: (record: VinylRecord) => void;
  setHoveredRecord: (record: VinylRecord | null) => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}


interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentRecord, setCurrentRecord] = useState<VinylRecord | null>(null);
  const [hoveredRecord, setHoveredRecord] = useState<VinylRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectRecordRef = useRef<((record: VinylRecord, autoplay?: boolean) => void) | null>(null);

  const selectRecord = useCallback((record: VinylRecord, autoplay = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setCurrentRecord(record);
    setIsPlaying(autoplay);
    setCurrentTime(0);
    
    const audio = new Audio(record.audioUrl);
    audioRef.current = audio;
    audio.volume = volume;
    
    audio.addEventListener('timeupdate', () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    });
    
    audio.addEventListener('ended', () => {
      const currentIndex = VINYL_COLLECTION.findIndex(r => r.id === record.id);
      const nextIndex = (currentIndex + 1) % VINYL_COLLECTION.length;
      if (selectRecordRef.current) {
        selectRecordRef.current(VINYL_COLLECTION[nextIndex], true);
      }
    });

    if (autoplay) {
      audio.play().catch(error => {
        console.error("Autoplay failed:", error);
        setIsPlaying(false);
      });
    } else {
      audio.load();
    }
  }, [volume]);

  useEffect(() => {
    selectRecordRef.current = selectRecord;
  }, [selectRecord]);

  const togglePlayback = useCallback(() => {
    if (!currentRecord || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
    }
  }, [currentRecord, isPlaying]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentRecord) return;
    
    const currentIndex = VINYL_COLLECTION.findIndex(r => r.id === currentRecord.id);
    const nextIndex = (currentIndex + 1) % VINYL_COLLECTION.length;
    selectRecord(VINYL_COLLECTION[nextIndex], isPlaying);
  }, [currentRecord, selectRecord, isPlaying]);

  const previousTrack = useCallback(() => {
    if (!currentRecord) return;
    
    const currentIndex = VINYL_COLLECTION.findIndex(r => r.id === currentRecord.id);
    const prevIndex = (currentIndex - 1 + VINYL_COLLECTION.length) % VINYL_COLLECTION.length;
    selectRecord(VINYL_COLLECTION[prevIndex], isPlaying);
  }, [currentRecord, selectRecord, isPlaying]);

  const contextValue: AudioContextType = {
    currentRecord,
    hoveredRecord,
    isPlaying,
    volume,
    currentTime,
    playbackSpeed: 1.0,
    vinylCollection: VINYL_COLLECTION,
    selectRecord,
    setHoveredRecord,
    togglePlayback,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}