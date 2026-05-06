import React, { useState, useEffect } from 'react';
import { LessonTemplate, TemplateFilters, TEMPLATE_CATEGORIES, TemplateCategory } from '@/types/template';
import { TOTAL_WEEKS } from '@/types/lesson';
import { fetchTemplates, fetchFeaturedTemplates, duplicateTemplate, deleteTemplate } from '@/lib/supabase-templates';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonContext } from '@/contexts/LessonContext';
import { useNavigate } from 'react-router-dom';
import { CLASS_LEVELS, SUBJECTS } from '@/types/user';
import { Search, Star, BookOpen, Loader2, Library, ArrowLeft, Calendar, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ResourceLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveLesson } = useLessonContext();
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<LessonTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<LessonTemplate | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { loadTemplates(); }, [filters]);

  const loadTemplates = async () => {
    setLoading(true);
    const [all, featured] = await Promise.all([fetchTemplates(filters), fetchFeaturedTemplates()]);
    setTemplates(all);
    setFeaturedTemplates(featured);
    setLoading(false);
  };

  const handleDuplicate = async (template: LessonTemplate) => {
    if (!user) return;
    const lesson = await duplicateTemplate(template.id, user.id, user.name);
    if (lesson) {
      saveLesson(lesson);
      toast({ title: 'Template Duplicated!', description: 'The lesson has been added to your library.' });
      navigate(`/editor/${lesson.id}`);
    }
  };

  const handleDelete = async (template: LessonTemplate) => {
    if (template.authorId !== user?.id) return;
    if (await deleteTemplate(template.id)) {
      toast({ title: 'Template Deleted' });
      loadTemplates();
    }
  };

  const myTemplates = templates.filter(t => t.authorId === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white"><ArrowLeft className="w-5 h-5" /></Button>
            <Library className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl md:text-3xl font-black text-white">Template Library</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input placeholder="Search templates..." className="pl-10 bg-white/20 border-0 text-white placeholder:text-white/50"
                  value={filters.searchQuery || ''} onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })} />
              </div>
            </div>
            <Select value={filters.subject || 'all'} onValueChange={(v) => setFilters({ ...filters, subject: v === 'all' ? undefined : v })}>
              <SelectTrigger className="w-[150px] bg-white/20 border-0 text-white"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>{['all', ...SUBJECTS].map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.classLevel || 'all'} onValueChange={(v) => setFilters({ ...filters, classLevel: v === 'all' ? undefined : v })}>
              <SelectTrigger className="w-[120px] bg-white/20 border-0 text-white"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>{['all', ...CLASS_LEVELS].map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.week?.toString() || 'all'} onValueChange={(v) => setFilters({ ...filters, week: v === 'all' ? undefined : parseInt(v) })}>
              <SelectTrigger className="w-[110px] bg-white/20 border-0 text-white">
                <Calendar className="w-3 h-3 mr-1" /><SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>Week {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.lessonNumber?.toString() || 'all'} onValueChange={(v) => setFilters({ ...filters, lessonNumber: v === 'all' ? undefined : parseInt(v) })}>
              <SelectTrigger className="w-[110px] bg-white/20 border-0 text-white">
                <Hash className="w-3 h-3 mr-1" /><SelectValue placeholder="Lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>Lesson {n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-500"><BookOpen className="w-4 h-4 mr-2" />All</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-yellow-500"><Star className="w-4 h-4 mr-2" />Featured</TabsTrigger>
            <TabsTrigger value="mine" className="data-[state=active]:bg-green-500">My Templates</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-purple-400 animate-spin" /></div>
          ) : (
            <>
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {templates.map(t => <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} onDuplicate={handleDuplicate} />)}
                </div>
                {templates.length === 0 && <p className="text-center text-white/60 py-10">No templates found</p>}
              </TabsContent>
              <TabsContent value="featured">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredTemplates.map(t => <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} onDuplicate={handleDuplicate} />)}
                </div>
                {featuredTemplates.length === 0 && <p className="text-center text-white/60 py-10">No featured templates yet</p>}
              </TabsContent>
              <TabsContent value="mine">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myTemplates.map(t => <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} onDuplicate={handleDuplicate} onDelete={handleDelete} showDelete />)}
                </div>
                {myTemplates.length === 0 && <p className="text-center text-white/60 py-10">You haven't created any templates yet</p>}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <TemplatePreviewModal template={previewTemplate} isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)} onDuplicate={handleDuplicate} />
    </div>
  );
};

export default ResourceLibrary;
