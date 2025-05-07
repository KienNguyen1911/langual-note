import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  useEffect(() => {
    // Check if Picture-in-Picture is supported
    if (document.pictureInPictureEnabled || 
        (document as any).webkitPictureInPictureEnabled) {
      setIsPipSupported(true);
    }

    // Add event listeners for PiP state changes
    const video = videoRef.current;
    if (video) {
      video.addEventListener('enterpictureinpicture', () => setIsPipActive(true));
      video.addEventListener('leavepictureinpicture', () => setIsPipActive(false));
    }

    return () => {
      // Clean up event listeners
      if (video) {
        video.removeEventListener('enterpictureinpicture', () => setIsPipActive(true));
        video.removeEventListener('leavepictureinpicture', () => setIsPipActive(false));
      }
    };
  }, []);

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Failed to toggle Picture-in-Picture mode:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📺 Video Player</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <video
            ref={videoRef}
            controls
            className="w-full rounded-md"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
          >
            Your browser does not support the video tag.
          </video>
          
          {isPipSupported ? (
            <Button 
              onClick={togglePictureInPicture}
              className="w-full"
            >
              {isPipActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Picture-in-Picture is not supported in your browser.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Picture-in-Picture allows you to watch videos in a floating window that stays on top of other windows.
        </p>
      </CardFooter>
    </Card>
  );
}