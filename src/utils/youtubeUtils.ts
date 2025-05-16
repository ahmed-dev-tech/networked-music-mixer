
// Extract YouTube video ID from URL
export const extractVideoId = (url: string): string | null => {
  // Handle both standard and shortened URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Validate YouTube URL
export const isValidYoutubeUrl = (url: string): boolean => {
  return !!extractVideoId(url);
};

// Generate thumbnail URL from video ID
export const getYoutubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

// Format a YouTube URL to embed URL
export const formatYoutubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};
