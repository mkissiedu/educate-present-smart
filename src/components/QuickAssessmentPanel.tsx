import React, { useState, useEffect } from 'react';
import { Student, Skill } from '../types/student';
import { fetchStudents } from '../lib/supabase-students';
import { fetchSkills, updateProgress } from '../lib/supabase-skills';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Loader2, WifiOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { offlineSyncManager } from '../lib/offline-sync';
import { SyncStatusIndicator } from './SyncStatusIndicator';


interface QuickAssessmentPanelProps {
  classLevel: string;
  lessonId?: string;
  onClose: () => void;
}

export const QuickAssessmentPanel: React.FC<QuickAssessmentPanelProps> = ({ classLevel, lessonId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(offlineSyncManager.getOnlineStatus());

  useEffect(() => {
    const unsubscribe = offlineSyncManager.onSyncStatusChange(() => {
      setIsOnline(offlineSyncManager.getOnlineStatus());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadData();
  }, [classLevel, lessonId]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Try to load from cache first if offline
    if (!isOnline) {
      const cachedStudents = offlineSyncManager.getCachedStudents();
      const cachedSkills = offlineSyncManager.getCachedSkills();
      
      if (cachedStudents.length > 0 && cachedSkills.length > 0) {
        setStudents(cachedStudents.filter(s => s.class_level === classLevel));
        setSkills(cachedSkills.filter(s => s.class_level === classLevel));
        if (cachedSkills.length > 0) setSelectedSkill(cachedSkills[0].id);
        setLoading(false);
        toast({ title: 'Working Offline', description: 'Using cached data' });
        return;
      }
    }
    
    try {
      const [studentsData, skillsData] = await Promise.all([
        fetchStudents(user.id, classLevel),
        fetchSkills(undefined, classLevel)
      ]);
      setStudents(studentsData);
      setSkills(skillsData);
      if (skillsData.length > 0) setSelectedSkill(skillsData[0].id);
      
      // Cache the data for offline use
      await offlineSyncManager.cacheStudents(studentsData);
      await offlineSyncManager.cacheSkills(skillsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMark = async (studentId: string, mastered: boolean) => {
    if (!selectedSkill) return;
    setSaving(studentId);
    
    try {
      if (isOnline) {
        // Online: save directly to database
        await updateProgress(studentId, selectedSkill, mastered);
        toast({ title: 'Progress Updated', description: `Marked as ${mastered ? 'mastered' : 'not mastered'}` });
      } else {
        // Offline: queue for later sync
        offlineSyncManager.addPendingUpdate({ studentId, skillId: selectedSkill, mastered });
        toast({ 
          title: 'Saved Offline', 
          description: 'Will sync when connection is restored',
          variant: 'default'
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update progress', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold">Quick Assessment - {classLevel}</h2>
              <p className="text-sm opacity-90">Mark student mastery with one click</p>
            </div>
            <SyncStatusIndicator />
          </div>
        </div>

        <div className="p-6 border-b">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Skill to Assess</label>
          <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full border-2 border-purple-300 rounded-lg px-4 py-2 font-semibold">
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.skill_code} - {skill.skill_name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-3">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-all">
                <div className="font-semibold text-gray-800">{student.first_name} {student.last_name}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleQuickMark(student.id, true)} disabled={saving === student.id} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                    {saving === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Yes
                  </button>
                  <button onClick={() => handleQuickMark(student.id, false)} disabled={saving === student.id} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                    {saving === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold">Close</button>
        </div>
      </div>
    </div>
  );
};
