import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen, Video, Calendar, Clock, Users, Award, Search, Filter,
  Play, CheckCircle, ChevronRight, Star, TrendingUp, Target,
  GraduationCap, FileText, Monitor, Loader2, Film, Eye
} from 'lucide-react';
import { PDCourse, PDWebinar, PD_CATEGORIES, PDRecordingView } from '@/types/professional-development';
import {
  getAvailableCoursesForTeacher,
  getAvailableWebinarsForTeacher,
  getTeacherEnrollments,
  getTeacherPDStats,
  enrollInCourse,
  rsvpToWebinar,
  getCourseModules,
  getPastWebinarsWithRecordings,
  getTeacherRecordingViews
} from '@/lib/supabase-pd';
import { JitsiMeetRoom } from './JitsiMeetRoom';
import { CourseViewer } from './CourseViewer';
import { RecordingViewer } from './RecordingViewer';

export const TeacherLearnPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<PDCourse[]>([]);
  const [webinars, setWebinars] = useState<PDWebinar[]>([]);
  const [pastWebinars, setPastWebinars] = useState<PDWebinar[]>([]);
  const [myCourses, setMyCourses] = useState<PDCourse[]>([]);
  const [myRecordingViews, setMyRecordingViews] = useState<PDRecordingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    totalHoursLearned: 0,
    webinarsAttended: 0,
    upcomingWebinars: 0,
    recordingsWatched: 0
  });
  const [activeWebinar, setActiveWebinar] = useState<PDWebinar | null>(null);
  const [activeCourse, setActiveCourse] = useState<PDCourse | null>(null);
  const [activeRecording, setActiveRecording] = useState<PDWebinar | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [coursesData, webinarsData, enrollments, statsData, pastWebinarsData, recordingViews] = await Promise.all([
        getAvailableCoursesForTeacher(user.id, user.school_id),
        getAvailableWebinarsForTeacher(user.id, user.school_id),
        getTeacherEnrollments(user.id),
        getTeacherPDStats(user.id),
        getPastWebinarsWithRecordings(user.id, user.school_id),
        getTeacherRecordingViews(user.id)
      ]);

      setCourses(coursesData);
      setWebinars(webinarsData);
      setPastWebinars(pastWebinarsData);
      setMyRecordingViews(recordingViews);
      setStats({
        ...statsData,
        recordingsWatched: recordingViews.length
      });

      // Get enrolled courses with enrollment data
      const enrolledCourseIds = enrollments.map(e => e.course_id);
      const enrolledCourses = coursesData.filter(c => enrolledCourseIds.includes(c.id));
      enrolledCourses.forEach(course => {
        const enrollment = enrollments.find(e => e.course_id === course.id);
        if (enrollment) {
          course.enrollment = enrollment;
        }
      });
      setMyCourses(enrolledCourses);
    } catch (error) {
      console.error('Error loading PD data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (course: PDCourse) => {
    if (!user?.id) return;
    setEnrollingCourseId(course.id);
    try {
      await enrollInCourse({
        course_id: course.id,
        teacher_id: user.id,
        school_id: user.school_id,
        status: 'enrolled',
        progress_percent: 0,
        completed_modules: []
      });
      await loadData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleRSVPWebinar = async (webinar: PDWebinar, status: 'attending' | 'declined' | 'maybe') => {
    if (!user?.id) return;
    try {
      await rsvpToWebinar({
        webinar_id: webinar.id,
        teacher_id: user.id,
        school_id: user.school_id,
        rsvp_status: status
      });
      await loadData();
    } catch (error) {
      console.error('Error RSVPing to webinar:', error);
    }
  };

  const handleJoinWebinar = (webinar: PDWebinar) => {
    setActiveWebinar(webinar);
  };

  const handleStartCourse = (course: PDCourse) => {
    setActiveCourse(course);
  };

  const handleWatchRecording = (webinar: PDWebinar) => {
    setActiveRecording(webinar);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredWebinars = webinars.filter(webinar =>
    webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    webinar.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPastWebinars = pastWebinars.filter(webinar =>
    webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    webinar.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isWebinarLive = (webinar: PDWebinar) => {
    const now = new Date();
    const start = new Date(webinar.scheduled_at);
    const end = new Date(start.getTime() + webinar.duration_minutes * 60000);
    return now >= start && now <= end;
  };

  const hasWatchedRecording = (webinarId: string) => {
    return myRecordingViews.some(v => v.webinar_id === webinarId);
  };

  const hasCompletedRecording = (webinarId: string) => {
    return myRecordingViews.some(v => v.webinar_id === webinarId && v.completed);
  };

  if (activeWebinar && user) {
    return (
      <JitsiMeetRoom
        config={{
          roomName: activeWebinar.meeting_room_id || `catalyst-webinar-${activeWebinar.id}`,
          displayName: user.full_name || user.email || 'Teacher',
          email: user.email,
          subject: activeWebinar.title,
          password: activeWebinar.meeting_password
        }}
        onClose={() => setActiveWebinar(null)}
        onJoined={() => console.log('Joined webinar')}
        onLeft={() => console.log('Left webinar')}
      />
    );
  }

  if (activeCourse) {
    return (
      <CourseViewer
        course={activeCourse}
        onClose={() => {
          setActiveCourse(null);
          loadData();
        }}
      />
    );
  }

  if (activeRecording) {
    return (
      <RecordingViewer
        webinar={activeRecording}
        onClose={() => {
          setActiveRecording(null);
          loadData();
        }}
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <BookOpen className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
            <div className="text-xs opacity-80">Courses Enrolled</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <CheckCircle className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
            <div className="text-xs opacity-80">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <Clock className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.totalHoursLearned}</div>
            <div className="text-xs opacity-80">Hours Learned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <Video className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.webinarsAttended}</div>
            <div className="text-xs opacity-80">Webinars Attended</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <Calendar className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.upcomingWebinars}</div>
            <div className="text-xs opacity-80">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardContent className="p-4">
            <Film className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl font-bold">{stats.recordingsWatched}</div>
            <div className="text-xs opacity-80">Recordings Watched</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses, webinars, and recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">All Categories</option>
          {PD_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="recordings">
            Recordings
            {pastWebinars.length > 0 && (
              <Badge className="ml-1 bg-purple-500 text-white text-xs px-1.5">{pastWebinars.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Continue Learning */}
          {myCourses.filter(c => c.enrollment?.status !== 'completed').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Continue Learning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCourses.filter(c => c.enrollment?.status !== 'completed').slice(0, 3).map(course => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStartCourse(course)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{course.title}</h4>
                          <Progress value={course.enrollment?.progress_percent || 0} className="h-2 mt-2" />
                          <p className="text-xs text-gray-500 mt-1">{course.enrollment?.progress_percent || 0}% complete</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Webinars */}
          {webinars.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Upcoming Webinars
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webinars.slice(0, 4).map(webinar => (
                  <Card key={webinar.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isWebinarLive(webinar) && (
                              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
                            )}
                            <Badge variant="outline" className="capitalize">{webinar.meeting_type}</Badge>
                          </div>
                          <h4 className="font-medium">{webinar.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(webinar.scheduled_at)}</p>
                          <p className="text-sm text-gray-500">{webinar.duration_minutes} minutes</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => isWebinarLive(webinar) ? handleJoinWebinar(webinar) : handleRSVPWebinar(webinar, 'attending')}
                          className={isWebinarLive(webinar) ? 'bg-red-500 hover:bg-red-600' : ''}
                        >
                          {isWebinarLive(webinar) ? 'Join Now' : 'RSVP'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Recordings */}
          {pastWebinars.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-500" />
                Recent Recordings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastWebinars.slice(0, 3).map(webinar => (
                  <RecordingCard
                    key={webinar.id}
                    webinar={webinar}
                    hasWatched={hasWatchedRecording(webinar.id)}
                    hasCompleted={hasCompletedRecording(webinar.id)}
                    onWatch={() => handleWatchRecording(webinar)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.slice(0, 6).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={myCourses.some(c => c.id === course.id)}
                  onEnroll={() => handleEnrollCourse(course)}
                  onStart={() => handleStartCourse(course)}
                  enrolling={enrollingCourseId === course.id}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={myCourses.some(c => c.id === course.id)}
                onEnroll={() => handleEnrollCourse(course)}
                onStart={() => handleStartCourse(course)}
                enrolling={enrollingCourseId === course.id}
              />
            ))}
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No courses available yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Webinars Tab */}
        <TabsContent value="webinars" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWebinars.map(webinar => (
              <WebinarCard
                key={webinar.id}
                webinar={webinar}
                isLive={isWebinarLive(webinar)}
                onJoin={() => handleJoinWebinar(webinar)}
                onRSVP={(status) => handleRSVPWebinar(webinar, status)}
              />
            ))}
            {filteredWebinars.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming webinars</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Recordings Tab */}
        <TabsContent value="recordings" className="mt-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Watch recordings of past webinars and workshops you may have missed. Your viewing progress is tracked automatically.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPastWebinars.map(webinar => (
              <RecordingCard
                key={webinar.id}
                webinar={webinar}
                hasWatched={hasWatchedRecording(webinar.id)}
                hasCompleted={hasCompletedRecording(webinar.id)}
                onWatch={() => handleWatchRecording(webinar)}
              />
            ))}
            {filteredPastWebinars.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recordings available yet</p>
                <p className="text-sm mt-1">Check back after webinars have ended</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Learning Tab */}
        <TabsContent value="my-learning" className="mt-4">
          <div className="space-y-6">
            {/* In Progress */}
            <div>
              <h3 className="text-lg font-semibold mb-3">In Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCourses.filter(c => c.enrollment?.status !== 'completed').map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    onStart={() => handleStartCourse(course)}
                    showProgress
                  />
                ))}
                {myCourses.filter(c => c.enrollment?.status !== 'completed').length === 0 && (
                  <p className="text-gray-500 col-span-full">No courses in progress</p>
                )}
              </div>
            </div>

            {/* Watched Recordings */}
            {myRecordingViews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Watched Recordings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastWebinars
                    .filter(w => hasWatchedRecording(w.id))
                    .map(webinar => (
                      <RecordingCard
                        key={webinar.id}
                        webinar={webinar}
                        hasWatched={true}
                        hasCompleted={hasCompletedRecording(webinar.id)}
                        onWatch={() => handleWatchRecording(webinar)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Completed */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Completed Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCourses.filter(c => c.enrollment?.status === 'completed').map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    onStart={() => handleStartCourse(course)}
                    showProgress
                  />
                ))}
                {myCourses.filter(c => c.enrollment?.status === 'completed').length === 0 && (
                  <p className="text-gray-500 col-span-full">No completed courses yet</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Course Card Component
interface CourseCardProps {
  course: PDCourse;
  isEnrolled: boolean;
  onEnroll?: () => void;
  onStart?: () => void;
  enrolling?: boolean;
  showProgress?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled,
  onEnroll,
  onStart,
  enrolling,
  showProgress
}) => {
  const category = PD_CATEGORIES.find(c => c.id === course.category);

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail_url && (
          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
        )}
        {course.is_mandatory && (
          <Badge className="absolute top-2 right-2 bg-red-500">Required</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <Badge variant="outline" className="text-xs">{category.name}</Badge>
          )}
        </div>
        <h4 className="font-semibold mb-1 line-clamp-2">{course.title}</h4>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {course.duration_hours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration_hours}h
            </span>
          )}
        </div>

        {showProgress && course.enrollment && (
          <div className="mb-3">
            <Progress value={course.enrollment.progress_percent} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{course.enrollment.progress_percent}% complete</p>
          </div>
        )}

        {isEnrolled ? (
          <Button onClick={onStart} className="w-full" size="sm">
            <Play className="w-4 h-4 mr-2" />
            {course.enrollment?.status === 'completed' ? 'Review' : 'Continue'}
          </Button>
        ) : (
          <Button onClick={onEnroll} className="w-full" size="sm" disabled={enrolling}>
            {enrolling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4 mr-2" />
            )}
            Enroll Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Webinar Card Component
interface WebinarCardProps {
  webinar: PDWebinar;
  isLive: boolean;
  onJoin: () => void;
  onRSVP: (status: 'attending' | 'declined' | 'maybe') => void;
}

const WebinarCard: React.FC<WebinarCardProps> = ({
  webinar,
  isLive,
  onJoin,
  onRSVP
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            isLive ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Video className={`w-7 h-7 ${isLive ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse">LIVE NOW</Badge>
              )}
              <Badge variant="outline" className="capitalize">{webinar.meeting_type}</Badge>
            </div>
            <h4 className="font-semibold">{webinar.title}</h4>
            {webinar.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{webinar.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(webinar.scheduled_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {webinar.duration_minutes} min
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {isLive ? (
            <Button onClick={onJoin} className="flex-1 bg-red-500 hover:bg-red-600">
              <Video className="w-4 h-4 mr-2" />
              Join Now
            </Button>
          ) : (
            <>
              <Button onClick={() => onRSVP('attending')} className="flex-1">
                Attending
              </Button>
              <Button onClick={() => onRSVP('maybe')} variant="outline">
                Maybe
              </Button>
              <Button onClick={() => onRSVP('declined')} variant="ghost" size="icon">
                <span className="text-xs">Skip</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recording Card Component
interface RecordingCardProps {
  webinar: PDWebinar;
  hasWatched: boolean;
  hasCompleted: boolean;
  onWatch: () => void;
}

const RecordingCard: React.FC<RecordingCardProps> = ({
  webinar,
  hasWatched,
  hasCompleted,
  onWatch
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-purple-500 to-indigo-600">
        {webinar.recording_thumbnail_url ? (
          <img src={webinar.recording_thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-12 h-12 text-white/50" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={onWatch}>
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-purple-600 ml-1" />
          </div>
        </div>
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {hasCompleted ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          ) : hasWatched ? (
            <Badge className="bg-blue-500 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Watched
            </Badge>
          ) : null}
        </div>
        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
          {webinar.duration_minutes} min
        </Badge>
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2 capitalize text-xs">{webinar.meeting_type}</Badge>
        <h4 className="font-semibold mb-1 line-clamp-2">{webinar.title}</h4>
        <p className="text-sm text-gray-500 mb-2">{formatDate(webinar.scheduled_at)}</p>
        {webinar.recording_description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{webinar.recording_description}</p>
        )}
        <Button onClick={onWatch} className="w-full" size="sm" variant={hasWatched ? 'outline' : 'default'}>
          <Play className="w-4 h-4 mr-2" />
          {hasCompleted ? 'Watch Again' : hasWatched ? 'Continue Watching' : 'Watch Recording'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeacherLearnPortal;
