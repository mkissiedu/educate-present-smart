import React, { useState } from 'react';
import { LessonResource } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, FileImage, FileVideo, FileAudio, FileText, Link, X } from 'lucide-react';

interface Props {
  resources: LessonResource[];
  onChange: (resources: LessonResource[]) => void;
}

export const LessonResourceManager: React.FC<Props> = ({ resources, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', type: 'link' as LessonResource['type'], url: '' });

  const handleAdd = () => {
    if (!newResource.name || !newResource.url) return;
    const resource: LessonResource = {
      id: Date.now().toString(),
      name: newResource.name,
      type: newResource.type,
      url: newResource.url,
    };
    onChange([...resources, resource]);
    setNewResource({ name: '', type: 'link', url: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onChange(resources.filter(r => r.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'document';
      const resource: LessonResource = {
        id: Date.now().toString(),
        name: file.name,
        type,
        url: reader.result as string,
      };
      onChange([...resources, resource]);
    };
    reader.readAsDataURL(file);
  };

  const getIcon = (type: LessonResource['type']) => {
    switch (type) {
      case 'image': return <FileImage className="w-4 h-4" />;
      case 'video': return <FileVideo className="w-4 h-4" />;
      case 'audio': return <FileAudio className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-purple-700">Lesson Resources</h3>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600">
              <Plus className="w-4 h-4" /> Upload
            </span>
          </label>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-purple-500 hover:bg-purple-600">
            <Link className="w-4 h-4 mr-1" /> Add Link
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200 space-y-2">
          <Input placeholder="Resource name" value={newResource.name} onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} />
          <Input placeholder="URL" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-green-500 hover:bg-green-600">Add</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No resources added yet</p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border shadow-sm">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">{getIcon(r.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">{r.url.substring(0, 50)}...</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
