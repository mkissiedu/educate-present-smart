import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchSMSTemplates, updateSMSTemplate, createSMSTemplate, deleteSMSTemplate, SMSTemplate } from '@/lib/supabase-settings';
import { MessageSquare, Save, Loader2, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const SMSTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<SMSTemplate | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({ template_key: '', template_name: '', template_content: '', placeholders: '' });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await fetchSMSTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const handleEdit = (t: SMSTemplate) => {
    setEditTemplate(t);
    setForm({ template_key: t.template_key, template_name: t.template_name, template_content: t.template_content, placeholders: t.placeholders.join(', ') });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditTemplate(null);
    setForm({ template_key: '', template_name: '', template_content: '', placeholders: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.template_name || !form.template_content) { setError('Name and content are required'); return; }
    setSaving(true); setError('');
    const placeholders = form.placeholders.split(',').map(p => p.trim()).filter(Boolean);
    
    if (editTemplate) {
      const ok = await updateSMSTemplate(editTemplate.id, form.template_content);
      if (ok) { setSuccess('Template updated!'); loadTemplates(); setShowModal(false); }
      else setError('Failed to update template');
    } else {
      const result = await createSMSTemplate({
        template_key: form.template_key || form.template_name.toLowerCase().replace(/\s+/g, '_'),
        template_name: form.template_name,
        template_content: form.template_content,
        placeholders,
        is_active: true
      });
      if (result) { setSuccess('Template created!'); loadTemplates(); setShowModal(false); }
      else setError('Failed to create template');
    }
    setSaving(false);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    const ok = await deleteSMSTemplate(id);
    if (ok) { setSuccess('Template deleted'); loadTemplates(); }
    else setError('Failed to delete template');
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><MessageSquare className="w-6 h-6" />SMS Templates</h2>
        <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      {success && <div className="flex items-center gap-2 bg-green-500/20 text-green-300 p-3 rounded-lg mb-4"><CheckCircle className="w-5 h-5" />{success}</div>}
      {error && <div className="flex items-center gap-2 bg-red-500/20 text-red-300 p-3 rounded-lg mb-4"><AlertCircle className="w-5 h-5" />{error}</div>}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2 text-blue-200 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Available Placeholders</p>
            <p>Use <code className="bg-white/10 px-1 rounded">{'{{placeholder}}'}</code> syntax. Common: <code>{'{{code}}'}</code>, <code>{'{{name}}'}</code>, <code>{'{{student_name}}'}</code>, <code>{'{{date}}'}</code>, <code>{'{{score}}'}</code>, <code>{'{{subject}}'}</code>, <code>{'{{status}}'}</code></p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map(t => (
          <Card key={t.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{t.template_name}</h3>
                    <Badge variant="outline" className="text-xs text-gray-400">{t.template_key}</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2 font-mono bg-white/5 p-2 rounded">{t.template_content}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.placeholders.map(p => <Badge key={p} className="bg-purple-500/20 text-purple-300 text-xs">{`{{${p}}}`}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(t)} className="border-white/20 text-white hover:bg-white/10"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">{editTemplate ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editTemplate && (
              <>
                <div><Label className="text-gray-700">Template Key</Label><Input value={form.template_key} onChange={(e) => setForm({...form, template_key: e.target.value})} placeholder="e.g., welcome_message" className="bg-gray-50 border-gray-300 text-gray-900" /></div>
                <div><Label className="text-gray-700">Template Name</Label><Input value={form.template_name} onChange={(e) => setForm({...form, template_name: e.target.value})} placeholder="e.g., Welcome Message" className="bg-gray-50 border-gray-300 text-gray-900" /></div>
              </>
            )}
            <div><Label className="text-gray-700">Message Content</Label><Textarea value={form.template_content} onChange={(e) => setForm({...form, template_content: e.target.value})} placeholder="Your code is {{code}}. Valid for 10 minutes." rows={4} className="bg-gray-50 border-gray-300 text-gray-900" /></div>
            {!editTemplate && <div><Label className="text-gray-700">Placeholders (comma-separated)</Label><Input value={form.placeholders} onChange={(e) => setForm({...form, placeholders: e.target.value})} placeholder="code, name, date" className="bg-gray-50 border-gray-300 text-gray-900" /></div>}
            <Button onClick={handleSave} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
