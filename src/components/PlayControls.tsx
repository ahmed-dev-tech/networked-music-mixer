
import React from 'react';
import { useQueue } from '../contexts/QueueContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

const PlayControls: React.FC = () => {
  const { isPlaying, togglePlayPause, playNext, playPrevious, queue } = useQueue();

  // No controls needed if queue is empty
  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 my-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={playPrevious}
        className="h-10 w-10"
      >
        <SkipBack className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="default" 
        size="icon" 
        onClick={togglePlayPause}
        className="h-12 w-12 rounded-full music-gradient"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={playNext}
        className="h-10 w-10"
      >
        <SkipForward className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PlayControls;
