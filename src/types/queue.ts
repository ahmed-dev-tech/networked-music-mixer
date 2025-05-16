
export interface Song {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  addedBy: string;
  timestamp: number;
}

export interface QueueContextType {
  queue: Song[];
  currentSongIndex: number;
  addToQueue: (url: string) => Promise<void>;
  removeFromQueue: (id: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  skipTo: (index: number) => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
}
