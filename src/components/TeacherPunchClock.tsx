import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentLocation,
  getSchoolGateLocation,
  getTodayPunchRecord,
  uploadPunchPhoto,
  punchIn,
  punchOut,
  calculateDistance,
} from '@/lib/supabase-punch-clock';
import { PunchClockRecord, GeoLocation, SchoolGateLocation } from '@/types/punch-clock';
import {
  MapPin,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  AlertTriangle,
  Navigation,
  RefreshCw,
  X,
} from 'lucide-react';

interface TeacherPunchClockProps {
  onClose?: () => void;
  compact?: boolean;
}

export const TeacherPunchClock: React.FC<TeacherPunchClockProps> = ({ onClose, compact = false }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [todayRecord, setTodayRecord] = useState<PunchClockRecord | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [schoolGate, setSchoolGate] = useState<SchoolGateLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distanceFromGate, setDistanceFromGate] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
    };
  }, [user?.id, currentSchool?.id]);

  const loadData = async () => {
    if (!user?.id || !currentSchool?.id) return;
    setLoading(true);

    try {
      const [record, gateLocation] = await Promise.all([
        getTodayPunchRecord(user.id),
        getSchoolGateLocation(currentSchool.id),
      ]);

      setTodayRecord(record);
      setSchoolGate(gateLocation);

      // Get current location
      await refreshLocation();
    } catch (error) {
      console.error('Error loading punch clock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      if (schoolGate) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          schoolGate.latitude,
          schoolGate.longitude
        );
        setDistanceFromGate(Math.round(distance));
      }
    } catch (error: any) {
      setLocationError(error.message);
      setCurrentLocation(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.8));
          stopCamera();
        }
      },
      'image/jpeg',
      0.8
    );
  }, []);

  const handleStartPunch = (type: 'in' | 'out') => {
    setPunchType(type);
    setCapturedPhoto(null);
    setCapturedBlob(null);
    setShowCamera(true);
    setTimeout(startCamera, 100);
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
    startCamera();
  };

  const handleCancelCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedPhoto(null);
    setCapturedBlob(null);
  };

  const handleConfirmPunch = async () => {
    if (!user?.id || !currentSchool?.id || !currentLocation || !schoolGate || !capturedBlob) {
      toast({
        title: 'Error',
        description: 'Missing required data. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Upload photo
      const photoUrl = await uploadPunchPhoto(user.id, capturedBlob, punchType);
      if (!photoUrl) {
        throw new Error('Failed to upload photo');
      }

      // Perform punch
      let result;
      if (punchType === 'in') {
        // Pass teacher name and school name for late arrival notifications
        result = await punchIn(
          user.id, 
          currentSchool.id, 
          currentLocation, 
          photoUrl, 
          schoolGate,
          user.name,
          currentSchool.name
        );
      } else {
        result = await punchOut(user.id, currentLocation, photoUrl, schoolGate);
      }

      if (result.success && result.record) {
        setTodayRecord(result.record);
        const isVerified = punchType === 'in' ? result.record.punch_in_verified : result.record.punch_out_verified;
        
        // Check if late arrival
        if (punchType === 'in' && result.isLate) {
          toast({
            title: `Punch In Successful - Late Arrival`,
            description: `You arrived ${result.minutesLate} minutes late. Your attendance has been recorded.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: `Punch ${punchType === 'in' ? 'In' : 'Out'} Successful!`,
            description: isVerified
              ? 'Your attendance has been verified.'
              : `Location not verified. You were ${Math.round(distanceFromGate || 0)}m from the school gate.`,
            variant: isVerified ? 'default' : 'destructive',
          });
        }
      } else {
        throw new Error(result.error || 'Failed to record attendance');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record attendance',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setShowCamera(false);
      setCapturedPhoto(null);
      setCapturedBlob(null);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Strict 10-meter radius check for admin office
  const MAX_ALLOWED_RADIUS = 10;
  const effectiveRadius = schoolGate ? Math.min(schoolGate.radius_meters, MAX_ALLOWED_RADIUS) : MAX_ALLOWED_RADIUS;
  const isWithinRange = distanceFromGate !== null && distanceFromGate <= effectiveRadius;
  const hasPunchedIn = !!todayRecord?.punch_in_time;
  const hasPunchedOut = !!todayRecord?.punch_out_time;

  if (loading) {
    return (
      <Card className={`${compact ? 'bg-white/10 border-white/20' : 'bg-white'}`}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className={`w-8 h-8 animate-spin ${compact ? 'text-white' : 'text-blue-600'}`} />
        </CardContent>
      </Card>
    );
  }

  // Camera view
  if (showCamera) {
    return (

      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-black/80">
          <h2 className="text-white font-bold text-lg">
            {punchType === 'in' ? 'Punch In' : 'Punch Out'} - Take Selfie
          </h2>
          <Button variant="ghost" size="icon" onClick={handleCancelCamera}>
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center bg-black relative">
          {!capturedPhoto ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img src={capturedPhoto} alt="Captured" className="max-w-full max-h-full object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Location info */}
        <div className="p-4 bg-black/80">
          <div className="flex items-center gap-2 text-white mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {currentLocation
                ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                : 'Location unavailable'}
            </span>
          </div>
          {distanceFromGate !== null && (
            <div className={`flex items-center gap-2 ${isWithinRange ? 'text-green-400' : 'text-red-400'}`}>
              <Navigation className="w-4 h-4" />
              <span className="text-sm">
                {distanceFromGate}m from admin office
                {isWithinRange ? ' (Within 10m range)' : ` (Must be within ${effectiveRadius}m)`}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-black/90 flex gap-3">
          {!capturedPhoto ? (
            <Button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              Capture Photo
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRetakePhoto}
                className="flex-1 h-14 border-white/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleConfirmPunch}
                disabled={processing || !isWithinRange}
                className={`flex-1 h-14 text-lg ${
                  punchType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : punchType === 'in' ? (
                  <LogIn className="w-5 h-5 mr-2" />
                ) : (
                  <LogOut className="w-5 h-5 mr-2" />
                )}
                {processing ? 'Processing...' : `Confirm Punch ${punchType === 'in' ? 'In' : 'Out'}`}
              </Button>
            </>
          )}
        </div>

        {!isWithinRange && capturedPhoto && (
          <div className="p-3 bg-red-600/90 text-white text-center text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            You must be within {effectiveRadius}m of the admin office to punch {punchType}.
          </div>
        )}
      </div>
    );
  }


  return (
    <Card className={`${compact ? 'bg-white/10 border-white/20' : 'bg-white shadow-lg'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-white text-lg' : 'text-gray-900'}`}>
            <Clock className="w-5 h-5" />
            Attendance Clock
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className={compact ? 'text-white' : ''}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <p className={`text-sm ${compact ? 'text-white/70' : 'text-gray-500'}`}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* School gate not configured warning */}
        {!schoolGate && (
          <div className={`p-3 rounded-lg ${compact ? 'bg-amber-500/20' : 'bg-amber-50'} border border-amber-500/30`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`font-medium ${compact ? 'text-amber-400' : 'text-amber-700'}`}>
                  School Gate Location Not Set
                </p>
                <p className={`text-sm ${compact ? 'text-amber-400/80' : 'text-amber-600'}`}>
                  Please ask your administrator to configure the school gate location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location status */}
        <div className={`p-3 rounded-lg ${compact ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${compact ? 'text-white/80' : 'text-gray-600'}`}>
              Your Location
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshLocation}
              className={`h-7 ${compact ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}`}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>

          {locationError ? (
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{locationError}</span>
            </div>
          ) : currentLocation ? (
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${compact ? 'text-white/70' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-mono">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
              {distanceFromGate !== null && schoolGate && (
                <div className={`flex items-center gap-2 ${isWithinRange ? 'text-green-500' : 'text-red-500'}`}>
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {distanceFromGate}m from school gate
                  </span>
                  <Badge variant={isWithinRange ? 'default' : 'destructive'} className="text-xs">
                    {isWithinRange ? 'In Range' : 'Out of Range'}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center gap-2 ${compact ? 'text-white/50' : 'text-gray-400'}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting location...</span>
            </div>
          )}
        </div>

        {/* Today's status */}
        <div className="grid grid-cols-2 gap-3">
          {/* Punch In Status */}
          <div className={`p-3 rounded-lg ${compact ? 'bg-white/5' : 'bg-green-50'} border ${
            hasPunchedIn ? (todayRecord?.punch_in_verified ? 'border-green-500' : 'border-amber-500') : 'border-transparent'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <LogIn className={`w-4 h-4 ${hasPunchedIn ? 'text-green-500' : compact ? 'text-white/50' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${compact ? 'text-white/80' : 'text-gray-700'}`}>
                Punch In
              </span>
            </div>
            <div className={`text-xl font-bold ${hasPunchedIn ? 'text-green-600' : compact ? 'text-white/30' : 'text-gray-300'}`}>
              {formatTime(todayRecord?.punch_in_time)}
            </div>
            {hasPunchedIn && (
              <div className="flex items-center gap-1 mt-1">
                {todayRecord?.punch_in_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
                <span className={`text-xs ${todayRecord?.punch_in_verified ? 'text-green-600' : 'text-amber-600'}`}>
                  {todayRecord?.punch_in_verified ? 'Verified' : `${todayRecord?.punch_in_distance_meters}m away`}
                </span>
              </div>
            )}
          </div>

          {/* Punch Out Status */}
          <div className={`p-3 rounded-lg ${compact ? 'bg-white/5' : 'bg-orange-50'} border ${
            hasPunchedOut ? (todayRecord?.punch_out_verified ? 'border-green-500' : 'border-amber-500') : 'border-transparent'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <LogOut className={`w-4 h-4 ${hasPunchedOut ? 'text-orange-500' : compact ? 'text-white/50' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${compact ? 'text-white/80' : 'text-gray-700'}`}>
                Punch Out
              </span>
            </div>
            <div className={`text-xl font-bold ${hasPunchedOut ? 'text-orange-600' : compact ? 'text-white/30' : 'text-gray-300'}`}>
              {formatTime(todayRecord?.punch_out_time)}
            </div>
            {hasPunchedOut && (
              <div className="flex items-center gap-1 mt-1">
                {todayRecord?.punch_out_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
                <span className={`text-xs ${todayRecord?.punch_out_verified ? 'text-green-600' : 'text-amber-600'}`}>
                  {todayRecord?.punch_out_verified ? 'Verified' : `${todayRecord?.punch_out_distance_meters}m away`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!hasPunchedIn ? (
            <Button
              onClick={() => handleStartPunch('in')}
              disabled={!currentLocation || !schoolGate}
              className="flex-1 bg-green-600 hover:bg-green-700 h-12"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Punch In
            </Button>
          ) : !hasPunchedOut ? (
            <Button
              onClick={() => handleStartPunch('out')}
              disabled={!currentLocation || !schoolGate}
              className="flex-1 bg-orange-600 hover:bg-orange-700 h-12"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Punch Out
            </Button>
          ) : (
            <div className={`flex-1 text-center py-3 rounded-lg ${compact ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <span className={`text-sm font-medium ${compact ? 'text-green-400' : 'text-green-700'}`}>
                Attendance Complete for Today
              </span>
            </div>
          )}
        </div>

        {/* Photos preview */}
        {(todayRecord?.punch_in_photo_url || todayRecord?.punch_out_photo_url) && (
          <div className="grid grid-cols-2 gap-3">
            {todayRecord?.punch_in_photo_url && (
              <div>
                <p className={`text-xs mb-1 ${compact ? 'text-white/60' : 'text-gray-500'}`}>Punch In Photo</p>
                <img
                  src={todayRecord.punch_in_photo_url}
                  alt="Punch in"
                  className="w-full h-20 object-cover rounded-lg"
                />
              </div>
            )}
            {todayRecord?.punch_out_photo_url && (
              <div>
                <p className={`text-xs mb-1 ${compact ? 'text-white/60' : 'text-gray-500'}`}>Punch Out Photo</p>
                <img
                  src={todayRecord.punch_out_photo_url}
                  alt="Punch out"
                  className="w-full h-20 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherPunchClock;
