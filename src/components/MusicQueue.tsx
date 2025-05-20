import React from "react";
import { useQueue } from "@/contexts/QueueContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const MusicQueue: React.FC = () => {
    const { queue, removeFromQueue, currentSongIndex, skipTo, isSynced } =
        useQueue();

    if (queue.length === 0) {
        return (
            <Card>
                <CardContent className='p-4'>
                    <p className='text-muted-foreground text-center'>
                        Queue is empty
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-2'>
            {queue.map((song, index) => (
                <Card
                    key={song.id}
                    className={`${
                        index === currentSongIndex
                            ? "border-primary"
                            : "border-muted"
                    } cursor-pointer hover:border-primary/50 transition-colors`}
                    onClick={() => skipTo(index)}
                >
                    <CardContent className='p-4'>
                        <div className='flex items-start gap-4'>
                            <img
                                src={song.thumbnail}
                                alt={song.title}
                                className='w-16 h-12 object-cover rounded'
                            />
                            <div className='flex-1 min-w-0'>
                                <h3 className='font-medium truncate'>
                                    {song.title}
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Added by {song.addedBy}
                                </p>
                            </div>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromQueue(song.id);
                                }}
                                className='shrink-0'
                            >
                                <Trash2 className='h-4 w-4' />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default MusicQueue;
