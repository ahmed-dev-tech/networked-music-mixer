
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { extractVideoId, getYoutubeThumbnail } from '../utils/youtubeUtils';
import { Song, QueueContextType } from '../types/queue';
import { toast } from '../components/ui/sonner';

// Create context with default values
const QueueContext = createContext<QueueContextType>({
  queue: [],
  currentSongIndex: 0,
  addToQueue: async () => {},
  removeFromQueue: () => {},
  playNext: () => {},
  playPrevious: () => {},
  skipTo: () => {},
  isPlaying: false,
  togglePlayPause: () => {},
});

// Hook to use the queue context
export const useQueue = () => useContext(QueueContext);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Generate a random username for this session
  const [username] = useState<string>(() => {
    const names = ['User', 'Guest', 'Friend', 'Listener', 'DJ'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomName}${randomNum}`;
  });

  // Load queue from local storage on init
  useEffect(() => {
    const savedQueue = localStorage.getItem('musicQueue');
    const savedIndex = localStorage.getItem('currentSongIndex');
    
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }
    
    if (savedIndex) {
      setCurrentSongIndex(parseInt(savedIndex));
    }
  }, []);

  // Save queue to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('musicQueue', JSON.stringify(queue));
  }, [queue]);

  // Save current index to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentSongIndex', currentSongIndex.toString());
  }, [currentSongIndex]);

  // Fetch video title from YouTube
  const fetchVideoDetails = async (videoId: string): Promise<{ title: string }> => {
    // In a real app, you would call your backend to get video details from YouTube API
    // For this demo, we'll just create a placeholder title
    return {
      title: `YouTube Video (${videoId})`
    };
  };

  const addToQueue = async (url: string) => {
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        toast.error("Invalid YouTube URL");
        return;
      }
      
      // Check if video already exists in queue
      if (queue.some(song => song.videoId === videoId)) {
        toast.info("This video is already in the queue");
        return;
      }

      const videoDetails = await fetchVideoDetails(videoId);
      
      const newSong: Song = {
        id: uuidv4(),
        videoId,
        title: videoDetails.title,
        thumbnail: getYoutubeThumbnail(videoId),
        addedBy: username,
        timestamp: Date.now()
      };
      
      setQueue(prevQueue => [...prevQueue, newSong]);
      toast.success("Added to queue");
      
      // If queue was empty, start playing
      if (queue.length === 0) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
      toast.error("Failed to add video to queue");
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prevQueue => {
      const songIndex = prevQueue.findIndex(song => song.id === id);
      if (songIndex === -1) return prevQueue;
      
      const newQueue = [...prevQueue];
      newQueue.splice(songIndex, 1);
      
      // Adjust current index if needed
      if (songIndex < currentSongIndex) {
        setCurrentSongIndex(prev => prev - 1);
      } else if (songIndex === currentSongIndex && newQueue.length > 0) {
        // Current song was removed, start the next one
        if (currentSongIndex >= newQueue.length) {
          setCurrentSongIndex(newQueue.length - 1);
        }
      } else if (newQueue.length === 0) {
        setCurrentSongIndex(0);
        setIsPlaying(false);
      }
      
      return newQueue;
    });
    
    toast.info("Removed from queue");
  };

  const playNext = () => {
    if (queue.length === 0) return;
    
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      // Loop back to start if at the end
      setCurrentSongIndex(0);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
      setIsPlaying(true);
    } else {
      // Loop to the end if at the start
      setCurrentSongIndex(queue.length - 1);
      setIsPlaying(true);
    }
  };

  const skipTo = (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <QueueContext.Provider 
      value={{
        queue,
        currentSongIndex,
        addToQueue,
        removeFromQueue,
        playNext,
        playPrevious,
        skipTo,
        isPlaying,
        togglePlayPause,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
