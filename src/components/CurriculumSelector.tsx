import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { CORE_COMPETENCES } from '@/data/nacca-curriculum-types';

interface CurriculumValues {
  strand?: string;
  subStrand?: string;
  contentStandard?: string;
  indicators?: string[];
  coreCompetences?: string[];
}

interface Props {
  subject: string;
  values: CurriculumValues;
  onChange: (values: CurriculumValues) => void;
}

export const CurriculumSelector: React.FC<Props> = ({ subject, values, onChange }) => {
  const curriculum = allCurriculums[subject];
  
  const strands = useMemo(() => curriculum?.strands || [], [curriculum]);
  const selectedStrand = useMemo(() => strands.find(s => s.id === values.strand), [strands, values.strand]);
  const subStrands = useMemo(() => selectedStrand?.subStrands || [], [selectedStrand]);
  const selectedSubStrand = useMemo(() => subStrands.find(s => s.id === values.subStrand), [subStrands, values.subStrand]);
  const contentStandards = useMemo(() => selectedSubStrand?.contentStandards || [], [selectedSubStrand]);
  const selectedCS = useMemo(() => contentStandards.find(c => c.id === values.contentStandard), [contentStandards, values.contentStandard]);
  const indicators = useMemo(() => selectedCS?.indicators || [], [selectedCS]);

  const handleChange = (field: keyof CurriculumValues, value: any) => {
    const updates: CurriculumValues = { ...values, [field]: value };
    if (field === 'strand') { updates.subStrand = undefined; updates.contentStandard = undefined; updates.indicators = []; }
    if (field === 'subStrand') { updates.contentStandard = undefined; updates.indicators = []; }
    if (field === 'contentStandard') { updates.indicators = []; }
    onChange(updates);
  };

  const toggleIndicator = (id: string) => {
    const current = values.indicators || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    handleChange('indicators', updated);
  };

  const toggleCompetence = (comp: string) => {
    const current = values.coreCompetences || [];
    const updated = current.includes(comp) ? current.filter(c => c !== comp) : [...current, comp];
    handleChange('coreCompetences', updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-purple-700 mb-1 block">Strand</label>
        <Select value={values.strand || ''} onValueChange={(v) => handleChange('strand', v)}>
          <SelectTrigger className="border-purple-200"><SelectValue placeholder="Select strand..." /></SelectTrigger>
          <SelectContent>{strands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {values.strand && (
        <div>
          <label className="text-sm font-bold text-purple-700 mb-1 block">Sub-Strand</label>
          <Select value={values.subStrand || ''} onValueChange={(v) => handleChange('subStrand', v)}>
            <SelectTrigger className="border-purple-200"><SelectValue placeholder="Select sub-strand..." /></SelectTrigger>
            <SelectContent>{subStrands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {values.subStrand && (
        <div>
          <label className="text-sm font-bold text-purple-700 mb-1 block">Content Standard</label>
          <Select value={values.contentStandard || ''} onValueChange={(v) => handleChange('contentStandard', v)}>
            <SelectTrigger className="border-purple-200"><SelectValue placeholder="Select content standard..." /></SelectTrigger>
            <SelectContent>{contentStandards.map(c => <SelectItem key={c.id} value={c.id}>{c.code}: {c.description}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {values.contentStandard && indicators.length > 0 && (
        <div>
          <label className="text-sm font-bold text-purple-700 mb-2 block">Indicators</label>
          <div className="space-y-2 bg-purple-50 p-3 rounded-lg max-h-32 overflow-y-auto">
            {indicators.map(ind => (
              <label key={ind.id} className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={(values.indicators || []).includes(ind.id)} onCheckedChange={() => toggleIndicator(ind.id)} />
                <span className="text-sm">{ind.code}: {ind.description}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-purple-700 mb-2 block">Core Competences</label>
        <div className="space-y-2 bg-green-50 p-3 rounded-lg max-h-40 overflow-y-auto">
          {CORE_COMPETENCES.map(comp => (
            <label key={comp} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={(values.coreCompetences || []).includes(comp)} onCheckedChange={() => toggleCompetence(comp)} />
              <span className="text-sm">{comp}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
