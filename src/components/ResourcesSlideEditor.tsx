import React, { useRef } from 'react';
import { ResourcesData, ResourceItem } from '@/types/lesson';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package, Upload, FileText, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ResourcesSlideEditorProps {
  resourcesData: ResourcesData;
  onChange: (data: ResourcesData) => void;
}

export const ResourcesSlideEditor: React.FC<ResourcesSlideEditorProps> = ({ resourcesData, onChange }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSuperTeacher = user?.role === 'super_teacher';

  const addResource = () => {
    const newResource: ResourceItem = { id: Date.now().toString(), name: '', quantity: '' };
    onChange({ ...resourcesData, resources: [...resourcesData.resources, newResource] });
  };

  const updateResource = (id: string, field: keyof ResourceItem, value: string) => {
    onChange({
      ...resourcesData,
      resources: resourcesData.resources.map(r => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  const removeResource = (id: string) => {
    onChange({ ...resourcesData, resources: resourcesData.resources.filter(r => r.id !== id) });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.includes('pdf')) return;
    
    const fileName = `textbook-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('lesson-materials').upload(fileName, file);
    if (error) { console.error('Upload error:', error); return; }
    
    const { data: { publicUrl } } = supabase.storage.from('lesson-materials').getPublicUrl(fileName);
    onChange({ ...resourcesData, textbookPdfUrl: publicUrl, textbookPdfName: file.name });
  };

  const removePdf = () => onChange({ ...resourcesData, textbookPdfUrl: '', textbookPdfName: '' });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-blue-800">Teaching & Learning Resources</span>
      </div>
      
      {resourcesData.resources.length === 0 && (
        <p className="text-gray-500 text-sm italic">No resources added yet.</p>
      )}
      
      {resourcesData.resources.map((resource, index) => (
        <div key={resource.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">{index + 1}</span>
          <Input placeholder="Resource name" value={resource.name} onChange={(e) => updateResource(resource.id, 'name', e.target.value)} className="flex-1" />
          <Input placeholder="Qty" value={resource.quantity || ''} onChange={(e) => updateResource(resource.id, 'quantity', e.target.value)} className="w-20" />
          <Button size="sm" variant="ghost" onClick={() => removeResource(resource.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
        </div>
      ))}
      
      <Button onClick={addResource} variant="outline" className="w-full border-dashed border-blue-400 text-blue-600">
        <Plus className="w-4 h-4 mr-2" /> Add Resource
      </Button>

      {isSuperTeacher && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Student Textbook PDF</span>
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Super Teacher</span>
          </div>
          
          {resourcesData.textbookPdfUrl ? (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <FileText className="w-8 h-8 text-amber-600" />
              <div className="flex-1"><p className="font-medium text-amber-900">{resourcesData.textbookPdfName}</p><p className="text-xs text-amber-600">PDF uploaded</p></div>
              <Button size="sm" variant="ghost" onClick={removePdf} className="text-red-500"><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full border-dashed border-amber-400 text-amber-600">
                <Upload className="w-4 h-4 mr-2" /> Upload Textbook Pages (PDF)
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
