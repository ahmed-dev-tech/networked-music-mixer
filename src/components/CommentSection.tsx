
import React, { useState } from "react";
import { useQueue } from "@/contexts/QueueContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Comment } from "@/types/queue";
import type { Song } from "@/types/queue";

interface CommentSectionProps {
    song: Song;
}

const CommentSection: React.FC<CommentSectionProps> = ({ song }) => {
    const [commentText, setCommentText] = useState("");
    const { addComment, getComments, username } = useQueue();
    const { toast } = useToast();
    const comments = getComments(song);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!commentText.trim()) {
            toast({
                title: "Comment cannot be empty",
                variant: "destructive",
            });
            return;
        }
        
        if (!username) {
            toast({
                title: "You need to set a username first",
                variant: "destructive",
            });
            return;
        }
        
        await addComment(song.id, commentText);
        setCommentText("");
        toast({
            title: "Comment added",
            description: "Your comment has been added to the song",
        });
    };
    
    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Comments</span>
                    <span className="text-sm text-muted-foreground">
                        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                    <Input
                        placeholder={username ? "Add a comment..." : "Set username to comment..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={!username}
                        className="flex-1"
                        maxLength={200}
                    />
                    <Button type="submit" disabled={!username || !commentText.trim()}>
                        Comment
                    </Button>
                </form>
                
                {comments.length > 0 ? (
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <Card key={comment.id} className="comment-card bg-secondary">
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium">{comment.username}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimestamp(comment.timestamp)}
                                            </span>
                                        </div>
                                        <p className="mt-1 break-words">{comment.text}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No comments yet</p>
                        <p className="text-sm mt-1">Be the first to comment!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CommentSection;
