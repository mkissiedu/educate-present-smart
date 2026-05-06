import React from 'react';
import { Student } from '@/types/student';
import { PromotionAction, getNextClass } from '@/lib/supabase-promotion';
import { ArrowRight, CheckCircle, XCircle, GraduationCap } from 'lucide-react';

interface Props {
  students: Student[];
  actions: Record<string, PromotionAction>;
  onActionChange: (studentId: string, action: PromotionAction) => void;
  onSelectAll: (action: PromotionAction) => void;
  currentClass: string;
}

export const ClassPromotionList: React.FC<Props> = ({
  students, actions, onActionChange, onSelectAll, currentClass
}) => {
  const nextClass = getNextClass(currentClass);
  const isFinalClass = nextClass === 'Graduated';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {currentClass} <ArrowRight className="w-4 h-4 inline mx-1" /> {nextClass}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSelectAll('promote')} className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">
            All Promote
          </button>
          <button onClick={() => onSelectAll('retain')} className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200">
            All Retain
          </button>
          {isFinalClass && (
            <button onClick={() => onSelectAll('graduate')} className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200">
              All Graduate
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {students.map((student, idx) => {
          const action = actions[student.id] || 'promote';
          return (
            <div key={student.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              action === 'promote' ? 'bg-green-50 border-green-200' :
              action === 'retain' ? 'bg-orange-50 border-orange-200' :
              'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-medium text-gray-800">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.student_id || 'No ID'}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onActionChange(student.id, 'promote')}
                  className={`p-2 rounded-lg transition-all ${action === 'promote' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-100'}`}
                  title="Promote"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onActionChange(student.id, 'retain')}
                  className={`p-2 rounded-lg transition-all ${action === 'retain' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-orange-100'}`}
                  title="Retain"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                {isFinalClass && (
                  <button
                    onClick={() => onActionChange(student.id, 'graduate')}
                    className={`p-2 rounded-lg transition-all ${action === 'graduate' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-purple-100'}`}
                    title="Graduate"
                  >
                    <GraduationCap className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
