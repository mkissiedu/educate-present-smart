import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonContext } from '@/contexts/LessonContext';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { PortalTabs } from '@/components/shared/PortalTabs';
import { PublishContentModal } from '@/components/super/PublishContentModal';
import { SuperTeacherAssessmentHub } from '@/components/super/SuperTeacherAssessmentHub';
import { QuestionBankMain } from '@/components/QuestionBankMain';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { SuperTeacherAnalytics } from '@/components/super/SuperTeacherAnalytics';
import { TestPaperPublisher } from '@/components/super/TestPaperPublisher';
import { PDCourseManager } from '@/components/pd/PDCourseManager';
import { PDWebinarManager } from '@/components/pd/PDWebinarManager';
import { fetchPublishedContent, unpublishContent } from '@/lib/supabase-schools';
import { fetchSuperTeacherAssignments, getAssignedSubjects, getAssignedClasses, SuperTeacherAssignment } from '@/lib/supabase-super-teacher';
import { fetchAllReviews } from '@/lib/supabase-reviews';
import { getTestPapers } from '@/lib/supabase-questions';
import { fetchPublishedTestPapers } from '@/lib/supabase-test-papers';
import { LessonReview, ReviewStatus } from '@/types/review';
import { PublishedContent } from '@/types/school';
import { Lesson } from '@/types/lesson';
import { TestPaper } from '@/types/question-bank';
import { PublishedTestPaper } from '@/types/assessment-types';
import { PORTAL_THEMES } from '@/lib/design-system';
import { BookOpen, Globe, Upload, Eye, Plus, Sparkles, AlertCircle, Briefcase, FileCheck, BarChart3, FileText, GraduationCap, Video, Film } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SuperTeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { lessons } = useLessonContext();
  const [activeTab, setActiveTab] = useState('studio');
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<SuperTeacherAssignment[]>([]);
  const [reviews, setReviews] = useState<LessonReview[]>([]);
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [publishedPapers, setPublishedPapers] = useState<PublishedTestPaper[]>([]);
  const [showPaperPublisher, setShowPaperPublisher] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<TestPaper | null>(null);
  const [learnSubTab, setLearnSubTab] = useState('courses');
  const theme = PORTAL_THEMES.super_teacher;

  const assignedSubjects = getAssignedSubjects(assignments);
  const assignedClasses = getAssignedClasses(assignments);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'super_teacher' && user?.role !== 'platform_admin')) {
      navigate('/');
    } else { loadData(); }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    const [published, userAssignments, allReviews, papers, pubPapers] = await Promise.all([
      fetchPublishedContent(),
      user ? fetchSuperTeacherAssignments(user.id) : Promise.resolve([]),
      fetchAllReviews(), getTestPapers(), fetchPublishedTestPapers()
    ]);
    setPublishedContent(published); setAssignments(userAssignments);
    setReviews(allReviews); setTestPapers(papers); setPublishedPapers(pubPapers);
  };

  const getReviewStatus = (lessonId: string): ReviewStatus => reviews.find(r => r.lesson_id === lessonId)?.status || 'draft';
  const handlePublish = (lesson: Lesson) => { setSelectedLesson(lesson); setShowPublish(true); };
  const isPublished = (lessonId: string) => publishedContent.some(p => p.content_id === lessonId && p.is_active);
  const handlePublishPaper = (paper: TestPaper) => { setSelectedPaper(paper); setShowPaperPublisher(true); };

  const filteredLessons = assignedSubjects.length > 0 ? lessons.filter(l => assignedSubjects.includes(l.subject) && assignedClasses.includes(l.class)) : [];
  const pendingReviews = reviews.filter(r => r.status === 'pending' || r.status === 'in_review').length;

  const tabs = [
    { id: 'studio', label: 'Catalyst Studio', icon: Sparkles, badge: filteredLessons.length },
    { id: 'learn', label: 'Learn', icon: Video },
    { id: 'reviews', label: 'Reviews', icon: FileCheck, badge: pendingReviews || undefined },
    { id: 'published', label: 'Published', icon: Globe },
    { id: 'questions', label: 'Question Bank', icon: BookOpen },
    { id: 'test-papers', label: 'Test Papers', icon: FileText, badge: testPapers.length || undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'assignments', label: 'My Assignments', icon: Briefcase, badge: assignments.length },
    { id: 'resources', label: 'Resources', icon: GraduationCap },
  ];

  const NoAssignmentsMessage = () => (
    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
      <AlertCircle className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">No Subjects Assigned</h3>
      <p className="text-white/60">Contact Super Admin to get subjects assigned.</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <PortalHeader portalType="super_teacher" title="Super Teacher Portal" subtitle="Content Development & Training" showQuickLinks={false} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PortalTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} portalType="super_teacher" />

        {activeTab === 'studio' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-amber-400" /> Catalyst Studio</h2>
              {assignedSubjects.length > 0 && <Button onClick={() => navigate('/editor/new')} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Create Lesson</Button>}
            </div>
            {assignedSubjects.length === 0 ? <NoAssignmentsMessage /> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLessons.map(lesson => (
                  <div key={lesson.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-white">{lesson.title}</h3><ReviewStatusBadge status={getReviewStatus(lesson.id)} size="sm" /></div>
                    <p className="text-amber-200 text-sm mb-1">{lesson.subject} • {lesson.class}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/editor/${lesson.id}`)} className="flex-1 text-xs border-white/30 text-white hover:bg-white/20"><Eye className="w-3 h-3 mr-1" /> Edit</Button>
                      {getReviewStatus(lesson.id) === 'approved' && !isPublished(lesson.id) && <Button size="sm" onClick={() => handlePublish(lesson)} className="flex-1 text-xs bg-green-600"><Upload className="w-3 h-3 mr-1" /> Publish</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-400" /> Professional Development
              </h2>
            </div>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <Tabs value={learnSubTab} onValueChange={setLearnSubTab} className="w-full">
                <div className="border-b bg-gray-50 px-4">
                  <TabsList className="bg-transparent h-12">
                    <TabsTrigger value="courses" className="data-[state=active]:bg-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Courses
                    </TabsTrigger>
                    <TabsTrigger value="webinars" className="data-[state=active]:bg-white">
                      <Video className="w-4 h-4 mr-2" />
                      Webinars
                    </TabsTrigger>
                    <TabsTrigger value="recordings" className="data-[state=active]:bg-white">
                      <Film className="w-4 h-4 mr-2" />
                      Recordings
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="courses" className="p-4 mt-0">
                  <PDCourseManager creatorType="super_teacher" />
                </TabsContent>
                <TabsContent value="webinars" className="p-4 mt-0">
                  <PDWebinarManager creatorType="super_teacher" />
                </TabsContent>
                <TabsContent value="recordings" className="p-4 mt-0">
                  <PDWebinarManager creatorType="super_teacher" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}



        {activeTab === 'test-papers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-blue-400" /> Test Papers (CAT & ETE)</h2>
              <Button onClick={() => navigate('/question-bank')} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Create Test Paper</Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPapers.map(paper => {
                const pub = publishedPapers.find(p => p.test_paper_id === paper.id);
                return (
                  <div key={paper.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <h3 className="font-bold text-white mb-1">{paper.title}</h3>
                    <p className="text-blue-200 text-sm">{paper.subject} • {paper.grade_level}</p>
                    <p className="text-white/60 text-xs">{paper.total_marks} marks • {paper.duration_minutes} mins</p>
                    {pub ? <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded mt-2 inline-block">{pub.paper_type}</span> : null}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 text-xs border-white/30 text-white hover:bg-white/20"><Eye className="w-3 h-3 mr-1" /> View</Button>
                      {!pub && <Button size="sm" onClick={() => handlePublishPaper(paper)} className="flex-1 text-xs bg-amber-600 hover:bg-amber-700"><Upload className="w-3 h-3 mr-1" /> Publish</Button>}
                    </div>
                  </div>
                );
              })}
              {testPapers.length === 0 && <div className="col-span-full text-center py-12 bg-white/5 rounded-xl"><FileText className="w-12 h-12 text-blue-400/50 mx-auto mb-3" /><p className="text-white/60">No test papers yet</p></div>}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <SuperTeacherAnalytics />}
        {activeTab === 'questions' && <div className="bg-white rounded-xl shadow-xl"><QuestionBankMain assignedSubjects={assignedSubjects} assignedClasses={assignedClasses} /></div>}
        {activeTab === 'reviews' && <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{reviews.map(r => { const l = lessons.find(x => x.id === r.lesson_id); return l ? <div key={r.id} className="bg-white/10 rounded-xl p-4 border border-white/20"><h3 className="font-bold text-white">{l.title}</h3><ReviewStatusBadge status={r.status} size="sm" /></div> : null; })}</div>}
        {activeTab === 'published' && <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{publishedContent.filter(c => assignedSubjects.includes(c.subject)).map(c => <div key={c.id} className="bg-white/10 rounded-xl p-4 border border-white/20"><h3 className="font-bold text-white">{c.title}</h3><p className="text-amber-200 text-sm">{c.subject}</p></div>)}</div>}
        {activeTab === 'assignments' && (assignments.length === 0 ? <NoAssignmentsMessage /> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{assignedSubjects.map(s => <div key={s} className="bg-white/10 rounded-xl p-4 border border-white/20"><h3 className="font-bold text-white">{s}</h3><div className="flex flex-wrap gap-1 mt-2">{assignments.filter(a => a.subject === s).map(a => <span key={a.id} className="text-xs bg-amber-500/30 text-amber-200 px-2 py-1 rounded">{a.class_level}</span>)}</div></div>)}</div>)}
        {activeTab === 'resources' && <div className="bg-white/10 backdrop-blur-md rounded-xl"><SuperTeacherAssessmentHub onNavigateToCurriculum={() => navigate('/curriculum')} assignedClasses={assignedClasses} assignedSubjects={assignedSubjects} /></div>}
      </div>
      {selectedLesson && <PublishContentModal isOpen={showPublish} onClose={() => { setShowPublish(false); setSelectedLesson(null); }} lesson={selectedLesson} onPublished={loadData} />}
      <TestPaperPublisher isOpen={showPaperPublisher} onClose={() => { setShowPaperPublisher(false); setSelectedPaper(null); }} testPaper={selectedPaper || undefined} onPublished={loadData} />
    </div>
  );
};

export default SuperTeacherDashboard;

