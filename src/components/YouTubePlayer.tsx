import React, { useEffect, useRef, useState } from "react";
import { useQueue } from "../contexts/QueueContext";
import { formatYoutubeEmbedUrl } from "../utils/youtubeUtils";
import { Card, CardContent } from "@/components/ui/card";

const YouTubePlayer: React.FC = () => {
    const { queue, currentSongIndex, playNext, isPlaying } = useQueue();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [playerReady, setPlayerReady] = useState(false);

    const currentSong = queue[currentSongIndex];

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== "https://www.youtube.com") return;

            try {
                const data = JSON.parse(event.data);
                console.log("YouTube player message:", data);

                if (data.event === "onReady") {
                    console.log("YouTube player is ready");
                    setPlayerReady(true);
                }

                // YouTube video ended
                if (data.event === "onStateChange") {
                    switch (data.info) {
                        case 0: // Video ended
                            console.log("Video ended, playing next");
                            playNext();
                            break;
                        case 1: // Video playing
                            console.log("Video started playing");
                            break;
                        case 2: // Video paused
                            console.log("Video paused");
                            break;
                        case 3: // Video buffering
                            console.log("Video buffering");
                            break;
                        case 5: // Video cued
                            console.log("Video cued");
                            break;
                    }
                }
            } catch (e) {
                // Not a parseable message
                console.log(
                    "Non-parseable message from YouTube player:",
                    event.data
                );
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [playNext]);

    // Control player based on isPlaying state
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !playerReady) return;

        try {
            if (isPlaying) {
                console.log("Sending play command to YouTube player");
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    "*"
                );
            } else {
                console.log("Sending pause command to YouTube player");
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    "*"
                );
            }
        } catch (e) {
            console.error("Error controlling YouTube player:", e);
        }
    }, [isPlaying, playerReady]);

    // Update video when currentSong changes
    useEffect(() => {
        if (currentSong) {
            console.log("Current song changed:", currentSong);
            setPlayerReady(false); // Reset player ready state when song changes
        }
    }, [currentSong]);

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
            <iframe
                ref={iframeRef}
                src={`${formatYoutubeEmbedUrl(
                    currentSong.videoId
                )}?enablejsapi=1&origin=${
                    window.location.origin
                }&autoplay=1&controls=1`}
                className='w-full h-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
            />
        </Card>
    );
};

export default YouTubePlayer;
