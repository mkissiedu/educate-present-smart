import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Plus, Edit2, Trash2, Search, Mail, Phone, KeyRound, Loader2, CheckCircle, BookOpen } from 'lucide-react';
import { User } from '@/types/user';
import { fetchUsersByRole, createUser, updateUser, deleteUser } from '@/lib/supabase-admin';
import { fetchAllSuperTeacherAssignments, SuperTeacherAssignment } from '@/lib/supabase-super-teacher';
import { adminResetPassword } from '@/lib/otp-auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SuperTeacherAssignmentModal } from './SuperTeacherAssignmentModal';

export const SuperTeacherManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [superTeachers, setSuperTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<SuperTeacherAssignment[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [users, allAssignments] = await Promise.all([
      fetchUsersByRole('super_teacher'),
      fetchAllSuperTeacherAssignments()
    ]);
    setSuperTeachers(users);
    setAssignments(allAssignments);
  };

  const getTeacherAssignments = (teacherId: string) => assignments.filter(a => a.super_teacher_id === teacherId);
  const getUniqueSubjects = (teacherId: string) => [...new Set(getTeacherAssignments(teacherId).map(a => a.subject))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingUser) {
      const updates: any = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) updates.password = form.password;
      const success = await updateUser(editingUser.id, updates);
      setSaving(false);
      if (success) { toast({ title: 'Super Teacher updated' }); loadData(); resetForm(); }
      else toast({ title: 'Failed to update', variant: 'destructive' });
    } else {
      const result = await createUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'super_teacher', assignedClasses: [], created_by: user?.id });
      setSaving(false);
      if (result.user) { toast({ title: 'Super Teacher created' }); loadData(); resetForm(); }
      else toast({ title: result.error || 'Failed to create', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this Super Teacher?')) {
      if (await deleteUser(id)) { toast({ title: 'Deleted' }); loadData(); }
    }
  };

  const handleResetPassword = (target: User) => { setResetTarget(target); setNewPassword(''); setShowResetModal(true); };
  const handleAssign = (target: User) => { setSelectedTeacher(target); setShowAssignModal(true); };

  const confirmResetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) { toast({ title: 'Min 6 characters', variant: 'destructive' }); return; }
    setResetting(true);
    const result = await adminResetPassword(user?.id || '', resetTarget.id, newPassword);
    setResetting(false);
    if (result.success) { toast({ title: 'Password reset!' }); setShowResetModal(false); }
    else toast({ title: result.error || 'Failed', variant: 'destructive' });
  };

  const resetForm = () => { setShowModal(false); setEditingUser(null); setForm({ name: '', email: '', phone: '', password: '' }); };
  const handleEdit = (target: User) => { setEditingUser(target); setForm({ name: target.name, email: target.email, phone: target.phone || '', password: '' }); setShowModal(true); };
  const filtered = superTeachers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Crown className="w-6 h-6 text-yellow-400" /> Super Teachers</h2>
        <Button onClick={() => setShowModal(true)} className="bg-yellow-600 hover:bg-yellow-700"><Plus className="w-4 h-4 mr-2" /> Add</Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-10 bg-white/10 border-white/20 text-white" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(u => {
          const subjects = getUniqueSubjects(u.id);
          return (
            <div key={u.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"><Crown className="w-6 h-6 text-white" /></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleAssign(u)} className="text-green-300 hover:text-white h-8 w-8 p-0" title="Assign Subjects"><BookOpen className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleResetPassword(u)} className="text-yellow-300 hover:text-white h-8 w-8 p-0" title="Reset Password"><KeyRound className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(u)} className="text-blue-300 hover:text-white h-8 w-8 p-0"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <h3 className="text-white font-bold">{u.name}</h3>
              <p className="text-yellow-300 text-sm flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {u.email}</p>
              {u.phone && <p className="text-gray-400 text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</p>}
              {subjects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {subjects.slice(0, 3).map(s => <span key={s} className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded">{s}</span>)}
                  {subjects.length > 3 && <span className="text-xs text-yellow-300">+{subjects.length - 3}</span>}
                </div>
              )}
              {subjects.length === 0 && <p className="text-gray-500 text-xs mt-2 italic">No subjects assigned</p>}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">No super teachers found</p>}
      </div>

      <Dialog open={showModal} onOpenChange={resetForm}>
        <DialogContent className="bg-white text-gray-900">
          <DialogHeader><DialogTitle>{editingUser ? 'Edit' : 'Add'} Super Teacher</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+233..." /></div>
            <div><Label>{editingUser ? 'New Password (optional)' : 'Password'}</Label><Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required={!editingUser} /></div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-yellow-500 hover:bg-yellow-600">{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editingUser ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-white text-gray-900">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-yellow-500" />Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Reset password for <strong>{resetTarget?.name}</strong></p>
            <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 chars" /></div>
            <Button onClick={confirmResetPassword} disabled={resetting} className="w-full bg-yellow-500 hover:bg-yellow-600">{resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}Reset</Button>
          </div>
        </DialogContent>
      </Dialog>

      <SuperTeacherAssignmentModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} superTeacher={selectedTeacher} onUpdated={loadData} />
    </div>
  );
};
