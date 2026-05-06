import React from 'react';
import { PlanningChecklist as ChecklistType } from '@/types/planning';
import { CheckCircle2, Circle, BookOpen, FileText, Key, PenLine, Eye } from 'lucide-react';

interface PlanningChecklistProps {
  checklist: ChecklistType;
  onChange: (checklist: ChecklistType) => void;
}

const checklistItems = [
  { key: 'reviewedContent', label: 'Review lesson content', icon: Eye, description: 'Go through all slides and activities' },
  { key: 'checkedTextbook', label: 'Check textbook pages', icon: BookOpen, description: 'Review relevant student textbook sections' },
  { key: 'checkedWorkbook', label: 'Check workbook pages', icon: FileText, description: 'Review workbook exercises and activities' },
  { key: 'checkedAnswerKey', label: 'Review answer key', icon: Key, description: 'Familiarize with correct answers' },
  { key: 'addedNotes', label: 'Add personal notes', icon: PenLine, description: 'Add your own teaching notes (optional)' },
] as const;

export const PlanningChecklistComponent: React.FC<PlanningChecklistProps> = ({ checklist, onChange }) => {
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalRequired = 4; // All except addedNotes

  const toggleItem = (key: keyof ChecklistType) => {
    onChange({ ...checklist, [key]: !checklist[key] });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm">Planning Checklist</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          completedCount >= totalRequired ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {completedCount}/{checklistItems.length}
        </span>
      </div>

      <div className="space-y-2">
        {checklistItems.map(({ key, label, icon: Icon, description }) => (
          <button
            key={key}
            onClick={() => toggleItem(key)}
            className={`w-full flex items-start gap-2 p-2 rounded-lg transition-all text-left ${
              checklist[key] 
                ? 'bg-green-50 border border-green-300' 
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`mt-0.5 ${checklist[key] ? 'text-green-600' : 'text-gray-400'}`}>
              {checklist[key] ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${checklist[key] ? 'text-green-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${checklist[key] ? 'text-green-700' : 'text-gray-700'}`}>
                  {label}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 text-center">
          Complete 5 minutes of planning to mark as Ready to Teach
        </p>
      </div>
    </div>
  );
};
