
import React, { useEffect, useRef } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { formatYoutubeEmbedUrl } from '../utils/youtubeUtils';
import { Card, CardContent } from '@/components/ui/card';

const YouTubePlayer: React.FC = () => {
  const { queue, currentSongIndex, playNext, isPlaying } = useQueue();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const currentSong = queue[currentSongIndex];

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = JSON.parse(event.data);
        
        // YouTube video ended
        if (data.event === 'onStateChange' && data.info === 0) {
          playNext();
        }
      } catch (e) {
        // Not a parseable message
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playNext]);

  // Control player based on isPlaying state
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      if (isPlaying) {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    } catch (e) {
      console.error("Error controlling YouTube player:", e);
    }
  }, [isPlaying]);

  if (!currentSong) {
    return (
      <Card className="player-container w-full aspect-video bg-muted flex items-center justify-center">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No videos in queue</p>
          <p className="text-sm text-muted-foreground mt-2">Add a YouTube link to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="player-container w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video w-full">
          <iframe
            ref={iframeRef}
            src={`${formatYoutubeEmbedUrl(currentSong.videoId)}?autoplay=1&enablejsapi=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;
