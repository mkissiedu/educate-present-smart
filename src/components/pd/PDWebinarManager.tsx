import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Edit, Trash2, Video, Calendar, Clock, Users, Play,
  Loader2, Save, Globe, School, ExternalLink, Copy, CheckCircle,
  Upload, Link, Eye, Film, X
} from 'lucide-react';
import { PDWebinar, PDRecordingView } from '@/types/professional-development';
import {
  getWebinars, createWebinar, updateWebinar, deleteWebinar,
  getWebinarAttendees, updateWebinarRecording, removeWebinarRecording,
  getRecordingViews, getRecordingViewStats
} from '@/lib/supabase-pd';
import { getSchools } from '@/lib/supabase-schools';
import { JitsiMeetRoom } from './JitsiMeetRoom';
import { supabase } from '@/lib/supabase';

interface PDWebinarManagerProps {
  creatorType: 'super_teacher' | 'admin';
  schoolId?: string;
}

export const PDWebinarManager: React.FC<PDWebinarManagerProps> = ({ creatorType, schoolId }) => {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<PDWebinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<PDWebinar | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeWebinar, setActiveWebinar] = useState<PDWebinar | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Recording modal state
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingWebinar, setRecordingWebinar] = useState<PDWebinar | null>(null);
  const [recordingForm, setRecordingForm] = useState({
    recording_url: '',
    recording_description: '',
    recording_thumbnail_url: ''
  });
  const [uploadingRecording, setUploadingRecording] = useState(false);
  
  // View stats modal
  const [showViewStatsModal, setShowViewStatsModal] = useState(false);
  const [viewStatsWebinar, setViewStatsWebinar] = useState<PDWebinar | null>(null);
  const [viewStats, setViewStats] = useState<{
    totalViews: number;
    uniqueViewers: number;
    completedViews: number;
    averageWatchTime: number;
  } | null>(null);
  const [recordingViews, setRecordingViews] = useState<PDRecordingView[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    meeting_type: 'webinar' as 'webinar' | 'meeting' | 'workshop',
    scheduled_at: '',
    scheduled_time: '',
    duration_minutes: '60',
    target_type: 'all' as 'all' | 'selected_schools' | 'school_teachers',
    target_school_ids: [] as string[],
    max_participants: ''
  });

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [webinarsData, schoolsData] = await Promise.all([
        getWebinars({ creatorId: user.id, creatorType }),
        creatorType === 'super_teacher' ? getSchools() : Promise.resolve([])
      ]);
      setWebinars(webinarsData);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWebinar(null);
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setForm({
      title: '',
      description: '',
      meeting_type: 'webinar',
      scheduled_at: now.toISOString().split('T')[0],
      scheduled_time: now.toTimeString().slice(0, 5),
      duration_minutes: '60',
      target_type: creatorType === 'admin' ? 'school_teachers' : 'all',
      target_school_ids: [],
      max_participants: ''
    });
    setShowModal(true);
  };

  const handleEdit = (webinar: PDWebinar) => {
    setEditingWebinar(webinar);
    const scheduledDate = new Date(webinar.scheduled_at);
    setForm({
      title: webinar.title,
      description: webinar.description || '',
      meeting_type: webinar.meeting_type,
      scheduled_at: scheduledDate.toISOString().split('T')[0],
      scheduled_time: scheduledDate.toTimeString().slice(0, 5),
      duration_minutes: webinar.duration_minutes.toString(),
      target_type: webinar.target_type as any,
      target_school_ids: webinar.target_school_ids || [],
      max_participants: webinar.max_participants?.toString() || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user?.id || !form.title || !form.scheduled_at) return;
    setSaving(true);
    try {
      const scheduledAt = new Date(`${form.scheduled_at}T${form.scheduled_time || '00:00'}`);
      
      const webinarData = {
        title: form.title,
        description: form.description || undefined,
        meeting_type: form.meeting_type,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: parseInt(form.duration_minutes) || 60,
        target_type: form.target_type,
        target_school_ids: form.target_school_ids,
        target_teacher_ids: [],
        max_participants: form.max_participants ? parseInt(form.max_participants) : undefined,
        created_by: user.id,
        creator_type: creatorType,
        school_id: schoolId,
        status: 'scheduled' as const,
        is_recurring: false
      };

      if (editingWebinar) {
        await updateWebinar(editingWebinar.id, webinarData);
      } else {
        await createWebinar(webinarData);
      }
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving webinar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (webinarId: string) => {
    if (!confirm('Are you sure you want to delete this webinar?')) return;
    try {
      await deleteWebinar(webinarId);
      await loadData();
    } catch (error) {
      console.error('Error deleting webinar:', error);
    }
  };

  const handleStartWebinar = async (webinar: PDWebinar) => {
    try {
      await updateWebinar(webinar.id, { status: 'live' });
      setActiveWebinar(webinar);
    } catch (error) {
      console.error('Error starting webinar:', error);
    }
  };

  const handleEndWebinar = async () => {
    if (activeWebinar) {
      try {
        await updateWebinar(activeWebinar.id, { status: 'ended' });
        await loadData();
        // Show recording modal after ending
        setRecordingWebinar(activeWebinar);
        setRecordingForm({
          recording_url: '',
          recording_description: '',
          recording_thumbnail_url: ''
        });
        setShowRecordingModal(true);
      } catch (error) {
        console.error('Error ending webinar:', error);
      }
    }
    setActiveWebinar(null);
  };

  const handleAddRecording = (webinar: PDWebinar) => {
    setRecordingWebinar(webinar);
    setRecordingForm({
      recording_url: webinar.recording_url || '',
      recording_description: webinar.recording_description || '',
      recording_thumbnail_url: webinar.recording_thumbnail_url || ''
    });
    setShowRecordingModal(true);
  };

  const handleSaveRecording = async () => {
    if (!recordingWebinar || !recordingForm.recording_url) return;
    setUploadingRecording(true);
    try {
      await updateWebinarRecording(recordingWebinar.id, {
        recording_url: recordingForm.recording_url,
        recording_description: recordingForm.recording_description || undefined,
        recording_thumbnail_url: recordingForm.recording_thumbnail_url || undefined
      });
      await loadData();
      setShowRecordingModal(false);
      setRecordingWebinar(null);
    } catch (error) {
      console.error('Error saving recording:', error);
    } finally {
      setUploadingRecording(false);
    }
  };

  const handleRemoveRecording = async (webinar: PDWebinar) => {
    if (!confirm('Are you sure you want to remove this recording?')) return;
    try {
      await removeWebinarRecording(webinar.id);
      await loadData();
    } catch (error) {
      console.error('Error removing recording:', error);
    }
  };

  const handleViewStats = async (webinar: PDWebinar) => {
    setViewStatsWebinar(webinar);
    setShowViewStatsModal(true);
    try {
      const [stats, views] = await Promise.all([
        getRecordingViewStats(webinar.id),
        getRecordingViews(webinar.id)
      ]);
      setViewStats(stats);
      setRecordingViews(views);
    } catch (error) {
      console.error('Error loading view stats:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingRecording(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('lesson-materials')
        .upload(`recordings/${fileName}`, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('lesson-materials')
        .getPublicUrl(`recordings/${fileName}`);
      
      setRecordingForm(prev => ({
        ...prev,
        recording_url: urlData.publicUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingRecording(false);
    }
  };

  const copyMeetingUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWatchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      case 'cancelled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isWebinarStartable = (webinar: PDWebinar) => {
    const now = new Date();
    const start = new Date(webinar.scheduled_at);
    const thirtyMinsBefore = new Date(start.getTime() - 30 * 60000);
    return now >= thirtyMinsBefore && webinar.status === 'scheduled';
  };

  if (activeWebinar && user) {
    return (
      <JitsiMeetRoom
        config={{
          roomName: activeWebinar.meeting_room_id || `catalyst-${activeWebinar.id}`,
          displayName: user.full_name || user.email || 'Host',
          email: user.email,
          subject: activeWebinar.title,
          password: activeWebinar.meeting_password
        }}
        onClose={handleEndWebinar}
        onJoined={() => console.log('Host joined')}
        onLeft={handleEndWebinar}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const upcomingWebinars = webinars.filter(w => w.status === 'scheduled');
  const pastWebinars = webinars.filter(w => w.status === 'ended' || w.status === 'cancelled');
  const liveWebinars = webinars.filter(w => w.status === 'live');
  const recordedWebinars = pastWebinars.filter(w => w.recording_url);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {creatorType === 'super_teacher' ? 'Webinar Management' : 'Meeting Management'}
          </h2>
          <p className="text-sm text-gray-500">
            Schedule and manage live {creatorType === 'super_teacher' ? 'webinars and workshops' : 'meetings'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule {creatorType === 'super_teacher' ? 'Webinar' : 'Meeting'}
        </Button>
      </div>

      {/* Live Now */}
      {liveWebinars.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Now
          </h3>
          {liveWebinars.map(webinar => (
            <Card key={webinar.id} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <Video className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{webinar.title}</h4>
                      <p className="text-sm text-gray-500">Started at {formatDate(webinar.scheduled_at)}</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveWebinar(webinar)} className="bg-red-500 hover:bg-red-600">
                    <Play className="w-4 h-4 mr-2" />
                    Rejoin
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingWebinars.length})
          </TabsTrigger>
          <TabsTrigger value="recordings">
            Recordings ({recordedWebinars.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastWebinars.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="mt-4">
          {upcomingWebinars.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming {creatorType === 'super_teacher' ? 'webinars' : 'meetings'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingWebinars.map(webinar => (
                <Card key={webinar.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1 capitalize">{webinar.meeting_type}</Badge>
                          <h4 className="font-semibold">{webinar.title}</h4>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(webinar)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(webinar.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(webinar.scheduled_at)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {webinar.duration_minutes} minutes
                      </div>
                      <div className="flex items-center gap-2">
                        {webinar.target_type === 'all' ? (
                          <><Globe className="w-4 h-4" /> All Teachers</>
                        ) : webinar.target_type === 'school_teachers' ? (
                          <><School className="w-4 h-4" /> School Teachers</>
                        ) : (
                          <><Users className="w-4 h-4" /> {webinar.target_school_ids?.length || 0} Schools</>
                        )}
                      </div>
                    </div>

                    {/* Meeting URL */}
                    {webinar.meeting_url && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
                        <Input value={webinar.meeting_url} readOnly className="text-xs h-8" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMeetingUrl(webinar.meeting_url!)}
                          className="h-8"
                        >
                          {copiedUrl === webinar.meeting_url ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isWebinarStartable(webinar) ? (
                        <Button onClick={() => handleStartWebinar(webinar)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Start Now
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          <Clock className="w-4 h-4 mr-2" />
                          Starts {formatDate(webinar.scheduled_at)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recordings Tab */}
        <TabsContent value="recordings" className="mt-4">
          {recordedWebinars.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recordings available yet</p>
                <p className="text-sm mt-1">Add recordings to past webinars to make them available on-demand</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordedWebinars.map(webinar => (
                <Card key={webinar.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-36 bg-gradient-to-br from-purple-500 to-indigo-600">
                    {webinar.recording_thumbnail_url ? (
                      <img src={webinar.recording_thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      <Film className="w-3 h-3 mr-1" />
                      Recording
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-1">{webinar.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(webinar.scheduled_at)}</p>
                    {webinar.recording_description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{webinar.recording_description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStats(webinar)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Stats
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRecording(webinar)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecording(webinar)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Tab */}
        <TabsContent value="past" className="mt-4">
          {pastWebinars.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No past {creatorType === 'super_teacher' ? 'webinars' : 'meetings'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastWebinars.map(webinar => (
                <Card key={webinar.id} className={webinar.recording_url ? '' : 'opacity-75'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        webinar.recording_url ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {webinar.recording_url ? (
                          <Film className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Video className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{webinar.title}</h4>
                        <p className="text-xs text-gray-500">{formatDate(webinar.scheduled_at)}</p>
                      </div>
                      <Badge className={getStatusColor(webinar.status)}>{webinar.status}</Badge>
                    </div>
                    {!webinar.recording_url && webinar.status === 'ended' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRecording(webinar)}
                        className="w-full mt-3"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Recording
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWebinar ? 'Edit' : 'Schedule'} {creatorType === 'super_teacher' ? 'Webinar' : 'Meeting'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Monthly PD Session"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What will be covered..."
                rows={3}
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.meeting_type}
                onChange={(e) => setForm({ ...form, meeting_type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="webinar">Webinar</option>
                <option value="meeting">Meeting</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            {creatorType === 'super_teacher' && (
              <div>
                <Label>Target Audience</Label>
                <select
                  value={form.target_type}
                  onChange={(e) => setForm({ ...form, target_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">All Teachers</option>
                  <option value="selected_schools">Selected Schools</option>
                </select>
              </div>
            )}
            {form.target_type === 'selected_schools' && schools.length > 0 && (
              <div>
                <Label>Select Schools</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {schools.map(school => (
                    <label key={school.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.target_school_ids.includes(school.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, target_school_ids: [...form.target_school_ids, school.id] });
                          } else {
                            setForm({ ...form, target_school_ids: form.target_school_ids.filter(id => id !== school.id) });
                          }
                        }}
                      />
                      {school.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.scheduled_at}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingWebinar ? 'Update' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recording Modal */}
      <Dialog open={showRecordingModal} onOpenChange={setShowRecordingModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {recordingWebinar?.recording_url ? 'Edit Recording' : 'Add Recording'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">Recording Options:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Paste a YouTube, Vimeo, or other video URL</li>
                <li>Upload a video file directly</li>
                <li>Use Jitsi's recording feature and paste the link</li>
              </ul>
            </div>
            
            <div>
              <Label>Recording URL *</Label>
              <div className="flex gap-2">
                <Input
                  value={recordingForm.recording_url}
                  onChange={(e) => setRecordingForm({ ...recordingForm, recording_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or upload below"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={recordingForm.recording_description}
                onChange={(e) => setRecordingForm({ ...recordingForm, recording_description: e.target.value })}
                placeholder="Brief description of the recording content..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={recordingForm.recording_thumbnail_url}
                onChange={(e) => setRecordingForm({ ...recordingForm, recording_thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordingModal(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveRecording} 
              disabled={uploadingRecording || !recordingForm.recording_url}
            >
              {uploadingRecording ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Stats Modal */}
      <Dialog open={showViewStatsModal} onOpenChange={setShowViewStatsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recording View Statistics</DialogTitle>
          </DialogHeader>
          {viewStatsWebinar && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{viewStatsWebinar.title}</h4>
                <p className="text-sm text-gray-500">{formatDate(viewStatsWebinar.scheduled_at)}</p>
              </div>
              
              {viewStats && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{viewStats.totalViews}</div>
                      <div className="text-xs text-gray-500">Total Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{viewStats.uniqueViewers}</div>
                      <div className="text-xs text-gray-500">Unique Viewers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">{viewStats.completedViews}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">{formatWatchTime(viewStats.averageWatchTime)}</div>
                      <div className="text-xs text-gray-500">Avg Watch Time</div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {recordingViews.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Recent Viewers</h5>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {recordingViews.slice(0, 10).map(view => (
                      <div key={view.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <span className="font-medium">{view.teacher_name || 'Teacher'}</span>
                          <span className="text-gray-500 ml-2">
                            {view.view_count} view{view.view_count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {view.completed && (
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatWatchTime(view.total_watch_time_seconds)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewStatsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDWebinarManager;
