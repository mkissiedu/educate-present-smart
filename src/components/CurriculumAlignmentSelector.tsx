import React, { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { BookOpen, Target, CheckCircle2, ChevronRight, Search, Wand2, Loader2 } from 'lucide-react';
import { GradeLevel, GRADE_LEVELS, getCurriculum, getSubjectsForLevel, getGradeCategory } from '@/lib/curriculum-data';

interface Indicator { id: string; code: string; description: string; }

interface Props {
  level: GradeLevel;
  subject: string;
  selectedIndicators: string[];
  onSelectIndicators: (indicators: string[]) => void;
  onLevelChange?: (level: GradeLevel) => void;
  onSubjectChange?: (subject: string) => void;
  lessonTitle?: string;
}

export const CurriculumAlignmentSelector: React.FC<Props> = ({
  level, subject, selectedIndicators, onSelectIndicators, onLevelChange, onSubjectChange, lessonTitle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIndicators);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoLinking, setAutoLinking] = useState(false);

  useEffect(() => { setTempSelected(selectedIndicators); }, [selectedIndicators, isOpen]);

  const subjects = getSubjectsForLevel(level);
  const curriculum = useMemo(() => getCurriculum(level, subject), [level, subject]);
  const category = getGradeCategory(level);

  const allIndicators = useMemo(() => {
    if (!curriculum) return [];
    const indicators: { indicator: Indicator; strandName: string; subStrandName: string; csDesc: string }[] = [];
    curriculum.strands.forEach(strand => {
      strand.subStrands.forEach(ss => {
        ss.contentStandards.forEach(cs => {
          cs.indicators.forEach(ind => {
            indicators.push({ indicator: ind, strandName: strand.name, subStrandName: ss.name, csDesc: cs.description });
          });
        });
      });
    });
    return indicators;
  }, [curriculum]);

  const filteredIndicators = useMemo(() => {
    if (!searchTerm) return allIndicators;
    const term = searchTerm.toLowerCase();
    return allIndicators.filter(({ indicator, strandName, subStrandName, csDesc }) =>
      indicator.description.toLowerCase().includes(term) || indicator.code.toLowerCase().includes(term) ||
      strandName.toLowerCase().includes(term) || subStrandName.toLowerCase().includes(term) || csDesc.toLowerCase().includes(term)
    );
  }, [allIndicators, searchTerm]);

  const toggleIndicator = (id: string) => setTempSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSave = () => { onSelectIndicators(tempSelected); setIsOpen(false); };

  const handleAutoLink = () => {
    if (!lessonTitle) return;
    setAutoLinking(true);
    const titleWords = lessonTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matches: string[] = [];
    allIndicators.forEach(({ indicator, strandName, subStrandName }) => {
      const text = `${indicator.description} ${strandName} ${subStrandName}`.toLowerCase();
      if (titleWords.some(word => text.includes(word))) matches.push(indicator.id);
    });
    setTimeout(() => { setTempSelected(prev => [...new Set([...prev, ...matches.slice(0, 5)])]); setAutoLinking(false); }, 500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h4 className="font-semibold text-gray-800">NaCCA {category} Curriculum Alignment</h4>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700">
              <BookOpen className="w-4 h-4 mr-1" />Select Standards
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader><DialogTitle>Select Learning Indicators - {category}</DialogTitle></DialogHeader>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Select value={level} onValueChange={(v) => onLevelChange?.(v as GradeLevel)}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={(v) => onSubjectChange?.(v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              {lessonTitle && (
                <Button variant="outline" size="sm" onClick={handleAutoLink} disabled={autoLinking} className="border-purple-300 text-purple-700">
                  {autoLinking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />}Auto-Link
                </Button>
              )}
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search indicators..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {filteredIndicators.map(({ indicator, strandName, subStrandName, csDesc }) => (
                <div key={indicator.id} onClick={() => toggleIndicator(indicator.id)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${tempSelected.includes(indicator.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tempSelected.includes(indicator.id) ? 'text-emerald-600' : 'text-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{indicator.code}</Badge>
                        <span className="text-xs text-gray-500 truncate">{strandName} <ChevronRight className="w-3 h-3 inline" /> {subStrandName}</span>
                      </div>
                      <p className="text-sm text-gray-700">{indicator.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredIndicators.length === 0 && <p className="text-center text-gray-500 py-4">No indicators found</p>}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <span className="text-sm text-gray-500">{tempSelected.length} selected</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
