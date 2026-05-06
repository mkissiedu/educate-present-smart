import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, CLASS_LEVELS, ClassLevel } from '@/types/user';
import { createUser, fetchAllUsers, updateUser, deleteUser } from '@/lib/supabase-admin';
import { adminResetPassword } from '@/lib/otp-auth';
import { getSchoolTeacherAssignments, TeacherAssignmentRecord } from '@/lib/supabase-teacher-assignments';
import { TeacherAssignmentModal } from './TeacherAssignmentModal';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit2, Trash2, UserPlus, Loader2, Search, AlertCircle, KeyRound, CheckCircle, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TeacherManagement: React.FC = () => {
  const { toast } = useToast();
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Record<string, TeacherAssignmentRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const schoolId = currentSchool?.id || user?.school_id;

  useEffect(() => { if (schoolId) loadData(); }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    const [users, assignmentList] = await Promise.all([
      fetchAllUsers(schoolId),
      getSchoolTeacherAssignments(schoolId!)
    ]);
    setTeachers(users.filter(u => u.role === 'teacher'));
    const assignMap: Record<string, TeacherAssignmentRecord> = {};
    assignmentList.forEach(a => { assignMap[a.teacher_id] = a; });
    setAssignments(assignMap);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingTeacher) {
      const updates: any = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) updates.password = form.password;
      const success = await updateUser(editingTeacher.id, updates);
      setSaving(false);
      if (success) { toast({ title: 'Teacher updated!' }); loadData(); setShowForm(false); }
      else toast({ title: 'Error updating teacher', variant: 'destructive' });
    } else {
      const result = await createUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'teacher', assignedClasses: [], school_id: schoolId, created_by: user?.id });
      setSaving(false);
      if (result.user) { toast({ title: 'Teacher created!' }); loadData(); setShowForm(false); }
      else toast({ title: result.error || 'Error creating teacher', variant: 'destructive' });
    }
  };

  const handleEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setForm({ name: teacher.name, email: teacher.email, phone: teacher.phone || '', password: '' });
    setShowForm(true);
  };

  const handleAssign = (teacher: User) => { setAssignTarget(teacher); setShowAssignModal(true); };
  const handleDelete = async (id: string) => { if (confirm('Delete this teacher?')) { await deleteUser(id); toast({ title: 'Teacher deleted' }); loadData(); } };
  const handleResetPassword = (teacher: User) => { setResetTarget(teacher); setNewPassword(''); setShowResetModal(true); };

  const confirmResetPassword = async () => {
    if (!resetTarget || !newPassword || newPassword.length < 6) { toast({ title: 'Password must be at least 6 characters', variant: 'destructive' }); return; }
    setResetting(true);
    const result = await adminResetPassword(user?.id || '', resetTarget.id, newPassword);
    setResetting(false);
    if (result.success) { toast({ title: 'Password reset successfully!' }); setShowResetModal(false); }
    else toast({ title: result.error || 'Failed to reset password', variant: 'destructive' });
  };

  const resetForm = () => { setEditingTeacher(null); setForm({ name: '', email: '', phone: '', password: '' }); setShowForm(true); };
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  const getAssignmentSummary = (teacherId: string) => {
    const a = assignments[teacherId];
    if (!a || a.assigned_classes.length === 0) return 'No assignment';
    return `${a.assigned_classes.length} class(es), ${a.assigned_subjects.length} subject(s)`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Teacher Management</h2>
        <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700"><UserPlus className="w-4 h-4 mr-2" /> Add Teacher</Button>
      </div>
      {!schoolId && <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 flex items-center gap-2 text-yellow-200"><AlertCircle className="w-5 h-5" /><span className="text-sm">Please select a school to manage teachers</span></div>}
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="pl-10 bg-white/10 border-white/20 text-white" /></div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-white" /></div> : (
        <div className="grid gap-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{t.name}</div>
                <div className="text-sm text-gray-300">{t.email} {t.phone && `• ${t.phone}`}</div>
                <div className="text-xs text-emerald-400 mt-1">{getAssignmentSummary(t.id)}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleAssign(t)} className="text-emerald-400" title="Assign Classes"><ClipboardList className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleResetPassword(t)} className="text-yellow-400" title="Reset Password"><KeyRound className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(t)} className="text-blue-400"><Edit2 className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No teachers found</p>}
        </div>
      )}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader><DialogTitle className="text-gray-900">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label className="text-gray-700">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <div><Label className="text-gray-700">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <div><Label className="text-gray-700">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233..." className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <div><Label className="text-gray-700">Password {editingTeacher && '(leave blank to keep)'}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editingTeacher} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingTeacher ? 'Update' : 'Create'} Teacher</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-gray-900"><KeyRound className="w-5 h-5 text-yellow-500" />Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Reset password for <strong className="text-gray-900">{resetTarget?.name}</strong></p>
            <div><Label className="text-gray-700">New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <Button onClick={confirmResetPassword} disabled={resetting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">{resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}Reset Password</Button>
          </div>
        </DialogContent>
      </Dialog>
      {assignTarget && schoolId && (
        <TeacherAssignmentModal teacher={assignTarget} schoolId={schoolId} adminId={user?.id || ''} open={showAssignModal} onClose={() => { setShowAssignModal(false); setAssignTarget(null); }} onSaved={loadData} />
      )}
    </div>
  );
};
