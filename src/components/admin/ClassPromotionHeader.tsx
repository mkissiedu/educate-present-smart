import React from 'react';
import { ArrowUpCircle, Users, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { DEFAULT_CLASSES } from '@/lib/curriculum-defaults';

interface Props {
  stats: { total: number; promote: number; retain: number; graduate: number };
  selectedClass: string;
  onClassChange: (c: string) => void;
  classes: string[];
  isProcessing: boolean;
  onProcess: () => void;
}

// Group classes by category for better organization
const groupedDefaultClasses = DEFAULT_CLASSES.reduce((acc, cls) => {
  if (!acc[cls.category]) acc[cls.category] = [];
  acc[cls.category].push(cls);
  return acc;
}, {} as Record<string, typeof DEFAULT_CLASSES>);

export const ClassPromotionHeader: React.FC<Props> = ({
  stats, selectedClass, onClassChange, classes, isProcessing, onProcess
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ArrowUpCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Class Promotion</h2>
            <p className="text-sm text-gray-500">Promote students to the next academic year (13 Classes)</p>
          </div>
        </div>
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-w-[200px]"
        >
          <option value="">Select Class</option>
          {Object.entries(groupedDefaultClasses).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map(c => (
                <option key={c.grade_level} value={c.name}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-xs text-blue-600">Total</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-700">{stats.promote}</div>
          <div className="text-xs text-green-600">Promote</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <XCircle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-orange-700">{stats.retain}</div>
          <div className="text-xs text-orange-600">Retain</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <GraduationCap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-purple-700">{stats.graduate}</div>
          <div className="text-xs text-purple-600">Graduate</div>
        </div>
      </div>

      {selectedClass && stats.total > 0 && (
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? 'Processing...' : 'Apply Promotions'}
          <ArrowUpCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
