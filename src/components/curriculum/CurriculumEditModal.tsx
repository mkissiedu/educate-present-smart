import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';

type ModalType = 'class' | 'subject' | 'strand' | 'subStrand' | 'standard' | 'indicator';

interface Props {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

const titles: Record<ModalType, string> = {
  class: 'Add New Class/Grade Level',
  subject: 'Add New Subject',
  strand: 'Add New Strand',
  subStrand: 'Add New Sub-Strand',
  standard: 'Add New Content Standard',
  indicator: 'Add New Indicator'
};

export const CurriculumEditModal: React.FC<Props> = ({ open, onClose, type, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || '#10b981');

  const handleSave = async () => {
    setLoading(true);
    try {
      const data: any = {};
      if (type === 'class' || type === 'subject' || type === 'strand' || type === 'subStrand') {
        data.name = name;
      }
      if (type === 'strand') data.color = color;
      if (type === 'standard' || type === 'indicator') {
        data.code = code;
        data.description = description;
      }
      await onSave(data);
      onClose();
      setName(''); setCode(''); setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {(type === 'class' || type === 'subject' || type === 'strand' || type === 'subStrand') && (
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Enter ${type} name`} />
            </div>
          )}
          {type === 'strand' && (
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 p-1" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          )}
          {(type === 'standard' || type === 'indicator') && (
            <>
              <div>
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., B1.1.1.1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
