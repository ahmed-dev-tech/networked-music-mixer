
import React, { useState } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const AddToQueue: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToQueue } = useQueue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await addToQueue(url.trim());
      setUrl(''); // Clear the input on success
    } catch (error) {
      console.error('Error adding to queue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <Input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL here"
        className="flex-1"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        disabled={isSubmitting || !url.trim()} 
        className="music-gradient"
      >
        Add to Queue
      </Button>
    </form>
  );
};

export default AddToQueue;
