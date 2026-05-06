import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  getSchoolGateLocation,
  updateSchoolGateLocation,
  getCurrentLocation,
  getSchoolAttendanceSettings,
  updateSchoolAttendanceSettings,
} from '@/lib/supabase-punch-clock';
import { GeoLocation, SchoolGateLocation, SchoolAttendanceSettings } from '@/types/punch-clock';
import {
  MapPin,
  Settings,
  Clock,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
  Navigation,
  Save,
  AlertTriangle,
  Fingerprint,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  Building,
} from 'lucide-react';

interface SetupStatus {
  officeLocation: boolean;
  lateThreshold: boolean;
  earlyDeparture: boolean;
  notifications: boolean;
}

// Default radius for admin office - 10 meters (strict geofencing)
const DEFAULT_ADMIN_OFFICE_RADIUS = 10;

export const PunchClockSetup: React.FC = () => {
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Admin Office Location State
  const [officeLocation, setOfficeLocation] = useState<SchoolGateLocation | null>(null);
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newRadius, setNewRadius] = useState(DEFAULT_ADMIN_OFFICE_RADIUS.toString());
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Attendance Settings State
  const [lateThresholdTime, setLateThresholdTime] = useState('08:00');
  const [earlyDepartureTime, setEarlyDepartureTime] = useState('16:00');
  const [workStartTime, setWorkStartTime] = useState('07:30');
  const [workEndTime, setWorkEndTime] = useState('16:30');
  
  // Notification Settings State
  const [lateNotificationEnabled, setLateNotificationEnabled] = useState(true);
  const [adminNotificationPhone, setAdminNotificationPhone] = useState('');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('');
  const [notifyOnAbsence, setNotifyOnAbsence] = useState(false);
  const [notifyOnEarlyDeparture, setNotifyOnEarlyDeparture] = useState(false);

  // Setup Status
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    officeLocation: false,
    lateThreshold: false,
    earlyDeparture: false,
    notifications: false,
  });

  useEffect(() => {
    if (currentSchool?.id) loadData();
  }, [currentSchool?.id]);

  const loadData = async () => {
    if (!currentSchool?.id) return;
    setLoading(true);

    try {
      const [locationData, settings] = await Promise.all([
        getSchoolGateLocation(currentSchool.id),
        getSchoolAttendanceSettings(currentSchool.id),
      ]);

      // Load admin office location
      if (locationData) {
        setOfficeLocation(locationData);
        setNewLatitude(locationData.latitude.toString());
        setNewLongitude(locationData.longitude.toString());
        setNewRadius(locationData.radius_meters.toString());
      }

      // Load attendance settings
      if (settings) {
        setLateThresholdTime(settings.late_threshold_time?.slice(0, 5) || '08:00');
        setEarlyDepartureTime(settings.early_departure_time?.slice(0, 5) || '16:00');
        setLateNotificationEnabled(settings.late_notification_enabled ?? true);
        setAdminNotificationPhone(settings.admin_notification_phone || '');
        setAdminNotificationEmail(settings.admin_notification_email || '');
      }

      // Load additional settings from school record
      const { data: schoolData } = await supabase
        .from('schools')
        .select('work_start_time, work_end_time, notify_on_absence, notify_on_early_departure')
        .eq('id', currentSchool.id)
        .single();

      if (schoolData) {
        setWorkStartTime(schoolData.work_start_time?.slice(0, 5) || '07:30');
        setWorkEndTime(schoolData.work_end_time?.slice(0, 5) || '16:30');
        setNotifyOnAbsence(schoolData.notify_on_absence ?? false);
        setNotifyOnEarlyDeparture(schoolData.notify_on_early_departure ?? false);
      }

      // Calculate setup status
      setSetupStatus({
        officeLocation: !!locationData,
        lateThreshold: !!settings?.late_threshold_time,
        earlyDeparture: !!settings?.early_departure_time,
        notifications: !!settings?.admin_notification_phone || !!settings?.admin_notification_email,
      });

    } catch (error) {
      console.error('Error loading punch clock settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setNewLatitude(location.latitude.toString());
      setNewLongitude(location.longitude.toString());
      toast({
        title: 'Location Captured',
        description: 'Your current location has been captured. Click Save to update.',
      });
    } catch (error: any) {
      toast({
        title: 'Location Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSaveOfficeLocation = async () => {
    if (!currentSchool?.id || !newLatitude || !newLongitude) return;

    setSaving(true);
    try {
      const location: GeoLocation = {
        latitude: parseFloat(newLatitude),
        longitude: parseFloat(newLongitude),
      };

      // Enforce maximum 10 meters radius
      const radiusValue = Math.min(parseInt(newRadius) || DEFAULT_ADMIN_OFFICE_RADIUS, 10);

      const success = await updateSchoolGateLocation(
        currentSchool.id,
        location,
        radiusValue
      );

      if (success) {
        setOfficeLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          radius_meters: radiusValue,
        });
        setNewRadius(radiusValue.toString());
        setSetupStatus(prev => ({ ...prev, officeLocation: true }));
        toast({
          title: 'Admin Office Location Saved',
          description: `Teachers can now punch in/out within ${radiusValue}m of the admin office.`,
        });
      } else {
        throw new Error('Failed to update location');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save office location',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAttendanceSettings = async () => {
    if (!currentSchool?.id) return;

    setSaving(true);
    try {
      const success = await updateSchoolAttendanceSettings(currentSchool.id, {
        late_threshold_time: lateThresholdTime + ':00',
        early_departure_time: earlyDepartureTime + ':00',
        late_notification_enabled: lateNotificationEnabled,
        admin_notification_phone: adminNotificationPhone || undefined,
        admin_notification_email: adminNotificationEmail || undefined,
      });

      await supabase
        .from('schools')
        .update({
          work_start_time: workStartTime + ':00',
          work_end_time: workEndTime + ':00',
          notify_on_absence: notifyOnAbsence,
          notify_on_early_departure: notifyOnEarlyDeparture,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSchool.id);

      if (success) {
        setSetupStatus(prev => ({
          ...prev,
          lateThreshold: true,
          earlyDeparture: true,
          notifications: !!adminNotificationPhone || !!adminNotificationEmail,
        }));
        toast({
          title: 'Settings Saved',
          description: 'Attendance settings have been updated successfully.',
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const completedSteps = Object.values(setupStatus).filter(Boolean).length;
  const totalSteps = Object.keys(setupStatus).length;
  const setupProgress = Math.round((completedSteps / totalSteps) * 100);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Fingerprint className="w-7 h-7" />
            Punch Clock Setup
          </h2>
          <p className="text-white/70 mt-1">Configure attendance tracking for your school</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Setup Progress */}
      <Card className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Setup Progress</h3>
              <p className="text-white/70 text-sm">Complete all steps to enable punch clock</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{setupProgress}%</div>
              <div className="text-white/70 text-sm">{completedSteps}/{totalSteps} completed</div>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${setupProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`flex items-center gap-2 p-2 rounded-lg ${setupStatus.officeLocation ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {setupStatus.officeLocation ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-white/50" />
              )}
              <span className={`text-sm ${setupStatus.officeLocation ? 'text-green-300' : 'text-white/70'}`}>
                Office Location
              </span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${setupStatus.lateThreshold ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {setupStatus.lateThreshold ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-white/50" />
              )}
              <span className={`text-sm ${setupStatus.lateThreshold ? 'text-green-300' : 'text-white/70'}`}>
                Late Threshold
              </span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${setupStatus.earlyDeparture ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {setupStatus.earlyDeparture ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-white/50" />
              )}
              <span className={`text-sm ${setupStatus.earlyDeparture ? 'text-green-300' : 'text-white/70'}`}>
                Early Departure
              </span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${setupStatus.notifications ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {setupStatus.notifications ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-white/50" />
              )}
              <span className={`text-sm ${setupStatus.notifications ? 'text-green-300' : 'text-white/70'}`}>
                Notifications
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-white/20 text-white">
            <Building className="w-4 h-4 mr-2" />
            Admin Office
          </TabsTrigger>
          <TabsTrigger value="timing" className="data-[state=active]:bg-white/20 text-white">
            <Clock className="w-4 h-4 mr-2" />
            Timing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20 text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Admin Office Location Card */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Admin Office Location
                </CardTitle>
                <CardDescription className="text-white/60">
                  GPS coordinates for attendance verification (10m radius)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {officeLocation ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Latitude:</span>
                      <span className="text-white font-mono">{officeLocation.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Longitude:</span>
                      <span className="text-white font-mono">{officeLocation.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Radius:</span>
                      <span className="text-white font-medium">{officeLocation.radius_meters}m</span>
                    </div>
                    <Badge className="bg-green-500/30 text-green-300 mt-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-300 text-sm">Not configured</p>
                    <Button
                      onClick={() => setActiveTab('location')}
                      size="sm"
                      className="mt-3 bg-blue-600 hover:bg-blue-700"
                    >
                      Configure Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timing Settings Card */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Attendance Timing
                </CardTitle>
                <CardDescription className="text-white/60">
                  Work hours and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Work Start:</span>
                    <span className="text-white">{workStartTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Late After:</span>
                    <span className="text-amber-400 font-medium">{lateThresholdTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Early Before:</span>
                    <span className="text-orange-400 font-medium">{earlyDepartureTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Work End:</span>
                    <span className="text-white">{workEndTime}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab('timing')}
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full border-white/30 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Timing
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings Card */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-white/60">
                  Alert settings for attendance events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Late Arrivals:</span>
                    {lateNotificationEnabled ? (
                      <Badge className="bg-green-500/30 text-green-300">Enabled</Badge>
                    ) : (
                      <Badge className="bg-red-500/30 text-red-300">Disabled</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Admin Phone:</span>
                    <span className="text-white text-sm">{adminNotificationPhone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Admin Email:</span>
                    <span className="text-white text-sm truncate max-w-[150px]">{adminNotificationEmail || 'Not set'}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab('notifications')}
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full border-white/30 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  System Status
                </CardTitle>
                <CardDescription className="text-white/60">
                  Punch clock system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {setupProgress === 100 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-300">System Ready</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-300">Setup Incomplete</span>
                      </>
                    )}
                  </div>
                  <div className="text-white/60 text-sm">
                    {setupProgress === 100 
                      ? 'All settings configured. Teachers can punch in/out within 10m of admin office.'
                      : `Complete ${totalSteps - completedSteps} more step(s) to enable punch clock.`
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="w-5 h-5" />
                Admin Office Location
              </CardTitle>
              <CardDescription className="text-white/60">
                Set the GPS coordinates of your admin office. Teachers must be within 10 meters to punch in/out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 10m Radius Info */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-medium">Strict 10-Meter Geofencing</p>
                  <p className="text-blue-300/80 text-sm">
                    Teachers must be within 10 meters of the admin office to punch in or out. 
                    This ensures accurate attendance verification.
                  </p>
                </div>
              </div>

              {!officeLocation && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-medium">Location Not Set</p>
                    <p className="text-amber-300/80 text-sm">
                      Teachers won't be able to punch in/out until you configure the admin office location.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Latitude</Label>
                  <Input
                    value={newLatitude}
                    onChange={(e) => setNewLatitude(e.target.value)}
                    placeholder="e.g., 5.603717"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Longitude</Label>
                  <Input
                    value={newLongitude}
                    onChange={(e) => setNewLongitude(e.target.value)}
                    placeholder="e.g., -0.186964"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Radius (meters)</Label>
                  <Input
                    type="number"
                    value={newRadius}
                    onChange={(e) => setNewRadius(Math.min(parseInt(e.target.value) || 10, 10).toString())}
                    max={10}
                    min={1}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-white/50 text-xs">Maximum 10 meters for accurate verification</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  Use My Current Location
                </Button>
                <Button
                  onClick={handleSaveOfficeLocation}
                  disabled={saving || !newLatitude || !newLongitude}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Location
                </Button>
              </div>

              {officeLocation && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Admin Office Location Configured</span>
                  </div>
                  <div className="text-green-300/80 text-sm font-mono">
                    {officeLocation.latitude.toFixed(6)}, {officeLocation.longitude.toFixed(6)} (Radius: {officeLocation.radius_meters}m)
                  </div>
                </div>
              )}

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Tips for Setting Location
                </h4>
                <ul className="text-purple-300/80 text-sm space-y-1 list-disc list-inside">
                  <li>Stand at the admin office entrance when capturing location</li>
                  <li>The 10-meter radius ensures teachers are physically present</li>
                  <li>Teachers outside the radius cannot punch in/out</li>
                  <li>Make sure GPS is enabled on your device for accurate capture</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Timing Settings
              </CardTitle>
              <CardDescription className="text-white/60">
                Configure work hours and attendance thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Work Hours
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/80">Work Start Time</Label>
                      <Input
                        type="time"
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/50 text-xs">When teachers should arrive</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Work End Time</Label>
                      <Input
                        type="time"
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/50 text-xs">When teachers can leave</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Attendance Thresholds
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/80">Late Arrival Threshold</Label>
                      <Input
                        type="time"
                        value={lateThresholdTime}
                        onChange={(e) => setLateThresholdTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/50 text-xs">Punch-ins after this time are marked as late</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Early Departure Threshold</Label>
                      <Input
                        type="time"
                        value={earlyDepartureTime}
                        onChange={(e) => setEarlyDepartureTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/50 text-xs">Punch-outs before this time are marked as early</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAttendanceSettings}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Timing Settings
                </Button>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-300 font-medium mb-2">Example Schedule</h4>
                <div className="text-purple-300/80 text-sm space-y-1">
                  <p>Work starts at <strong>{workStartTime}</strong></p>
                  <p>Teachers arriving after <strong>{lateThresholdTime}</strong> are marked late</p>
                  <p>Teachers leaving before <strong>{earlyDepartureTime}</strong> are marked as early departure</p>
                  <p>Work ends at <strong>{workEndTime}</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-white/60">
                Configure alerts for attendance events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Late Arrival Notifications</p>
                      <p className="text-white/60 text-sm">Get notified when teachers arrive late</p>
                    </div>
                  </div>
                  <Switch
                    checked={lateNotificationEnabled}
                    onCheckedChange={setLateNotificationEnabled}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Absence Notifications</p>
                      <p className="text-white/60 text-sm">Get notified when teachers don't punch in</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifyOnAbsence}
                    onCheckedChange={setNotifyOnAbsence}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Early Departure Notifications</p>
                      <p className="text-white/60 text-sm">Get notified when teachers leave early</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifyOnEarlyDeparture}
                    onCheckedChange={setNotifyOnEarlyDeparture}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Admin Phone Number
                  </Label>
                  <Input
                    type="tel"
                    value={adminNotificationPhone}
                    onChange={(e) => setAdminNotificationPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-white/50 text-xs">For SMS/WhatsApp notifications</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Admin Email
                  </Label>
                  <Input
                    type="email"
                    value={adminNotificationEmail}
                    onChange={(e) => setAdminNotificationEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-white/50 text-xs">For email notifications</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAttendanceSettings}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Notification Settings
                </Button>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  How Notifications Work
                </h4>
                <ul className="text-blue-300/80 text-sm space-y-1 list-disc list-inside">
                  <li>Late arrival alerts are sent immediately when a teacher punches in late</li>
                  <li>Absence alerts are sent at a configured time if no punch-in is recorded</li>
                  <li>Early departure alerts are sent when a teacher punches out before the threshold</li>
                  <li>Both SMS and email notifications require valid contact details</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PunchClockSetup;
