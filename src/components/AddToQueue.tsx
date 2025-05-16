import React, { useState } from "react";
import { useQueue } from "../contexts/QueueContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Music } from "lucide-react";

const AddToQueue: React.FC = () => {
    const { addToQueue } = useQueue();
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            toast.error("Please enter a YouTube URL");
            return;
        }

        setIsLoading(true);
        try {
            await addToQueue(url);
            setUrl(""); // Clear input after successful addition
        } catch (error) {
            console.error("Error adding to queue:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex gap-2'>
            <Input
                type='text'
                placeholder='Paste YouTube URL here...'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='flex-1'
                disabled={isLoading}
            />
            <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                    "Adding..."
                ) : (
                    <>
                        <Music className='w-4 h-4 mr-2' />
                        Add to Queue
                    </>
                )}
            </Button>
        </form>
    );
};

export default AddToQueue;
