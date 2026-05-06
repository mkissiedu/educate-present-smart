import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight, Target, BookOpen, FileText, Lightbulb, CheckCircle2, Link2, Plus, Trash2, Edit2 } from 'lucide-react';
import { useLessonContext } from '@/contexts/LessonContext';

interface Indicator { id: string; code: string; description: string; }
interface ContentStandard { id: string; code: string; description: string; indicators: Indicator[]; }
interface SubStrand { id: string; name: string; contentStandards: ContentStandard[]; }
interface Strand { id: string; name: string; color?: string; subStrands: SubStrand[]; }

interface Props {
  strand: Strand;
  onSelectIndicator?: (indicator: Indicator) => void;
  selectedIndicators?: string[];
  isEditable?: boolean;
  onAddSubStrand?: (strandId: string) => void;
  onAddStandard?: (subStrandId: string) => void;
  onAddIndicator?: (standardId: string) => void;
  onDeleteStrand?: (strandId: string) => void;
  onDeleteSubStrand?: (subStrandId: string) => void;
  onDeleteStandard?: (standardId: string) => void;
  onDeleteIndicator?: (indicatorId: string) => void;
}

export const CurriculumStrandCard: React.FC<Props> = ({ 
  strand, onSelectIndicator, selectedIndicators = [], isEditable = false,
  onAddSubStrand, onAddStandard, onAddIndicator, onDeleteStrand, onDeleteSubStrand, onDeleteStandard, onDeleteIndicator
}) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedSS, setExpandedSS] = useState<string[]>([]);
  const { getLessonsByIndicator } = useLessonContext();

  const toggleSS = (id: string) => setExpandedSS(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <Card className="overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-white" />
            <h3 className="text-lg font-bold text-white">{strand.name}</h3>
            <Badge className="bg-white/20 text-white">{strand.subStrands.length} sub-strands</Badge>
          </div>
          <div className="flex items-center gap-2">
            {isEditable && (
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onDeleteStrand?.(strand.id); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {expanded ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {isEditable && (
            <Button size="sm" variant="outline" className="mb-2" onClick={() => onAddSubStrand?.(strand.id)}>
              <Plus className="w-4 h-4 mr-1" /> Add Sub-Strand
            </Button>
          )}
          {strand.subStrands.map(ss => (
            <div key={ss.id} className="border rounded-lg overflow-hidden">
              <div className="bg-teal-50 p-3 cursor-pointer flex items-center justify-between" onClick={() => toggleSS(ss.id)}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-teal-800">{ss.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isEditable && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDeleteSubStrand?.(ss.id); }}><Trash2 className="w-3 h-3" /></Button>}
                  {expandedSS.includes(ss.id) ? <ChevronDown className="w-4 h-4 text-teal-600" /> : <ChevronRight className="w-4 h-4 text-teal-600" />}
                </div>
              </div>
              {expandedSS.includes(ss.id) && (
                <div className="p-3 space-y-3 bg-white">
                  {isEditable && <Button size="sm" variant="outline" onClick={() => onAddStandard?.(ss.id)}><Plus className="w-3 h-3 mr-1" /> Add Standard</Button>}
                  {ss.contentStandards.map(cs => (
                    <div key={cs.id} className="border-l-4 border-cyan-400 pl-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-cyan-600 mt-0.5" />
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">{cs.code}</Badge>
                            <p className="text-sm text-gray-700">{cs.description}</p>
                          </div>
                        </div>
                        {isEditable && <Button size="sm" variant="ghost" onClick={() => onDeleteStandard?.(cs.id)}><Trash2 className="w-3 h-3" /></Button>}
                      </div>
                      <div className="ml-6 space-y-2">
                        {isEditable && <Button size="sm" variant="ghost" className="text-xs" onClick={() => onAddIndicator?.(cs.id)}><Plus className="w-3 h-3 mr-1" /> Add Indicator</Button>}
                        {cs.indicators.map(ind => {
                          const linkedLessons = getLessonsByIndicator(ind.id);
                          const isSelected = selectedIndicators.includes(ind.id);
                          return (
                            <div key={ind.id} onClick={() => onSelectIndicator?.(ind)}
                              className={`p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-gray-50 hover:bg-blue-50 border border-gray-200'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  {isSelected ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> : <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />}
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge className="bg-blue-500 text-xs">{ind.code}</Badge>
                                      {linkedLessons.length > 0 && <Badge className="bg-purple-500 text-xs flex items-center gap-1"><Link2 className="w-3 h-3" />{linkedLessons.length}</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{ind.description}</p>
                                  </div>
                                </div>
                                {isEditable && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDeleteIndicator?.(ind.id); }}><Trash2 className="w-3 h-3" /></Button>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
