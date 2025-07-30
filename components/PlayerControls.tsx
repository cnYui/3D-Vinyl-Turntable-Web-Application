import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { useAudio } from './AudioProvider';

interface PlayerControlsProps {
  compact?: boolean;
}

export function PlayerControls({ compact = false }: PlayerControlsProps) {
  const {
    currentRecord,
    isPlaying,
    volume,
    currentTime,
    togglePlayback,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  } = useAudio();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentRecord) {
    return compact ? (
      <div className="text-center">
        <p className="text-amber-200 text-xs">选择唱片开始播放</p>
      </div>
    ) : (
      <Card className="bg-amber-950/80 border-amber-700 backdrop-blur-sm">
        <div className="p-6 text-center">
          <p className="text-amber-200">Select a record from the cabinet to begin</p>
        </div>
      </Card>
    );
  }

  // 紧凑模式
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={togglePlayback}
          size="sm"
          className="h-8 w-8 bg-amber-600 hover:bg-amber-500 text-amber-950 p-1"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1 max-w-[120px]">
          <p className="text-amber-200 text-xs truncate">{currentRecord.title}</p>
          <p className="text-amber-300/70 text-xs truncate">{currentRecord.artist}</p>
        </div>
        
        <div className="flex items-center">
          <Button
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            variant="ghost"
            size="sm"
            className="text-amber-200 hover:text-amber-100 p-1 h-6 w-6"
          >
            {volume > 0 ? (
              <Volume2 className="h-3 w-3" />
            ) : (
              <VolumeX className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 完整模式
  return (
    <Card className="bg-gradient-to-r from-amber-950/90 to-stone-950/90 border-amber-700 backdrop-blur-sm">
      <div className="p-6 space-y-4">
        {/* Now Playing Info */}
        <div className="text-center space-y-1">
          <h3 className="text-lg text-amber-200">{currentRecord.title}</h3>
          <p className="text-amber-300/70">{currentRecord.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={currentRecord.duration}
            step={1}
            onValueChange={([value]) => seekTo(value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-amber-300/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentRecord.duration)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={previousTrack}
            variant="ghost"
            size="icon"
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/50"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            onClick={togglePlayback}
            size="icon"
            className="h-12 w-12 bg-amber-600 hover:bg-amber-500 text-amber-950"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            onClick={nextTrack}
            variant="ghost"
            size="icon"
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/50"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            variant="ghost"
            size="icon"
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/50 flex-shrink-0"
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value / 100)}
            className="flex-1"
          />
        </div>
      </div>
    </Card>
  );
}