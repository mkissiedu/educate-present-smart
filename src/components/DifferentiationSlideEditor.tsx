import React from 'react';
import { DifferentiationData } from '@/types/lesson';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, TrendingUp, Target, HelpCircle } from 'lucide-react';

interface DifferentiationSlideEditorProps {
  differentiationData: DifferentiationData;
  onChange: (data: DifferentiationData) => void;
}

export const DifferentiationSlideEditor: React.FC<DifferentiationSlideEditorProps> = ({ differentiationData, onChange }) => {
  const sections = [
    { key: 'extending' as const, title: 'Extending', desc: 'For advanced learners', icon: TrendingUp, color: 'green' },
    { key: 'consolidating' as const, title: 'Consolidating', desc: 'For on-level learners', icon: Target, color: 'blue' },
    { key: 'beginning' as const, title: 'Beginning', desc: 'For learners needing support', icon: HelpCircle, color: 'orange' }
  ];

  const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-600' }
  };

  const addItem = (key: 'extending' | 'consolidating' | 'beginning') => {
    onChange({ ...differentiationData, [key]: [...differentiationData[key], ''] });
  };

  const updateItem = (key: 'extending' | 'consolidating' | 'beginning', index: number, value: string) => {
    const newItems = [...differentiationData[key]];
    newItems[index] = value;
    onChange({ ...differentiationData, [key]: newItems });
  };

  const removeItem = (key: 'extending' | 'consolidating' | 'beginning', index: number) => {
    onChange({ ...differentiationData, [key]: differentiationData[key].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {sections.map(section => {
        const c = colors[section.color];
        const Icon = section.icon;
        return (
          <div key={section.key} className={`${c.bg} rounded-xl p-4 border ${c.border}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-5 h-5 ${c.text}`} />
              <div>
                <span className={`font-semibold ${c.text}`}>{section.title}</span>
                <p className="text-xs text-gray-500">{section.desc}</p>
              </div>
            </div>
            {differentiationData[section.key].length === 0 && (
              <p className="text-gray-500 text-sm italic mb-2">No strategies added yet.</p>
            )}
            {differentiationData[section.key].map((item, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className={`w-6 h-6 flex items-center justify-center ${c.badge} text-white rounded-full text-xs font-bold mt-1`}>{i + 1}</span>
                <Textarea value={item} onChange={(e) => updateItem(section.key, i, e.target.value)} placeholder={`${section.title} strategy...`} className="flex-1 min-h-[50px]" rows={2} />
                <Button size="sm" variant="ghost" onClick={() => removeItem(section.key, i)} className="text-red-500 mt-1"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button onClick={() => addItem(section.key)} variant="outline" size="sm" className={`w-full border-dashed ${c.border} ${c.text}`}>
              <Plus className="w-4 h-4 mr-1" /> Add {section.title} Strategy
            </Button>
          </div>
        );
      })}
    </div>
  );
};
