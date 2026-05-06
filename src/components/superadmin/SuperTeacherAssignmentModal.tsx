import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, GraduationCap, Loader2, Save, X } from 'lucide-react';
import { User, SUBJECTS, CLASS_LEVELS, CLASS_SUBJECTS_MAP } from '@/types/user';
import { SuperTeacherAssignment, fetchSuperTeacherAssignments, bulkAssignSubjects, removeAssignment } from '@/lib/supabase-super-teacher';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  superTeacher: User | null;
  onUpdated: () => void;
}

export const SuperTeacherAssignmentModal: React.FC<Props> = ({ isOpen, onClose, superTeacher, onUpdated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignments, setAssignments] = useState<SuperTeacherAssignment[]>([]);
  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());

  useEffect(() => {
    if (isOpen && superTeacher) loadAssignments();
  }, [isOpen, superTeacher]);

  const loadAssignments = async () => {
    if (!superTeacher) return;
    setLoading(true);
    const data = await fetchSuperTeacherAssignments(superTeacher.id);
    setAssignments(data);
    const map = new Map<string, Set<string>>();
    data.forEach(a => {
      if (!map.has(a.subject)) map.set(a.subject, new Set());
      map.get(a.subject)!.add(a.class_level);
    });
    setSelected(map);
    setLoading(false);
  };

  const toggleClass = (subject: string, classLevel: string) => {
    const newSelected = new Map(selected);
    if (!newSelected.has(subject)) newSelected.set(subject, new Set());
    const classes = newSelected.get(subject)!;
    if (classes.has(classLevel)) classes.delete(classLevel);
    else classes.add(classLevel);
    if (classes.size === 0) newSelected.delete(subject);
    setSelected(newSelected);
  };

  const handleSave = async () => {
    if (!superTeacher || !user) return;
    setSaving(true);
    // Remove old assignments
    for (const a of assignments) await removeAssignment(a.id);
    // Add new assignments
    const newAssignments: { subject: string; classLevel: string }[] = [];
    selected.forEach((classes, subject) => {
      classes.forEach(cl => newAssignments.push({ subject, classLevel: cl }));
    });
    const success = await bulkAssignSubjects(superTeacher.id, newAssignments, user.id);
    setSaving(false);
    if (success) {
      toast({ title: 'Assignments updated successfully' });
      onUpdated();
      onClose();
    } else toast({ title: 'Failed to update assignments', variant: 'destructive' });
  };

  const getClassesForSubject = (subject: string) => {
    return CLASS_LEVELS.filter(cl => CLASS_SUBJECTS_MAP[cl]?.includes(subject as any));
  };

  if (!superTeacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-500" />
            Assign Subjects - {superTeacher.name}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-yellow-500" /></div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {SUBJECTS.map(subject => {
                const availableClasses = getClassesForSubject(subject);
                if (availableClasses.length === 0) return null;
                const selectedClasses = selected.get(subject) || new Set();
                return (
                  <div key={subject} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-gray-800">{subject}</span>
                      <span className="text-xs text-gray-500">({selectedClasses.size} classes)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableClasses.map(cl => (
                        <label key={cl} className="flex items-center gap-1.5 text-sm cursor-pointer bg-gray-50 px-2 py-1 rounded hover:bg-yellow-50">
                          <Checkbox checked={selectedClasses.has(cl)} onCheckedChange={() => toggleClass(subject, cl)} />
                          <span>{cl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1"><X className="w-4 h-4 mr-2" />Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Assignments
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
