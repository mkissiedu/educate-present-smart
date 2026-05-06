import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUsersByRole, createUser, deleteUser } from '@/lib/supabase-admin';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { ShieldCheck, Plus, Trash2, Loader2, Mail, Phone, Calendar } from 'lucide-react';

export const SuperAdminAccountManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchUsersByRole('super_admin');
      setAdmins(list);
    } catch (err) {
      console.error('[SuperAdminAccountManager] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    else if (admins.some(a => a.email?.toLowerCase() === form.email.trim().toLowerCase())) {
      e.email = 'A super admin with this email already exists';
    }
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!user) {
      toast({ title: 'Not authenticated', description: 'Please log in again.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: 'super_admin',
        created_by: user.id,
      });

      if (result.error || !result.user) {
        console.error('[SuperAdminAccountManager] createUser failed:', result.error);
        toast({
          title: 'Failed to create super admin',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Super admin created',
        description: `${result.user.name} can now sign in with their email and password.`,
      });
      setOpen(false);
      resetForm();
      await load();
    } catch (err: any) {
      console.error('[SuperAdminAccountManager] submit exception:', err);
      toast({
        title: 'Error creating super admin',
        description: err?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (item: User) => {
    if (!user) return;
    if (item.id === user.id) return;
    if (!confirm(`Deactivate super admin "${item.name}"? This will permanently remove their account.`)) return;

    setDeletingId(item.id);
    try {
      const ok = await deleteUser(item.id);
      if (!ok) {
        toast({
          title: 'Failed to deactivate',
          description: 'Could not remove this account. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Super admin deactivated', description: `${item.name} has been removed.` });
      await load();
    } catch (err) {
      console.error('[SuperAdminAccountManager] deactivate error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Super Admin Accounts
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            Manage users with full platform-wide administrative access.
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Super Admin
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-purple-200">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading accounts...
        </div>
      ) : admins.length === 0 ? (
        <Card className="p-8 text-center bg-white/5 border-white/10">
          <ShieldCheck className="w-12 h-12 text-purple-300 mx-auto mb-3 opacity-60" />
          <p className="text-white font-medium">No super admin accounts found</p>
          <p className="text-purple-200 text-sm mt-1">
            Click "Add Super Admin" to create the first account.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {admins.map(item => {
            const isSelf = item.id === user?.id;
            const isDeleting = deletingId === item.id;
            return (
              <Card
                key={item.id}
                className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {item.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{item.name}</h3>
                        {isSelf && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">You</Badge>
                        )}
                        <Badge variant="outline" className="border-purple-400 text-purple-200">
                          Super Admin
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-purple-200 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {item.email}
                        </span>
                        {item.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {item.phone}
                          </span>
                        )}
                        {(item as any).created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date((item as any).created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isSelf || isDeleting}
                    onClick={() => handleDeactivate(item)}
                    className={isSelf ? 'opacity-40 cursor-not-allowed' : ''}
                    title={isSelf ? 'You cannot deactivate your own account' : 'Deactivate this account'}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    Deactivate
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" /> Add Super Admin
            </DialogTitle>
            <DialogDescription>
              Create a new account with full platform-wide administrative privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sa-name">Full Name *</Label>
              <Input
                id="sa-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
                disabled={submitting}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="sa-email">Email *</Label>
              <Input
                id="sa-email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                disabled={submitting}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="sa-phone">Phone (optional)</Label>
              <Input
                id="sa-phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+233 ..."
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="sa-password">Password *</Label>
              <Input
                id="sa-password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
                disabled={submitting}
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="sa-confirm">Confirm Password *</Label>
              <Input
                id="sa-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter password"
                disabled={submitting}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); resetForm(); }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Create Super Admin</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminAccountManager;
