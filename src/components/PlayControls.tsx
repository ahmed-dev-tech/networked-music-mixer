import React from "react";
import { useQueue } from "../contexts/QueueContext";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const PlayControls: React.FC = () => {
    const {
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        queue,
        currentSongIndex,
        likeSong,
        dislikeSong,
        getLikeCount,
        getDislikeCount,
        hasLiked,
        hasDisliked,
    } = useQueue();

    const currentSong = queue[currentSongIndex];

    // No controls needed if queue is empty
    if (queue.length === 0) {
        return null;
    }

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentSong) {
            await likeSong(currentSong.id);
        }
    };

    const handleDislike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentSong) {
            await dislikeSong(currentSong.id);
        }
    };

    // Calculate like/dislike ratio for the progress bar
    const likes = getLikeCount(currentSong);
    const dislikes = getDislikeCount(currentSong);
    const total = likes + dislikes;
    const likePercentage = total > 0 ? (likes / total) * 100 : 50;

    // Get lists of users who liked and disliked
    const likedUsers = currentSong?.likes
        ? Object.keys(currentSong.likes).filter((key) => currentSong.likes[key])
        : [];
    const dislikedUsers = currentSong?.dislikes
        ? Object.keys(currentSong.dislikes).filter(
              (key) => currentSong.dislikes[key]
          )
        : [];

    return (
        <div className='flex flex-col items-center gap-4 my-4'>
            <div className='flex items-center gap-4'>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={playPrevious}
                    className='h-10 w-10'
                >
                    <SkipBack className='h-6 w-6' />
                </Button>

                <Button
                    variant='default'
                    size='icon'
                    onClick={togglePlayPause}
                    className='h-12 w-12 rounded-full music-gradient'
                >
                    {isPlaying ? (
                        <Pause className='h-6 w-6' />
                    ) : (
                        <Play className='h-6 w-6' />
                    )}
                </Button>

                <Button
                    variant='outline'
                    size='icon'
                    onClick={playNext}
                    className='h-10 w-10'
                >
                    <SkipForward className='h-6 w-6' />
                </Button>

                {currentSong && (
                    <div className='flex items-center gap-4 ml-4'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex flex-col items-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className={`h-10 w-10 ${
                                                hasLiked(currentSong)
                                                    ? "text-green-500"
                                                    : ""
                                            }`}
                                            onClick={handleLike}
                                        >
                                            <ThumbsUp className='h-5 w-5' />
                                        </Button>
                                        <div className='flex items-center gap-1 mt-1'>
                                            <span className='text-xs font-medium text-green-500'>
                                                {likes}
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                                likes
                                            </span>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className='max-w-[200px]'>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-green-500'>
                                            Liked by:
                                        </p>
                                        {likedUsers.length > 0 ? (
                                            <ul className='text-sm'>
                                                {likedUsers.map((user) => (
                                                    <li
                                                        key={user}
                                                        className='text-muted-foreground'
                                                    >
                                                        {user}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className='text-sm text-muted-foreground'>
                                                No likes yet
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex flex-col items-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className={`h-10 w-10 ${
                                                hasDisliked(currentSong)
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                            onClick={handleDislike}
                                        >
                                            <ThumbsDown className='h-5 w-5' />
                                        </Button>
                                        <div className='flex items-center gap-1 mt-1'>
                                            <span className='text-xs font-medium text-red-500'>
                                                {dislikes}
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                                dislikes
                                            </span>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className='max-w-[200px]'>
                                    <div className='space-y-1'>
                                        <p className='font-medium text-red-500'>
                                            Disliked by:
                                        </p>
                                        {dislikedUsers.length > 0 ? (
                                            <ul className='text-sm'>
                                                {dislikedUsers.map((user) => (
                                                    <li
                                                        key={user}
                                                        className='text-muted-foreground'
                                                    >
                                                        {user}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className='text-sm text-muted-foreground'>
                                                No dislikes yet
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>

            {currentSong && (
                <div className='w-full max-w-md px-4'>
                    <div className='h-2 bg-muted rounded-full overflow-hidden flex'>
                        <div
                            className='h-full bg-green-500 transition-all duration-300'
                            style={{
                                width: `${likePercentage}%`,
                            }}
                        />
                        <div
                            className='h-full bg-red-500 transition-all duration-300'
                            style={{
                                width: `${100 - likePercentage}%`,
                            }}
                        />
                    </div>
                    <div className='flex justify-between mt-1'>
                        <span className='text-xs text-green-500 font-medium'>
                            {likes} likes
                        </span>
                        <span className='text-xs text-red-500 font-medium'>
                            {dislikes} dislikes
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayControls;
