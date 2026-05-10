import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { BookOpen, Plus, Trash2, Upload, FileText, Loader2, Search, RefreshCw } from 'lucide-react';
import {
  fetchKBDocuments,
  createKBDocument,
  deleteKBDocument,
  KnowledgeBaseDocument,
} from '@/lib/supabase-knowledge-base';

const SUBJECTS = [
  'Mathematics', 'English Language', 'Science', 'Social Studies',
  'Religious & Moral Education', 'Creative Arts', 'Physical Education',
  'Ghanaian Language', 'French', 'ICT', 'History',
];

const GRADES = [
  'B1','B2','B3','B4','B5','B6',
  'JHS1','JHS2','JHS3',
  'SHS1','SHS2','SHS3',
];

export const KnowledgeBaseManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<KnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<'paste' | 'file'>('paste');

  const [form, setForm] = useState({
    title: '',
    content: '',
    subject: '',
    grade_level: '',
    file_name: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setDocs(await fetchKBDocuments());
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    setDocs(await fetchKBDocuments());
    setRefreshing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
    if (!isText) {
      toast({ title: 'Only .txt and .md files are supported for direct upload', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setForm(f => ({
        ...f,
        content,
        file_name: file.name,
        title: f.title || file.name.replace(/\.[^.]+$/, ''),
      }));
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!form.content.trim()) {
      toast({ title: 'Content is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const result = await createKBDocument({
      title: form.title.trim(),
      content: form.content.trim(),
      subject: form.subject || undefined,
      grade_level: form.grade_level || undefined,
      file_name: form.file_name || undefined,
      uploaded_by: user?.id,
    });
    setSaving(false);

    if (result) {
      toast({ title: 'Document added to knowledge base' });
      setShowModal(false);
      resetForm();
      refresh();
    } else {
      toast({ title: 'Failed to save document', variant: 'destructive' });
    }
  };

  const handleDelete = async (doc: KnowledgeBaseDocument) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    const ok = await deleteKBDocument(doc.id);
    if (ok) {
      toast({ title: 'Document deleted' });
      refresh();
    } else {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', subject: '', grade_level: '', file_name: '' });
    setUploadMode('paste');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Knowledge Base
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            Upload reference documents that Claude uses when generating questions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" /> Add Document
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
        />
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-purple-200">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading documents...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-purple-300">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{search ? 'No documents match your search.' : 'No documents yet. Add your first knowledge base document.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <FileText className="w-4 h-4 text-purple-300 flex-shrink-0" />
                  <span className="text-white font-semibold">{doc.title}</span>
                  {doc.subject && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">{doc.subject}</Badge>
                  )}
                  {doc.grade_level && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{doc.grade_level}</Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{doc.content.substring(0, 160)}…</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {doc.file_name && <span>{doc.file_name}</span>}
                  <span>{doc.content.length.toLocaleString()} characters</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(doc)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      <Dialog open={showModal} onOpenChange={o => { if (!o) { setShowModal(false); resetForm(); } }}>
        <DialogContent className="bg-white text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Add Knowledge Base Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. NaCCA Mathematics B4 Curriculum Guide"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subject (optional)</Label>
                <select
                  title="Subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All subjects</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Grade Level (optional)</Label>
                <select
                  title="Grade Level"
                  value={form.grade_level}
                  onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All grades</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Upload mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setUploadMode('paste')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${uploadMode === 'paste' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Paste Text
              </button>
              <button
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Upload File (.txt / .md)
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Click to select a .txt or .md file</p>
                {form.file_name && (
                  <p className="text-purple-600 text-sm font-medium mt-2">{form.file_name} — {form.content.length.toLocaleString()} characters loaded</p>
                )}
                <input ref={fileInputRef} type="file" accept=".txt,.md,text/plain" className="hidden" aria-label="Upload knowledge base file" onChange={handleFileUpload} />
              </div>
            ) : (
              <div>
                <Label>Content <span className="text-red-500">*</span></Label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Paste your curriculum content, lesson notes, or reference material here..."
                  rows={10}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">{form.content.length.toLocaleString()} characters</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBaseManager;
