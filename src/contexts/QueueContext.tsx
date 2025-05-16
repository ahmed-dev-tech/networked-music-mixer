import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { extractVideoId, getYoutubeThumbnail } from "../utils/youtubeUtils";
import { Song, QueueContextType, Comment } from "../types/queue";
import { toast } from "../components/ui/sonner";
import { database } from "../config/firebase";
import {
    ref,
    onValue,
    set,
    push,
    remove,
    update,
    get,
} from "firebase/database";

interface LeaderboardEntry {
    username: string;
    totalLikes: number;
    songCount: number;
    averageLikes: number;
}

// Create context with default values
const QueueContext = createContext<QueueContextType>({
    queue: [],
    currentSongIndex: 0,
    isPlaying: false,
    username: null,
    setUsername: () => {},
    addToQueue: async () => {},
    removeFromQueue: () => {},
    playNext: () => {},
    playPrevious: () => {},
    skipTo: () => {},
    togglePlayPause: () => {},
    likeSong: async () => {},
    dislikeSong: async () => {},
    getLikeCount: () => 0,
    getDislikeCount: () => 0,
    hasLiked: () => false,
    hasDisliked: () => false,
    isSynced: false,
    toggleSync: () => {},
    videoEnabled: true,
    toggleVideo: () => {},
    addComment: async () => {},
    getComments: () => [],
    getLeaderboard: () => [],
});

// Hook to use the queue context
export const useQueue = () => useContext(QueueContext);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isSynced, setIsSynced] = useState<boolean>(() => {
        // Initialize sync state from localStorage
        return localStorage.getItem("musicAppSync") === "true";
    });
    const [videoEnabled, setVideoEnabled] = useState<boolean>(() => {
        // Initialize video state from localStorage
        return localStorage.getItem("musicAppVideo") !== "false";
    });
    const [username, setUsernameState] = useState<string | null>(() => {
        // Initialize username from localStorage
        return localStorage.getItem("musicAppUsername");
    });

    // Update localStorage when sync state changes
    const toggleSync = () => {
        const newSyncState = !isSynced;
        setIsSynced(newSyncState);
        localStorage.setItem("musicAppSync", newSyncState.toString());
    };

    // Update localStorage when video state changes
    const toggleVideo = () => {
        const newVideoState = !videoEnabled;
        setVideoEnabled(newVideoState);
        localStorage.setItem("musicAppVideo", newVideoState.toString());
    };

    // Update localStorage when username changes
    const setUsername = (newUsername: string) => {
        setUsernameState(newUsername);
        localStorage.setItem("musicAppUsername", newUsername);
    };

    // Helper functions for likes and dislikes
    const getLikeCount = (song: Song) => {
        if (!song.likes) return 0;
        return Object.values(song.likes).filter(Boolean).length;
    };

    const getDislikeCount = (song: Song) => {
        if (!song.dislikes) return 0;
        return Object.values(song.dislikes).filter(Boolean).length;
    };

    const hasLiked = (song: Song) => {
        if (!song.likes || !username) return false;
        return Boolean(song.likes[username]);
    };

    const hasDisliked = (song: Song) => {
        if (!song.dislikes || !username) return false;
        return Boolean(song.dislikes[username]);
    };

    const getComments = (song: Song): Comment[] => {
        if (!song.comments) return [];
        return Array.isArray(song.comments) ? song.comments : [];
    };

    const addComment = async (songId: string, text: string): Promise<void> => {
        if (!username) {
            toast.error("Please set your username first");
            return;
        }

        try {
            const song = queue.find((s) => s.id === songId);
            if (!song) {
                console.error("Song not found:", songId);
                return;
            }

            // Get the queue reference
            const queueRef = ref(database, "queue");
            const queueSnapshot = await get(queueRef);
            const queueData = queueSnapshot.val();

            if (!queueData) {
                console.error("Queue data not found");
                return;
            }

            // Find the key of the song
            const songKey = Object.keys(queueData).find(
                (key) => queueData[key].id === songId
            );

            if (!songKey) {
                console.error("Song key not found in queue data");
                return;
            }

            const songRef = ref(database, `queue/${songKey}`);
            const songSnapshot = await get(songRef);
            const songData = songSnapshot.val();

            if (!songData) {
                console.error("Song data not found");
                return;
            }

            // Create new comment
            const newComment: Comment = {
                id: uuidv4(),
                text,
                username,
                timestamp: Date.now(),
            };

            // Get existing comments or create empty array
            const currentComments = songData.comments || [];

            // Add new comment
            await update(songRef, {
                comments: [...currentComments, newComment],
            });

            toast.success("Comment added");
        } catch (error: any) {
            console.error("Error adding comment:", error);
            toast.error(error.message || "Failed to add comment");
        }
    };

    const likeSong = async (songId: string) => {
        if (!username) {
            toast.error("Please set your username first");
            return;
        }

        try {
            const song = queue.find((s) => s.id === songId);
            if (!song) {
                console.error("Song not found:", songId);
                return;
            }

            // Get the queue reference
            const queueRef = ref(database, "queue");
            const queueSnapshot = await get(queueRef);
            const queueData = queueSnapshot.val();

            if (!queueData) {
                console.error("Queue data not found");
                return;
            }

            // Find the key of the song
            const songKey = Object.keys(queueData).find(
                (key) => queueData[key].id === songId
            );

            if (!songKey) {
                console.error("Song key not found in queue data");
                return;
            }

            const songRef = ref(database, `queue/${songKey}`);
            const songSnapshot = await get(songRef);
            const songData = songSnapshot.val();

            if (!songData) {
                console.error("Song data not found");
                return;
            }

            const updates: any = {};

            // If already liked, remove like
            if (hasLiked(song)) {
                updates[`likes/${username}`] = null;
                toast.success("Removed like");
            } else {
                // Add like and remove dislike if exists
                updates[`likes/${username}`] = true;
                updates[`dislikes/${username}`] = null;
                toast.success("Liked song");
            }

            await update(songRef, updates);
            console.log("Successfully updated likes for song:", songId);
        } catch (error: any) {
            console.error("Error liking song:", error);
            toast.error(error.message || "Failed to like song");
        }
    };

    const dislikeSong = async (songId: string) => {
        if (!username) {
            toast.error("Please set your username first");
            return;
        }

        try {
            const song = queue.find((s) => s.id === songId);
            if (!song) {
                console.error("Song not found:", songId);
                return;
            }

            // Get the queue reference
            const queueRef = ref(database, "queue");
            const queueSnapshot = await get(queueRef);
            const queueData = queueSnapshot.val();

            if (!queueData) {
                console.error("Queue data not found");
                return;
            }

            // Find the key of the song
            const songKey = Object.keys(queueData).find(
                (key) => queueData[key].id === songId
            );

            if (!songKey) {
                console.error("Song key not found in queue data");
                return;
            }

            const songRef = ref(database, `queue/${songKey}`);
            const songSnapshot = await get(songRef);
            const songData = songSnapshot.val();

            if (!songData) {
                console.error("Song data not found");
                return;
            }

            const updates: any = {};

            // If already disliked, remove dislike
            if (hasDisliked(song)) {
                updates[`dislikes/${username}`] = null;
                toast.success("Removed dislike");
            } else {
                // Add dislike and remove like if exists
                updates[`dislikes/${username}`] = true;
                updates[`likes/${username}`] = null;
                toast.success("Disliked song");
            }

            await update(songRef, updates);
            console.log("Successfully updated dislikes for song:", songId);
        } catch (error: any) {
            console.error("Error disliking song:", error);
            toast.error(error.message || "Failed to dislike song");
        }
    };

    // Calculate leaderboard data
    const getLeaderboard = () => {
        if (queue.length === 0) return [];

        // Group songs by username
        const userSongs: Record<string, Song[]> = {};

        queue.forEach((song) => {
            if (!userSongs[song.addedBy]) {
                userSongs[song.addedBy] = [];
            }
            userSongs[song.addedBy].push(song);
        });

        // Calculate stats for each user
        const leaderboardData = Object.entries(userSongs).map(
            ([username, songs]) => {
                const totalLikes = songs.reduce(
                    (sum, song) => sum + getLikeCount(song),
                    0
                );
                const songCount = songs.length;
                const averageLikes = songCount > 0 ? totalLikes / songCount : 0;

                return {
                    username,
                    totalLikes,
                    songCount,
                    averageLikes,
                };
            }
        );

        // Sort by total likes (descending)
        return leaderboardData.sort((a, b) => b.totalLikes - a.totalLikes);
    };

    // Listen to queue changes from Firebase
    useEffect(() => {
        const queueRef = ref(database, "queue");
        const currentIndexRef = ref(database, "currentIndex");
        const isPlayingRef = ref(database, "isPlaying");
        const leaderboardRef = ref(database, "leaderboard");

        // Listen to queue changes (always active)
        const unsubscribeQueue = onValue(queueRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Queue data received:", data);

            if (data) {
                // Convert the object to an array and sort by timestamp
                const queueArray = Object.values(data).sort(
                    (a: any, b: any) => a.timestamp - b.timestamp
                ) as Song[];
                console.log("Sorted queue array:", queueArray);
                setQueue(queueArray);

                // Update leaderboard in Firebase
                const leaderboardData = getLeaderboard();
                console.log("Updating leaderboard with data:", leaderboardData);

                // Convert array to object with usernames as keys for better Firebase structure
                const leaderboardObject = leaderboardData.reduce(
                    (acc, entry) => {
                        acc[entry.username] = entry;
                        return acc;
                    },
                    {} as Record<string, LeaderboardEntry>
                );

                set(leaderboardRef, leaderboardObject).catch((error) => {
                    console.error("Error updating leaderboard:", error);
                });
            } else {
                console.log("Queue is empty");
                setQueue([]);
                // Clear leaderboard when queue is empty
                set(leaderboardRef, {}).catch((error) => {
                    console.error("Error clearing leaderboard:", error);
                });
            }
        });

        // Only listen to playback state changes if sync is enabled
        let unsubscribeIndex: () => void;
        let unsubscribePlaying: () => void;

        if (isSynced) {
            // Listen to current index changes
            unsubscribeIndex = onValue(currentIndexRef, (snapshot) => {
                const data = snapshot.val();
                console.log("Current index received:", data);
                if (data !== null) {
                    setCurrentSongIndex(data);
                }
            });

            // Listen to isPlaying changes
            unsubscribePlaying = onValue(isPlayingRef, (snapshot) => {
                const data = snapshot.val();
                console.log("Is playing received:", data);
                if (data !== null) {
                    setIsPlaying(data);
                }
            });
        }

        // Initialize the database if it's empty
        const initializeDatabase = async () => {
            try {
                const queueSnapshot = await get(queueRef);
                if (!queueSnapshot.exists()) {
                    console.log("Initializing empty queue");
                    await set(queueRef, {});
                    await set(currentIndexRef, 0);
                    await set(isPlayingRef, false);
                    await set(leaderboardRef, {});
                }
            } catch (error) {
                console.error("Error initializing database:", error);
            }
        };

        initializeDatabase();

        return () => {
            unsubscribeQueue();
            if (isSynced) {
                unsubscribeIndex();
                unsubscribePlaying();
            }
        };
    }, [isSynced]); // Add isSynced to dependencies

    // Fetch video title from YouTube
    const fetchVideoDetails = async (
        videoId: string
    ): Promise<{ title: string }> => {
        // In a real app, you would call your backend to get video details from YouTube API
        // For this demo, we'll just create a placeholder title
        return {
            title: `YouTube Video (${videoId})`,
        };
    };

    const addToQueue = async (url: string) => {
        if (!username) {
            toast.error("Please set your username first");
            return;
        }

        try {
            const videoId = extractVideoId(url);
            if (!videoId) {
                toast.error("Invalid YouTube URL");
                return;
            }

            // Check if video already exists in queue
            if (queue.some((song) => song.videoId === videoId)) {
                toast.info("This video is already in the queue");
                return;
            }

            const videoDetails = await fetchVideoDetails(videoId);
            const timestamp = Date.now();

            const newSong: Song = {
                id: uuidv4(),
                videoId,
                title: videoDetails.title,
                thumbnail: getYoutubeThumbnail(videoId),
                addedBy: username,
                timestamp,
                likes: {},
                dislikes: {},
                comments: [],
            };

            // Add to Firebase with timestamp
            const queueRef = ref(database, "queue");
            const newSongRef = push(queueRef);
            await set(newSongRef, newSong);

            console.log("Added new song to queue:", newSong);
            toast.success("Added to queue");

            // If queue was empty, start playing
            if (queue.length === 0) {
                await set(ref(database, "isPlaying"), true);
            }
        } catch (error: any) {
            console.error("Error adding to queue:", error);
            toast.error(error.message || "Failed to add video to queue");
        }
    };

    const removeFromQueue = async (id: string) => {
        try {
            console.log("Attempting to remove song with ID:", id);

            // Get the queue reference
            const queueRef = ref(database, "queue");
            const currentIndexRef = ref(database, "currentIndex");

            // Get the current queue data
            const queueSnapshot = await get(queueRef);
            const queueData = queueSnapshot.val();

            if (!queueData) {
                console.log("No queue data found");
                return;
            }

            // Find the key of the song to remove
            const songKey = Object.keys(queueData).find(
                (key) => queueData[key].id === id
            );

            if (!songKey) {
                console.log("Could not find song key in Firebase data");
                return;
            }

            // Get the current index
            const currentIndexSnapshot = await get(currentIndexRef);
            const currentIndex = currentIndexSnapshot.val() || 0;

            // Remove the song
            const songRef = ref(database, `queue/${songKey}`);
            await remove(songRef);
            console.log("Successfully removed song from Firebase");

            // Calculate the new index
            let newIndex = currentIndex;
            const remainingSongs = Object.values(queueData).filter(
                (song: any) => song.id !== id
            );

            if (remainingSongs.length === 0) {
                // If queue is now empty, reset to 0
                newIndex = 0;
            } else if (currentIndex >= remainingSongs.length) {
                // If current index is now out of bounds, set to last song
                newIndex = remainingSongs.length - 1;
            }

            // Update the current index
            await set(currentIndexRef, newIndex);
            console.log("Updated current index to:", newIndex);

            toast.success("Removed from queue");
        } catch (error: any) {
            console.error("Error removing from queue:", error);
            toast.error(error.message || "Failed to remove from queue");
        }
    };

    const playNext = async () => {
        try {
            if (queue.length === 0) {
                console.log("Queue is empty, cannot play next");
                return;
            }

            // Calculate the next index
            let newIndex = currentSongIndex;
            if (currentSongIndex < queue.length - 1) {
                newIndex = currentSongIndex + 1;
            } else {
                // If we're at the end, loop back to the beginning
                newIndex = 0;
            }

            console.log("Playing next song:", {
                currentIndex: currentSongIndex,
                newIndex,
                queueLength: queue.length,
            });

            // Update the index
            await set(ref(database, "currentIndex"), newIndex);
            // Ensure it's playing
            await set(ref(database, "isPlaying"), true);

            console.log("Successfully updated to next song");
        } catch (error: any) {
            console.error("Error playing next song:", error);
            toast.error(error.message || "Failed to play next song");
        }
    };

    const playPrevious = async () => {
        try {
            if (queue.length === 0) {
                console.log("Queue is empty, cannot play previous");
                return;
            }

            // Calculate the previous index
            let newIndex = currentSongIndex;
            if (currentSongIndex > 0) {
                newIndex = currentSongIndex - 1;
            } else {
                // If we're at the start, go to the end
                newIndex = queue.length - 1;
            }

            console.log("Playing previous song:", {
                currentIndex: currentSongIndex,
                newIndex,
                queueLength: queue.length,
            });

            // Update the index
            await set(ref(database, "currentIndex"), newIndex);
            // Ensure it's playing
            await set(ref(database, "isPlaying"), true);

            console.log("Successfully updated to previous song");
        } catch (error: any) {
            console.error("Error playing previous song:", error);
            toast.error(error.message || "Failed to play previous song");
        }
    };

    const skipTo = async (index: number) => {
        try {
            if (index < 0 || index >= queue.length) {
                console.log("Invalid index for skipTo:", index);
                return;
            }

            console.log("Skipping to song:", {
                currentIndex: currentSongIndex,
                newIndex: index,
                queueLength: queue.length,
            });

            // Update the index
            await set(ref(database, "currentIndex"), index);
            // Ensure it's playing
            await set(ref(database, "isPlaying"), true);

            console.log("Successfully skipped to song");
        } catch (error: any) {
            console.error("Error skipping to song:", error);
            toast.error(error.message || "Failed to skip to song");
        }
    };

    const togglePlayPause = async () => {
        if (!isSynced) {
            // If sync is disabled, only update local state
            setIsPlaying(!isPlaying);
            return;
        }

        try {
            const newIsPlaying = !isPlaying;
            await set(ref(database, "isPlaying"), newIsPlaying);
            console.log("Toggled play/pause:", newIsPlaying);
        } catch (error: any) {
            console.error("Error toggling play/pause:", error);
            toast.error(error.message || "Failed to toggle play/pause");
        }
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
                likeSong,
                dislikeSong,
                getLikeCount,
                getDislikeCount,
                hasLiked,
                hasDisliked,
                username,
                setUsername,
                isSynced,
                toggleSync,
                videoEnabled,
                toggleVideo,
                addComment,
                getComments,
                getLeaderboard,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};
