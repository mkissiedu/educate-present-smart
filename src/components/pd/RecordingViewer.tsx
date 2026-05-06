import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack,
  SkipForward, Clock, Calendar, Users, CheckCircle, Eye
} from 'lucide-react';
import { PDWebinar, PDRecordingView } from '@/types/professional-development';
import {
  recordRecordingView,
  updateRecordingViewProgress,
  getRecordingView
} from '@/lib/supabase-pd';

interface RecordingViewerProps {
  webinar: PDWebinar;
  onClose: () => void;
}

export const RecordingViewer: React.FC<RecordingViewerProps> = ({ webinar, onClose }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [viewRecord, setViewRecord] = useState<PDRecordingView | null>(null);
  const [watchStartTime, setWatchStartTime] = useState<number>(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.id) {
      initializeView();
    }
    return () => {
      // Save progress on unmount
      saveProgress();
    };
  }, [user?.id]);

  const initializeView = async () => {
    if (!user?.id) return;
    try {
      // Record that the user started viewing
      const view = await recordRecordingView(webinar.id, user.id, user.school_id);
      setViewRecord(view);
      setWatchStartTime(Date.now());
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const saveProgress = async () => {
    if (!viewRecord || !user?.id) return;
    try {
      const watchedSeconds = Math.round((Date.now() - watchStartTime) / 1000);
      const totalWatchTime = viewRecord.total_watch_time_seconds + watchedSeconds;
      const completed = duration > 0 && currentTime >= duration * 0.9; // 90% watched = completed
      
      await updateRecordingViewProgress(viewRecord.id, totalWatchTime, completed);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    if (viewRecord && user?.id) {
      try {
        const watchedSeconds = Math.round((Date.now() - watchStartTime) / 1000);
        await updateRecordingViewProgress(
          viewRecord.id,
          viewRecord.total_watch_time_seconds + watchedSeconds,
          true
        );
      } catch (error) {
        console.error('Error marking as completed:', error);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if URL is a video or external link (YouTube, Vimeo, etc.)
  const isExternalVideo = webinar.recording_url?.includes('youtube.com') ||
    webinar.recording_url?.includes('youtu.be') ||
    webinar.recording_url?.includes('vimeo.com');

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white font-semibold text-lg">{webinar.title}</h2>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(webinar.scheduled_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {webinar.duration_minutes} min
                </span>
                <Badge variant="outline" className="text-white border-white/50 capitalize">
                  {webinar.meeting_type}
                </Badge>
              </div>
            </div>
          </div>
          {viewRecord?.completed && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div 
        className="flex-1 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onClick={handlePlayPause}
      >
        {isExternalVideo ? (
          <iframe
            src={getEmbedUrl(webinar.recording_url!)}
            className="w-full h-full max-w-5xl max-h-[80vh]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={webinar.recording_url}
            className="max-w-full max-h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster={webinar.recording_thumbnail_url}
          />
        )}
      </div>

      {/* Controls - Only for direct video files */}
      {!isExternalVideo && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-white/70 text-xs mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleSkip(-10); }}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                className="text-white hover:bg-white/20 w-12 h-12"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleSkip(10); }}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Description Panel (for external videos) */}
      {isExternalVideo && webinar.recording_description && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white/80 text-sm max-w-3xl">{webinar.recording_description}</p>
        </div>
      )}
    </div>
  );
};

export default RecordingViewer;
