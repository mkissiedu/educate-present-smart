import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, Users, MessageSquare, Settings } from 'lucide-react';
import { JitsiMeetConfig } from '@/types/professional-development';

interface JitsiMeetRoomProps {
  config: JitsiMeetConfig;
  onClose: () => void;
  onJoined?: () => void;
  onLeft?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeetRoom: React.FC<JitsiMeetRoomProps> = ({
  config,
  onClose,
  onJoined,
  onLeft
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(config.startWithAudioMuted || false);
  const [isVideoMuted, setIsVideoMuted] = useState(config.startWithVideoMuted || false);
  const [participantCount, setParticipantCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Jitsi Meet External API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: config.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: config.displayName,
        email: config.email
      },
      configOverwrite: {
        startWithAudioMuted: config.startWithAudioMuted || false,
        startWithVideoMuted: config.startWithVideoMuted || false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        enableClosePage: false,
        defaultLanguage: 'en',
        toolbarButtons: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'participants-pane',
          'tileview',
          'select-background',
          'download',
          'help',
          'mute-everyone',
          'security'
        ]
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        MOBILE_APP_PROMO: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        DEFAULT_BACKGROUND: '#1a1a2e',
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        DISABLE_FOCUS_INDICATOR: false,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: false
      }
    };

    if (config.password) {
      options.configOverwrite.roomPassword = config.password;
    }

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      apiRef.current.addListener('videoConferenceJoined', () => {
        setIsLoading(false);
        onJoined?.();
        
        // Set subject/topic if provided
        if (config.subject) {
          apiRef.current.executeCommand('subject', config.subject);
        }
      });

      apiRef.current.addListener('videoConferenceLeft', () => {
        onLeft?.();
        onClose();
      });

      apiRef.current.addListener('participantJoined', () => {
        updateParticipantCount();
      });

      apiRef.current.addListener('participantLeft', () => {
        updateParticipantCount();
      });

      apiRef.current.addListener('audioMuteStatusChanged', (data: { muted: boolean }) => {
        setIsAudioMuted(data.muted);
      });

      apiRef.current.addListener('videoMuteStatusChanged', (data: { muted: boolean }) => {
        setIsVideoMuted(data.muted);
      });

      apiRef.current.addListener('readyToClose', () => {
        onClose();
      });

    } catch (error) {
      console.error('Failed to initialize Jitsi Meet:', error);
      setIsLoading(false);
    }
  };

  const updateParticipantCount = () => {
    if (apiRef.current) {
      const participants = apiRef.current.getParticipantsInfo();
      setParticipantCount(participants.length);
    }
  };

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleChat = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleChat');
    }
  };

  const toggleParticipants = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleParticipantsPane');
    }
  };

  const hangUp = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900 flex flex-col ${isFullscreen ? '' : ''}`}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">{config.subject || 'Live Session'}</h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChat}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleParticipants}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Joining meeting...</p>
              <p className="text-slate-400 text-sm mt-2">Please allow camera and microphone access</p>
            </div>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 flex items-center justify-center gap-4">
        <Button
          variant={isAudioMuted ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        
        <Button
          variant={isVideoMuted ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={hangUp}
          className="rounded-full px-8"
        >
          Leave Meeting
        </Button>
      </div>
    </div>
  );
};

export default JitsiMeetRoom;
