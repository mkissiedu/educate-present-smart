import React, { useState, useEffect } from 'react';
import { Student, Skill } from '../types/student';
import { fetchStudents } from '../lib/supabase-students';
import { fetchSkills, bulkUpdateProgress } from '../lib/supabase-skills';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Minus, Save } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { offlineSyncManager } from '../lib/offline-sync';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface LiveAssessmentWidgetProps {
  classLevel: string;
  lessonId?: string;
  onClose: () => void;
}

type MasteryStatus = 'yes' | 'no' | 'pending';

export const LiveAssessmentWidget: React.FC<LiveAssessmentWidgetProps> = ({ classLevel, lessonId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [assessments, setAssessments] = useState<Record<string, MasteryStatus>>({});
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(offlineSyncManager.getOnlineStatus());

  useEffect(() => {
    const unsubscribe = offlineSyncManager.onSyncStatusChange(() => {
      setIsOnline(offlineSyncManager.getOnlineStatus());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadData();
  }, [classLevel]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Try to load from cache first if offline
    if (!isOnline) {
      const cachedStudents = offlineSyncManager.getCachedStudents();
      const cachedSkills = offlineSyncManager.getCachedSkills();
      
      if (cachedStudents.length > 0 && cachedSkills.length > 0) {
        const filteredStudents = cachedStudents.filter(s => s.class_level === classLevel);
        const filteredSkills = cachedSkills.filter(s => s.class_level === classLevel);
        
        setStudents(filteredStudents);
        setSkills(filteredSkills);
        if (filteredSkills.length > 0) setSelectedSkill(filteredSkills[0].id);
        
        const initialAssessments: Record<string, MasteryStatus> = {};
        filteredStudents.forEach(s => initialAssessments[s.id] = 'pending');
        setAssessments(initialAssessments);
        
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
      
      const initialAssessments: Record<string, MasteryStatus> = {};
      studentsData.forEach(s => initialAssessments[s.id] = 'pending');
      setAssessments(initialAssessments);
      
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

  const toggleStatus = (studentId: string) => {
    setAssessments(prev => {
      const current = prev[studentId] || 'pending';
      const next = current === 'pending' ? 'yes' : current === 'yes' ? 'no' : 'pending';
      return { ...prev, [studentId]: next };
    });
  };

  const handleSaveAll = async () => {
    if (!selectedSkill) return;
    const updates = Object.entries(assessments)
      .filter(([_, status]) => status !== 'pending')
      .map(([studentId, status]) => ({
        studentId,
        skillId: selectedSkill,
        mastered: status === 'yes'
      }));

    if (updates.length === 0) {
      toast({ title: 'No Changes', description: 'Mark at least one student' });
      return;
    }

    try {
      if (isOnline) {
        // Online: save directly to database
        await bulkUpdateProgress(updates);
        toast({ title: 'Success', description: `Updated ${updates.length} student records` });
        onClose();
      } else {
        // Offline: queue all updates for later sync
        updates.forEach(update => {
          offlineSyncManager.addPendingUpdate({
            studentId: update.studentId,
            skillId: update.skillId,
            mastered: update.mastered
          });
        });
        toast({ 
          title: 'Saved Offline', 
          description: `${updates.length} records queued for sync`,
          variant: 'default'
        });
        onClose();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save assessments', variant: 'destructive' });
    }
  };

  if (loading) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] overflow-hidden flex flex-col z-50 border-4 border-purple-400">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg">Live Assessment</h3>
            <p className="text-xs opacity-90">Click students to mark mastery</p>
          </div>
          <div className="scale-90 origin-top-right">
            <SyncStatusIndicator />
          </div>
        </div>
      </div>


      <div className="p-4 border-b">
        <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-sm font-semibold">
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>{skill.skill_code}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {students.map(student => {
          const status = assessments[student.id] || 'pending';
          return (
            <button key={student.id} onClick={() => toggleStatus(student.id)} className={`w-full p-3 rounded-lg border-2 flex items-center justify-between transition-all ${status === 'yes' ? 'bg-green-100 border-green-500' : status === 'no' ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-300'}`}>
              <span className="font-semibold text-sm">{student.first_name} {student.last_name}</span>
              {status === 'yes' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === 'no' && <XCircle className="w-5 h-5 text-red-600" />}
              {status === 'pending' && <Minus className="w-5 h-5 text-gray-400" />}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t bg-gray-50 flex gap-2">
        <button onClick={handleSaveAll} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save All
        </button>
        <button onClick={onClose} className="px-4 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-bold">Close</button>
      </div>
    </div>
  );
};
