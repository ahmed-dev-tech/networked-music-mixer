
import React from 'react';
import { useQueue } from '../contexts/QueueContext';
import { Song } from '../types/queue';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, X } from "lucide-react";

const MusicQueue: React.FC = () => {
  const { queue, currentSongIndex, skipTo, removeFromQueue } = useQueue();

  const handlePlay = (index: number) => {
    skipTo(index);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the play action
    removeFromQueue(id);
  };

  if (queue.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">Queue is empty</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="p-2">
        {queue.map((song: Song, index: number) => (
          <div
            key={song.id}
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${
              currentSongIndex === index ? 'bg-accent' : ''
            }`}
            onClick={() => handlePlay(index)}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={song.thumbnail} 
                alt={song.title} 
                className="w-14 h-10 object-cover rounded"
              />
              {currentSongIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                  <span className="text-xs font-bold">NOW PLAYING</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground">Added by {song.addedBy}</p>
            </div>
            
            <div className="flex gap-1">
              {currentSongIndex !== index && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePlay(index)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => handleRemove(e, song.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MusicQueue;
