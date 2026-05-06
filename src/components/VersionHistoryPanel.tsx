import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LessonVersion } from '@/types/review';
import { fetchLessonVersions, createVersion, getVersionContent } from '@/lib/supabase-versions';
import { useAuth } from '@/contexts/AuthContext';
import { History, Save, Eye, RotateCcw, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/lesson';
import { Input } from '@/components/ui/input';

interface VersionHistoryPanelProps {
  lesson: Lesson;
  onRestoreVersion?: (content: any) => void;
}

export function VersionHistoryPanel({ lesson, onRestoreVersion }: VersionHistoryPanelProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [previewVersion, setPreviewVersion] = useState<LessonVersion | null>(null);

  useEffect(() => { loadVersions(); }, [lesson.id]);

  const loadVersions = async () => {
    setLoading(true);
    const data = await fetchLessonVersions(lesson.id);
    setVersions(data);
    setLoading(false);
  };

  const handleSaveVersion = async () => {
    if (!user) return;
    const result = await createVersion(lesson.id, lesson, changeSummary || 'Manual save', user.id, user.name);
    if (result) {
      toast({ title: 'Version Saved', description: `Version ${result.version_number} created` });
      setShowSaveDialog(false);
      setChangeSummary('');
      loadVersions();
    }
  };

  const handlePreview = async (version: LessonVersion) => {
    setPreviewVersion(version);
  };

  const handleRestore = async (version: LessonVersion) => {
    if (onRestoreVersion && version.content) {
      onRestoreVersion(version.content);
      toast({ title: 'Version Restored', description: `Restored to version ${version.version_number}` });
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4" /> Version History
            </CardTitle>
            <Button size="sm" onClick={() => setShowSaveDialog(true)} className="h-7 text-xs">
              <Save className="w-3 h-3 mr-1" /> Save Version
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading versions...</p>
          ) : versions.length === 0 ? (
            <div className="text-center py-6">
              <GitBranch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No versions saved yet</p>
              <p className="text-xs text-gray-400">Save a version to track changes</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {versions.map((version, index) => (
                  <div key={version.id} className={`p-3 rounded-lg border ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">v{version.version_number}</span>
                          {index === 0 && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Latest</span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{version.change_summary || 'No description'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {version.created_by_name} • {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(version)} className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        {index > 0 && onRestoreVersion && (
                          <Button size="sm" variant="ghost" onClick={() => handleRestore(version)} className="h-6 w-6 p-0">
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Change Summary</label>
              <Input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} placeholder="Describe what changed..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveVersion}>Save Version</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version {previewVersion?.version_number} Preview</DialogTitle>
          </DialogHeader>
          {previewVersion && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{previewVersion.change_summary}</p>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-[400px]">
                {JSON.stringify(previewVersion.content, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
