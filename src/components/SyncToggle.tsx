
import React from "react";
import { useQueue } from "@/contexts/QueueContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, Video, VideoOff } from "lucide-react";

const SyncToggle: React.FC = () => {
    const { isSynced, toggleSync, videoEnabled, toggleVideo } = useQueue();

    return (
        <div className='flex items-center gap-4'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className='flex items-center gap-2'>
                            <Switch
                                id='sync-mode'
                                checked={isSynced}
                                onCheckedChange={toggleSync}
                            />
                            <Label
                                htmlFor='sync-mode'
                                className='flex items-center gap-2'
                            >
                                <Users className='h-4 w-4' />
                                <span>Party Mode</span>
                            </Label>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {isSynced
                                ? "Your controls will affect everyone"
                                : "Your controls will only affect your view"}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {!isSynced && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='flex items-center gap-2'>
                                <Switch
                                    id='video-mode'
                                    checked={videoEnabled}
                                    onCheckedChange={toggleVideo}
                                />
                                <Label
                                    htmlFor='video-mode'
                                    className='flex items-center gap-2'
                                >
                                    {videoEnabled ? (
                                        <Video className='h-4 w-4' />
                                    ) : (
                                        <VideoOff className='h-4 w-4' />
                                    )}
                                    <span>Video</span>
                                </Label>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {videoEnabled
                                    ? "Video is enabled"
                                    : "Audio only mode"}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};

export default SyncToggle;
