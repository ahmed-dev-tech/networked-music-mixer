import React from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import PlayControls from "@/components/PlayControls";
import MusicQueue from "@/components/MusicQueue";
import AddToQueue from "@/components/AddToQueue";
import UsernameDialog from "@/components/UsernameDialog";
import SyncToggle from "@/components/SyncToggle";
import { QueueProvider, useQueue } from "@/contexts/QueueContext";

const IndexContent: React.FC = () => {
    const { username, setUsername } = useQueue();
    const [showUsernameDialog, setShowUsernameDialog] = React.useState(false);

    React.useEffect(() => {
        // Only show dialog if there's no username in localStorage
        setShowUsernameDialog(!localStorage.getItem("musicAppUsername"));
    }, []);

    return (
        <>
            <UsernameDialog
                isOpen={showUsernameDialog}
                onSubmit={(newUsername) => {
                    setUsername(newUsername);
                    setShowUsernameDialog(false);
                }}
            />
            <div className='min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8'>
                <div className='max-w-screen-xl mx-auto'>
                    <header className='mb-8 text-center'>
                        <h1 className='text-3xl font-bold tracking-tight music-gradient bg-clip-text'>
                            Music App
                        </h1>
                        <p className='mt-2 text-muted-foreground'>
                            Share YouTube links and listen together
                        </p>
                        <div className='mt-4 flex justify-center'>
                            <SyncToggle />
                        </div>
                    </header>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        <div className='lg:col-span-2 space-y-6'>
                            <YouTubePlayer />
                            <PlayControls />
                            <AddToQueue />
                        </div>

                        <div className='space-y-4'>
                            <h2 className='text-lg font-semibold flex items-center gap-2'>
                                Play Queue
                            </h2>
                            <MusicQueue />
                        </div>
                    </div>

                    <footer className='mt-12 pt-6 border-t border-muted text-center text-sm text-muted-foreground'>
                        <p>
                            Everyone on your network can see and add to this
                            queue
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

const Index: React.FC = () => {
    return (
        <QueueProvider>
            <IndexContent />
        </QueueProvider>
    );
};

export default Index;
