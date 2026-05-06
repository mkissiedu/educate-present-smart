import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteAllLessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean; count: number }>;
  lessonCount: number;
}

export const DeleteAllLessonsModal: React.FC<DeleteAllLessonsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lessonCount
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL') return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-red-500/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete All Lessons</h2>
            </div>
            <button onClick={handleClose} disabled={isDeleting} className="text-gray-400 hover:text-white disabled:opacity-50">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-300 text-sm font-medium mb-2">Warning: This action cannot be undone!</p>
            <p className="text-gray-300 text-sm">
              You are about to permanently delete <span className="font-bold text-white">{lessonCount} lesson(s)</span>. 
              All lesson content, slides, and associated data will be removed.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-red-400">DELETE ALL</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE ALL"
              disabled={isDeleting}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleClose} disabled={isDeleting} variant="outline" className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={confirmText !== 'DELETE ALL' || isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4 mr-2" /> Delete All</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
