import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

interface UsernameDialogProps {
    isOpen: boolean;
    onSubmit: (username: string) => void;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({
    isOpen,
    onSubmit,
}) => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.error("Please enter a username");
            return;
        }

        setIsLoading(true);
        try {
            onSubmit(username.trim());
            toast.success("Username set successfully");
        } catch (error) {
            console.error("Error setting username:", error);
            toast.error("Failed to set username");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Welcome to Music App</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <label
                            htmlFor='username'
                            className='text-sm font-medium'
                        >
                            Enter your username
                        </label>
                        <Input
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='Username'
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>
                    <Button
                        type='submit'
                        className='w-full'
                        disabled={isLoading}
                    >
                        {isLoading ? "Setting..." : "Start Listening"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UsernameDialog;
