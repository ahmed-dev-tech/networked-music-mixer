
import React, { useEffect, useRef, useState } from "react";
import { useQueue } from "../contexts/QueueContext";
import { formatYoutubeEmbedUrl } from "../utils/youtubeUtils";
import { Card, CardContent } from "@/components/ui/card";

// Add TypeScript interface for YouTube IFrame API
declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (
                elementId: string,
                options: {
                    videoId: string;
                    playerVars?: {
                        autoplay?: number;
                        controls?: number;
                        enablejsapi?: number;
                        origin?: string;
                    };
                    events?: {
                        onReady?: (event: any) => void;
                        onStateChange?: (event: any) => void;
                    };
                }
            ) => any;
            PlayerState: {
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
                BUFFERING: number;
                CUED: number;
            };
        };
    }
}

const YouTubePlayer: React.FC = () => {
    const { queue, currentSongIndex, playNext, isPlaying, videoEnabled } = useQueue();
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playerReady, setPlayerReady] = useState(false);

    const currentSong = queue[currentSongIndex];

    // Load YouTube IFrame API
    useEffect(() => {
        const loadYouTubeAPI = () => {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        };

        if (!window.YT) {
            loadYouTubeAPI();
        }

        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube IFrame API is ready");
            if (currentSong) {
                initializePlayer();
            }
        };

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (error) {
                    console.error("Error destroying player:", error);
                }
            }
        };
    }, []);

    // Initialize player when song changes
    useEffect(() => {
        if (!currentSong || !containerRef.current) return;

        if (window.YT) {
            initializePlayer();
        }
    }, [currentSong]);

    const initializePlayer = () => {
        if (!currentSong || !containerRef.current) return;

        try {
            // Destroy existing player if it exists
            if (playerRef.current) {
                playerRef.current.destroy();
            }

            // Create a unique ID for the player container
            const playerId = `youtube-player-${currentSong.id}`;
            containerRef.current.id = playerId;

            // Create new player instance
            playerRef.current = new window.YT.Player(playerId, {
                videoId: currentSong.videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event: any) => {
                        console.log("YouTube player is ready");
                        setPlayerReady(true);
                        if (isPlaying) {
                            event.target.playVideo();
                        }
                        // Handle video/audio only mode
                        if (!videoEnabled) {
                            // Hide video by adding CSS
                            const iframe = event.target.getIframe();
                            if (iframe && iframe.style) {
                                iframe.style.opacity = "0";
                            }
                        }
                    },
                    onStateChange: (event: any) => {
                        switch (event.data) {
                            case window.YT.PlayerState.ENDED:
                                console.log("Video ended, playing next");
                                playNext();
                                break;
                            case window.YT.PlayerState.PLAYING:
                                console.log("Video started playing");
                                break;
                            case window.YT.PlayerState.PAUSED:
                                console.log("Video paused");
                                break;
                            case window.YT.PlayerState.BUFFERING:
                                console.log("Video buffering");
                                break;
                            case window.YT.PlayerState.CUED:
                                console.log("Video cued");
                                break;
                        }
                    },
                },
            });
        } catch (error) {
            console.error("Error initializing player:", error);
            setPlayerReady(false);
        }
    };

    // Control player based on isPlaying state
    useEffect(() => {
        if (!playerRef.current || !playerReady) return;

        try {
            if (isPlaying) {
                console.log("Playing video");
                playerRef.current.playVideo();
            } else {
                console.log("Pausing video");
                playerRef.current.pauseVideo();
            }
        } catch (error) {
            console.error("Error controlling player:", error);
            setPlayerReady(false);
        }
    }, [isPlaying, playerReady]);

    // Update video visibility based on videoEnabled state
    useEffect(() => {
        if (!playerRef.current || !playerReady) return;
        
        try {
            const iframe = playerRef.current.getIframe();
            if (iframe && iframe.style) {
                iframe.style.opacity = videoEnabled ? "1" : "0";
            }
        } catch (error) {
            console.error("Error updating video visibility:", error);
        }
    }, [videoEnabled, playerReady]);

    if (!currentSong) {
        return (
            <Card className='player-container w-full aspect-video bg-muted flex items-center justify-center'>
                <CardContent className='p-6 text-center'>
                    <p className='text-muted-foreground'>No videos in queue</p>
                    <p className='text-sm text-muted-foreground mt-2'>
                        Add a YouTube link to get started
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='player-container w-full aspect-video'>
            <div ref={containerRef} className='w-full h-full' />
        </Card>
    );
};

export default YouTubePlayer;
