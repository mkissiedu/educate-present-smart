import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, FileText, Target, BookOpen, Lightbulb, Link2, ArrowLeft, CalendarDays, Plus } from 'lucide-react';
import { CORE_COMPETENCIES, LearningIndicator } from '@/data/nacca-kg-curriculum-types';
import { CKLA_CORE_SKILLS } from '@/data/ckla-curriculum-types';
import { CurriculumMapHeader } from './CurriculumMapHeader';
import { CurriculumStrandCard } from './CurriculumStrandCard';
import { CurriculumEditModal } from './curriculum/CurriculumEditModal';
import { useLessonContext } from '@/contexts/LessonContext';
import { useNavigate } from 'react-router-dom';
import { GradeLevel, getCurriculum, getSubjectsForLevel, getGradeCategory, CurriculumSystem } from '@/lib/curriculum-data';
import * as curriculumDb from '@/lib/supabase-curriculum';
import { useToast } from '@/hooks/use-toast';

export const CurriculumMap: React.FC = () => {
  const [curriculumSystem, setCurriculumSystem] = useState<CurriculumSystem>('NaCCA');
  const [level, setLevel] = useState<GradeLevel>('KG1');
  const [subject, setSubject] = useState('Language & Literacy');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalType, setModalType] = useState<'class'|'subject'|'strand'|'subStrand'|'standard'|'indicator'|null>(null);
  const [modalParentId, setModalParentId] = useState<string>('');
  const [customStrands, setCustomStrands] = useState<any[]>([]);
  const [customCurriculumId, setCustomCurriculumId] = useState<string>('');
  const { lessons, getLessonsByIndicator } = useLessonContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (curriculumSystem === 'CKLA') { setLevel('PreK'); setSubject('Skills Strand'); }
    else if (curriculumSystem === 'NaCCA') { setLevel('KG1'); setSubject('Language & Literacy'); }
  }, [curriculumSystem]);

  useEffect(() => {
    const subjects = getSubjectsForLevel(level);
    if (!subjects.includes(subject) && subjects.length > 0) setSubject(subjects[0]);
  }, [level]);

  useEffect(() => {
    if (curriculumSystem === 'Custom') loadCustomCurriculum();
  }, [curriculumSystem, level, subject]);

  const loadCustomCurriculum = async () => {
    try {
      const curriculums = await curriculumDb.getCurriculums();
      const curr = curriculums.find(c => c.level === level && c.subject === subject);
      if (curr) {
        setCustomCurriculumId(curr.id);
        const strands = await curriculumDb.getFullCurriculum(curr.id);
        setCustomStrands(strands);
      } else { setCustomStrands([]); setCustomCurriculumId(''); }
    } catch (e) { console.error(e); }
  };

  const curriculum = useMemo(() => getCurriculum(level, subject), [level, subject]);
  const displayStrands = curriculumSystem === 'Custom' ? customStrands : (curriculum?.strands || []);

  const filteredStrands = useMemo(() => {
    if (!searchTerm) return displayStrands;
    const term = searchTerm.toLowerCase();
    return displayStrands.filter((s: any) => s.name.toLowerCase().includes(term) || s.subStrands?.some((ss: any) => ss.name.toLowerCase().includes(term)));
  }, [displayStrands, searchTerm]);

  const handleAddStrand = async (data: any) => {
    let currId = customCurriculumId;
    if (!currId) {
      const newCurr = await curriculumDb.createCurriculum({ system: 'Custom', level, subject });
      currId = newCurr.id; setCustomCurriculumId(currId);
    }
    await curriculumDb.createStrand({ curriculum_id: currId, name: data.name, color: data.color || '#10b981', sort_order: customStrands.length });
    loadCustomCurriculum();
    toast({ title: 'Strand added successfully' });
  };

  const handleAddSubStrand = async (data: any) => {
    await curriculumDb.createSubStrand({ strand_id: modalParentId, name: data.name, sort_order: 0 });
    loadCustomCurriculum();
  };

  const handleAddStandard = async (data: any) => {
    await curriculumDb.createContentStandard({ sub_strand_id: modalParentId, code: data.code, description: data.description, sort_order: 0 });
    loadCustomCurriculum();
  };

  const handleAddIndicator = async (data: any) => {
    await curriculumDb.createIndicator({ content_standard_id: modalParentId, code: data.code, description: data.description, sort_order: 0 });
    loadCustomCurriculum();
  };

  const handleSave = async (data: any) => {
    if (modalType === 'strand') await handleAddStrand(data);
    else if (modalType === 'subStrand') await handleAddSubStrand(data);
    else if (modalType === 'standard') await handleAddStandard(data);
    else if (modalType === 'indicator') await handleAddIndicator(data);
  };

  const stats = useMemo(() => {
    let subStrands = 0, standards = 0, indicators = 0;
    displayStrands.forEach((s: any) => {
      subStrands += s.subStrands?.length || 0;
      s.subStrands?.forEach((ss: any) => { standards += ss.contentStandards?.length || 0; ss.contentStandards?.forEach((cs: any) => { indicators += cs.indicators?.length || 0; }); });
    });
    return { strands: displayStrands.length, subStrands, standards, indicators, linkedLessons: 0 };
  }, [displayStrands]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <h1 className="text-2xl font-bold text-gray-800">Curriculum Map</h1>
          </div>
        </div>
        
        <CurriculumMapHeader curriculumSystem={curriculumSystem} level={level} subject={subject} onSystemChange={setCurriculumSystem} onLevelChange={setLevel} onSubjectChange={setSubject} isEditMode={isEditMode} onToggleEditMode={() => setIsEditMode(!isEditMode)} />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[{ label: 'Strands', value: stats.strands, icon: Target, color: 'bg-emerald-500' }, { label: 'Sub-Strands', value: stats.subStrands, icon: BookOpen, color: 'bg-teal-500' }, { label: 'Standards', value: stats.standards, icon: FileText, color: 'bg-cyan-500' }, { label: 'Indicators', value: stats.indicators, icon: Lightbulb, color: 'bg-blue-500' }].map(stat => (
            <Card key={stat.label} className="p-3"><div className="flex items-center gap-2"><div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-4 h-4 text-white" /></div><div><p className="text-xl font-bold">{stat.value}</p><p className="text-xs text-gray-500">{stat.label}</p></div></div></Card>
          ))}
        </div>

        {isEditMode && curriculumSystem === 'Custom' && (
          <Button className="mb-4" onClick={() => setModalType('strand')}><Plus className="w-4 h-4 mr-2" /> Add Strand</Button>
        )}

        <div className="space-y-4">
          {filteredStrands.map((strand: any) => (
            <CurriculumStrandCard key={strand.id} strand={strand} selectedIndicators={selectedIndicators} isEditable={isEditMode && curriculumSystem === 'Custom'}
              onAddSubStrand={(id) => { setModalParentId(id); setModalType('subStrand'); }}
              onAddStandard={(id) => { setModalParentId(id); setModalType('standard'); }}
              onAddIndicator={(id) => { setModalParentId(id); setModalType('indicator'); }}
              onDeleteStrand={async (id) => { await curriculumDb.deleteStrand(id); loadCustomCurriculum(); }}
              onDeleteSubStrand={async (id) => { await curriculumDb.deleteSubStrand(id); loadCustomCurriculum(); }}
              onDeleteStandard={async (id) => { await curriculumDb.deleteContentStandard(id); loadCustomCurriculum(); }}
              onDeleteIndicator={async (id) => { await curriculumDb.deleteIndicator(id); loadCustomCurriculum(); }}
            />
          ))}
          {filteredStrands.length === 0 && <Card className="p-8 text-center"><p className="text-gray-500">{curriculumSystem === 'Custom' ? 'No custom curriculum yet. Add strands to get started.' : `No curriculum data found for ${subject} at ${level} level.`}</p></Card>}
        </div>

        {modalType && <CurriculumEditModal open={!!modalType} onClose={() => setModalType(null)} type={modalType} onSave={handleSave} />}
      </div>
    </div>
  );
};

export default CurriculumMap;
