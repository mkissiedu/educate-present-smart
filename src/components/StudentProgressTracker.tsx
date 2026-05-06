import React, { useState, useEffect } from 'react';
import { fetchStudents } from '../lib/supabase-students';
import { fetchSkills, fetchStudentProgress, updateProgress } from '../lib/supabase-skills';
import { Student, Skill } from '../types/student';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export const StudentProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [domain, setDomain] = useState<'Knowledge' | 'Skills'>('Skills');

  useEffect(() => {
    if (user) loadStudents();
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      loadSkills();
      loadProgress();
    }
  }, [selectedStudent, domain]);

  const loadStudents = async () => {
    if (!user) return;
    const data = await fetchStudents(user.id);
    setStudents(data);
  };

  const loadSkills = async () => {
    if (!selectedStudent) return;
    const data = await fetchSkills(domain, selectedStudent.class_level);
    setSkills(data);
  };

  const loadProgress = async () => {
    if (!selectedStudent) return;
    const data = await fetchStudentProgress(selectedStudent.id);
    setProgress(data);
  };

  const toggleMastery = async (skillId: string, currentMastery: boolean) => {
    if (!selectedStudent) return;
    await updateProgress(selectedStudent.id, skillId, !currentMastery);
    loadProgress();
  };

  const getMastery = (skillId: string) => {
    const p = progress.find(p => p.skill_id === skillId);
    return p?.mastered || false;
  };

  const exportProgress = () => {
    if (!selectedStudent) return;
    const masteredSkills = progress.filter(p => p.mastered);
    const csv = `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}\nClass: ${selectedStudent.class_level}\nDomain: ${domain}\n\nSkill Code,Skill Name,Mastered,Date\n` +
      skills.map(s => `${s.skill_code},${s.skill_name},${getMastery(s.id) ? 'Y' : 'N'},${progress.find(p => p.skill_id === s.id)?.assessed_date || ''}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStudent.first_name}_${selectedStudent.last_name}_progress.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Student Progress Tracker</h2>
      
      <div className="mb-6 flex gap-4">
        <select className="p-2 border rounded flex-1" onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
        </select>
        
        {selectedStudent && (
          <>
            <select className="p-2 border rounded" value={domain} onChange={(e) => setDomain(e.target.value as any)}>
              <option value="Skills">Skills</option>
              <option value="Knowledge">Knowledge</option>
            </select>
            <Button onClick={exportProgress}>Export CSV</Button>
          </>
        )}
      </div>

      {selectedStudent && (
        <div className="grid gap-3">
          {skills.map(skill => (
            <Card key={skill.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{skill.skill_code}</h3>
                <p className="text-sm">{skill.skill_name}</p>
              </div>
              <Button 
                onClick={() => toggleMastery(skill.id, getMastery(skill.id))}
                variant={getMastery(skill.id) ? 'default' : 'outline'}
              >
                {getMastery(skill.id) ? 'Y' : 'N'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
