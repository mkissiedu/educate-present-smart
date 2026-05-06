import React, { useState, useEffect } from 'react';
import { useSchool } from '@/contexts/SchoolContext';
import { ClassPeriod, SchoolClass, ScheduleEntry, ScheduleConflict } from '@/types/schedule';
import { fetchClassPeriods, saveClassPeriod, deleteClassPeriod, fetchSchoolClasses, saveSchoolClass, deleteSchoolClass, fetchScheduleEntries, saveScheduleEntry, deleteScheduleEntry, checkScheduleConflicts } from '@/lib/supabase-schedule';
import { fetchAllUsers } from '@/lib/supabase-admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PeriodManager } from './PeriodManager';
import { ClassManager } from './ClassManager';
import { TimetableGrid } from './TimetableGrid';
import { ScheduleEntryModal } from './ScheduleEntryModal';
import { PrintableSchedule } from './PrintableSchedule';
import { Calendar, Clock, School, Printer, Users } from 'lucide-react';

export const ClassScheduler: React.FC = () => {
  const { currentSchool } = useSchool();
  const [activeTab, setActiveTab] = useState('timetable');
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<ScheduleEntry | null>(null);
  const [modalDay, setModalDay] = useState(1);
  const [modalPeriod, setModalPeriod] = useState('');
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [printOpen, setPrintOpen] = useState(false);

  const schoolId = currentSchool?.id;

  useEffect(() => { loadData(); }, [schoolId]);

  const loadData = async () => {
    const [p, c, e, u] = await Promise.all([
      fetchClassPeriods(schoolId), fetchSchoolClasses(schoolId), fetchScheduleEntries(schoolId),
      fetchAllUsers(schoolId)
    ]);
    setPeriods(p);
    setClasses(c);
    setEntries(e);
    setTeachers(u.filter(u => u.role === 'teacher' || u.role === 'super_teacher').map(u => ({ id: u.id, name: u.name })));
    if (c.length > 0 && !selectedClass) setSelectedClass(c[0].id);
  };

  const handleSavePeriod = async (p: Partial<ClassPeriod>) => {
    await saveClassPeriod({ ...p, school_id: schoolId });
    loadData();
  };

  const handleSaveClass = async (c: Partial<SchoolClass>) => {
    await saveSchoolClass({ ...c, school_id: schoolId });
    loadData();
  };

  const handleSaveEntry = async (e: Partial<ScheduleEntry>) => {
    const classId = viewMode === 'class' ? selectedClass : e.class_id;
    await saveScheduleEntry({ ...e, school_id: schoolId, class_id: classId });
    loadData();
  };

  const openEntryModal = (day: number, periodId: string) => {
    setEditEntry(null);
    setModalDay(day);
    setModalPeriod(periodId);
    setConflicts([]);
    setModalOpen(true);
  };

  const openEditEntry = (entry: ScheduleEntry) => {
    setEditEntry(entry);
    setModalDay(entry.day_of_week);
    setModalPeriod(entry.period_id);
    setConflicts([]);
    setModalOpen(true);
  };

  const filteredEntries = viewMode === 'class' 
    ? entries.filter(e => e.class_id === selectedClass)
    : entries.filter(e => e.teacher_id === selectedTeacher);

  const periodName = periods.find(p => p.id === modalPeriod)?.name || '';
  const printTitle = viewMode === 'class' 
    ? classes.find(c => c.id === selectedClass)?.name || ''
    : teachers.find(t => t.id === selectedTeacher)?.name || '';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-emerald-400" /> Class Scheduling
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/10 mb-6">
          <TabsTrigger value="timetable" className="data-[state=active]:bg-emerald-600"><Calendar className="w-4 h-4 mr-2" />Timetable</TabsTrigger>
          <TabsTrigger value="periods" className="data-[state=active]:bg-emerald-600"><Clock className="w-4 h-4 mr-2" />Periods</TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-emerald-600"><School className="w-4 h-4 mr-2" />Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'class' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('class')}><School className="w-4 h-4 mr-1" />By Class</Button>
                <Button variant={viewMode === 'teacher' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('teacher')}><Users className="w-4 h-4 mr-1" />By Teacher</Button>
              </div>
              {viewMode === 'class' ? (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)}><Printer className="w-4 h-4 mr-1" />Print</Button>
            </div>
          </div>
          <TimetableGrid periods={periods} entries={filteredEntries} teachers={teachers} onCellClick={openEntryModal} onEntryClick={openEditEntry} />
        </TabsContent>

        <TabsContent value="periods"><PeriodManager periods={periods} onSave={handleSavePeriod} onDelete={id => deleteClassPeriod(id).then(loadData)} /></TabsContent>
        <TabsContent value="classes"><ClassManager classes={classes} teachers={teachers} onSave={handleSaveClass} onDelete={id => deleteSchoolClass(id).then(loadData)} /></TabsContent>
      </Tabs>

      <ScheduleEntryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} entry={editEntry} dayOfWeek={modalDay} periodId={modalPeriod} periodName={periodName} teachers={teachers} conflicts={conflicts} onSave={handleSaveEntry} onDelete={id => deleteScheduleEntry(id).then(() => { loadData(); setModalOpen(false); })} />
      <PrintableSchedule isOpen={printOpen} onClose={() => setPrintOpen(false)} viewType={viewMode} title={printTitle} schoolName={currentSchool?.name || 'School'} periods={periods} entries={filteredEntries} teachers={teachers} classes={classes} />
    </div>
  );
};
