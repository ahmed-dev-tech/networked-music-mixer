
export interface Song {
    id: string;
    videoId: string;
    title: string;
    thumbnail: string;
    addedBy: string;
    timestamp: number;
    likes: { [userId: string]: boolean };
    dislikes: { [userId: string]: boolean };
    comments: Comment[];
}

export interface Comment {
    id: string;
    text: string;
    username: string;
    timestamp: number;
}

export interface QueueContextType {
    queue: Song[];
    currentSongIndex: number;
    isPlaying: boolean;
    username: string | null;
    setUsername: (username: string) => void;
    addToQueue: (url: string) => Promise<void>;
    removeFromQueue: (id: string) => void;
    playNext: () => void;
    playPrevious: () => void;
    skipTo: (index: number) => void;
    togglePlayPause: () => void;
    likeSong: (songId: string) => Promise<void>;
    dislikeSong: (songId: string) => Promise<void>;
    getLikeCount: (song: Song) => number;
    getDislikeCount: (song: Song) => number;
    hasLiked: (song: Song) => boolean;
    hasDisliked: (song: Song) => boolean;
    isSynced: boolean;
    toggleSync: () => void;
    videoEnabled: boolean;
    toggleVideo: () => void;
    addComment: (songId: string, text: string) => Promise<void>;
    getComments: (song: Song) => Comment[];
    getLeaderboard: () => Array<{
        username: string;
        totalLikes: number;
        songCount: number;
        averageLikes: number;
    }>;
}
