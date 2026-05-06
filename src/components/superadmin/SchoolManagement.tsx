import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { School, Plus, Edit2, Trash2, Building2, User, Search, Mail, MapPin, KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { School as SchoolType } from '@/types/school';
import { User as UserType } from '@/types/user';
import { fetchSchools, updateSchool, deleteSchool } from '@/lib/supabase-schools';
import { createSchoolWithAdmin, fetchAllUsers } from '@/lib/supabase-admin';
import { adminResetPassword } from '@/lib/otp-auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const SchoolManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [admins, setAdmins] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', email: '', motto: '', academic_year: '2024/2025', adminName: '', adminEmail: '', adminPhone: '', adminPassword: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [schoolList, userList] = await Promise.all([fetchSchools(), fetchAllUsers()]);
    setSchools(schoolList);
    setAdmins(userList.filter(u => u.role === 'school_admin'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingSchool) {
      const success = await updateSchool(editingSchool.id, { name: form.name, code: form.code, address: form.address, phone: form.phone, email: form.email, motto: form.motto, academic_year: form.academic_year });
      setSaving(false);
      if (success) { toast({ title: 'School updated successfully' }); loadData(); resetForm(); }
    } else {
      const result = await createSchoolWithAdmin(
        { name: form.name, code: form.code, address: form.address, phone: form.phone, email: form.email, motto: form.motto, academic_year: form.academic_year },
        { name: form.adminName, email: form.adminEmail, phone: form.adminPhone, password: form.adminPassword },
        user?.id
      );
      setSaving(false);
      if (result.school) { toast({ title: 'School and admin created successfully' }); loadData(); resetForm(); }
      else toast({ title: result.error || 'Failed to create school', variant: 'destructive' });
    }
  };

  const handleDelete = async (school: SchoolType) => {
    if (confirm(`Deactivate "${school.name}"?`)) {
      const success = await deleteSchool(school.id);
      if (success) { toast({ title: 'School deactivated' }); loadData(); }
    }
  };

  const handleResetPassword = (admin: UserType) => { setResetTarget(admin); setNewPassword(''); setShowResetModal(true); };

  const confirmResetPassword = async () => {
    if (!resetTarget || !newPassword || newPassword.length < 6) { toast({ title: 'Password must be at least 6 characters', variant: 'destructive' }); return; }
    setResetting(true);
    const result = await adminResetPassword(user?.id || '', resetTarget.id, newPassword);
    setResetting(false);
    if (result.success) { toast({ title: 'Password reset!' }); setShowResetModal(false); }
    else toast({ title: result.error || 'Failed', variant: 'destructive' });
  };

  const resetForm = () => { setShowModal(false); setEditingSchool(null); setForm({ name: '', code: '', address: '', phone: '', email: '', motto: '', academic_year: '2024/2025', adminName: '', adminEmail: '', adminPhone: '', adminPassword: '' }); };

  const handleEdit = (school: SchoolType) => {
    setEditingSchool(school);
    setForm({ ...form, name: school.name, code: school.code, address: school.address || '', phone: school.phone || '', email: school.email || '', motto: school.motto || '', academic_year: school.academic_year || '2024/2025' });
    setShowModal(true);
  };

  const getSchoolAdmin = (schoolId: string) => admins.find(a => a.school_id === schoolId);
  const filtered = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 className="w-6 h-6" /> Schools & Admins</h2>
        <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" /> Add School</Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schools..." className="pl-10 bg-white/10 border-white/20 text-white" />
      </div>
      <div className="grid gap-4">
        {filtered.map(school => {
          const admin = getSchoolAdmin(school.id);
          return (
            <div key={school.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><School className="w-7 h-7 text-white" /></div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{school.name}</h3>
                    <p className="text-purple-300 text-sm">Code: {school.code} • {school.academic_year || '2024/2025'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(school)} className="text-purple-300 hover:text-white h-8 w-8 p-0"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(school)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 grid md:grid-cols-2 gap-2 text-sm">
                {school.address && <p className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {school.address}</p>}
                {school.email && <p className="text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {school.email}</p>}
                {admin && (<div className="flex items-center gap-2 col-span-2"><p className="text-emerald-400 flex items-center gap-1"><User className="w-3 h-3" /> Admin: {admin.name} ({admin.email})</p><Button size="sm" variant="ghost" onClick={() => handleResetPassword(admin)} className="text-yellow-400 h-6 px-2" title="Reset Password"><KeyRound className="w-3 h-3" /></Button></div>)}
                {!admin && <p className="text-yellow-400 text-xs col-span-2">No admin assigned</p>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No schools found</p>}
      </div>

      <Dialog open={showModal} onOpenChange={resetForm}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">School Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              <div><Label className="text-gray-700">School Code</Label><Input value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            <div><Label className="text-gray-700">Address</Label><Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-gray-700">Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              <div><Label className="text-gray-700">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            </div>
            {!editingSchool && (<><div className="border-t border-gray-200 pt-3 mt-3"><h4 className="font-bold text-purple-600 mb-2">School Admin Details</h4></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-gray-700">Admin Name</Label><Input value={form.adminName} onChange={(e) => setForm({...form, adminName: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" /></div><div><Label className="text-gray-700">Admin Email</Label><Input value={form.adminEmail} onChange={(e) => setForm({...form, adminEmail: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" /></div></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-gray-700">Admin Phone</Label><Input value={form.adminPhone} onChange={(e) => setForm({...form, adminPhone: e.target.value})} className="bg-gray-50 border-gray-300 text-gray-900" /></div><div><Label className="text-gray-700">Password</Label><Input type="password" value={form.adminPassword} onChange={(e) => setForm({...form, adminPassword: e.target.value})} required className="bg-gray-50 border-gray-300 text-gray-900" /></div></div></>)}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingSchool ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-gray-900"><KeyRound className="w-5 h-5 text-yellow-500" />Reset Admin Password</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Reset password for <strong className="text-gray-900">{resetTarget?.name}</strong></p>
            <div><Label className="text-gray-700">New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            <Button onClick={confirmResetPassword} disabled={resetting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">{resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}Reset Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
