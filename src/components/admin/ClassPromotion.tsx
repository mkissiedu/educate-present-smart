import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { fetchStudentsByClass } from '@/lib/supabase-students';
import { fetchSystemClassDefinitions } from '@/lib/supabase-class-definitions';
import { promoteStudents, getNextClass, PromotionAction, PromotionRecord } from '@/lib/supabase-promotion';
import { Student } from '@/types/student';
import { ClassPromotionHeader } from './ClassPromotionHeader';
import { ClassPromotionList } from './ClassPromotionList';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

export const ClassPromotion: React.FC = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [actions, setActions] = useState<Record<string, PromotionAction>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const schoolId = currentSchool?.id || user?.school_id;

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents();
  }, [selectedClass]);

  const loadClasses = async () => {
    const defs = await fetchSystemClassDefinitions();
    setClasses(defs.map(d => d.name).filter(n => n !== 'Graduated'));
  };

  const loadStudents = async () => {
    const list = await fetchStudentsByClass(selectedClass, schoolId);
    setStudents(list);
    const defaultActions: Record<string, PromotionAction> = {};
    list.forEach(s => { defaultActions[s.id] = 'promote'; });
    setActions(defaultActions);
  };

  const stats = useMemo(() => {
    const vals = Object.values(actions);
    return {
      total: students.length,
      promote: vals.filter(a => a === 'promote').length,
      retain: vals.filter(a => a === 'retain').length,
      graduate: vals.filter(a => a === 'graduate').length,
    };
  }, [actions, students]);

  const handleProcess = async () => {
    if (!showConfirm) { setShowConfirm(true); return; }
    setIsProcessing(true);
    const nextClass = getNextClass(selectedClass);
    const promotions: PromotionRecord[] = students.map(s => ({
      studentId: s.id, action: actions[s.id], fromClass: selectedClass, toClass: nextClass
    }));
    const result = await promoteStudents(promotions, schoolId || '');
    toast({ title: 'Promotion Complete', description: `${result.success} students updated, ${result.failed} failed` });
    setIsProcessing(false);
    setShowConfirm(false);
    setSelectedClass('');
  };

  const handleSelectAll = (action: PromotionAction) => {
    const newActions: Record<string, PromotionAction> = {};
    students.forEach(s => { newActions[s.id] = action; });
    setActions(newActions);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <ClassPromotionHeader
        stats={stats} selectedClass={selectedClass} onClassChange={setSelectedClass}
        classes={classes} isProcessing={isProcessing} onProcess={handleProcess}
      />
      {showConfirm && (
        <div className="mx-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">Confirm Promotion</p>
            <p className="text-sm text-amber-700">This will update {stats.promote} students to the next class. Click again to confirm.</p>
          </div>
          <button onClick={() => setShowConfirm(false)} className="text-amber-600 hover:text-amber-800">Cancel</button>
        </div>
      )}
      {selectedClass && students.length > 0 ? (
        <ClassPromotionList
          students={students} actions={actions} currentClass={selectedClass}
          onActionChange={(id, a) => setActions(prev => ({ ...prev, [id]: a }))}
          onSelectAll={handleSelectAll}
        />
      ) : selectedClass ? (
        <div className="p-8 text-center text-gray-500">No students found in {selectedClass}</div>
      ) : (
        <div className="p-8 text-center text-gray-500">Select a class to view students for promotion</div>
      )}
    </div>
  );
};
