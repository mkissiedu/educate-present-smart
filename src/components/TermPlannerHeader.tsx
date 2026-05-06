import React, { useState } from 'react';
import { useTermContext } from '@/contexts/TermContext';
import { Term, TermNumber } from '@/types/term';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Settings, ChevronLeft, ChevronRight, Cloud, Loader2, GraduationCap } from 'lucide-react';
import { CLASS_LEVELS, ClassLevel } from '@/types/user';

interface Props {
  classLevel: string;
  onClassChange: (level: string) => void;
}

export const TermPlannerHeader: React.FC<Props> = ({ classLevel, onClassChange }) => {
  const { termSettings, selectedTerm, setSelectedTerm, updateTermDates, isSyncing, isLoading } = useTermContext();
  const [showSettings, setShowSettings] = useState(false);
  const [editDates, setEditDates] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [editingTerm, setEditingTerm] = useState<TermNumber | null>(null);

  const handleTermChange = (direction: 'prev' | 'next') => {
    if (!selectedTerm) return;
    const idx = termSettings.terms.findIndex(t => t.id === selectedTerm.id);
    const newIdx = direction === 'prev' ? Math.max(0, idx - 1) : Math.min(termSettings.terms.length - 1, idx + 1);
    setSelectedTerm(termSettings.terms[newIdx]);
  };

  const openEditDates = (term: Term) => {
    setEditingTerm(term.termNumber);
    setEditDates({ start: term.startDate, end: term.endDate });
  };

  const saveDates = async () => {
    if (editingTerm) {
      await updateTermDates(editingTerm, editDates.start, editDates.end);
      setEditingTerm(null);
    }
  };

  // Group classes by category for better UX
  const classGroups = {
    'Pre-K': CLASS_LEVELS.filter(c => c.includes('PreK') || c.includes('Nursery')),
    'Kindergarten': CLASS_LEVELS.filter(c => c.includes('KG')),
    'Lower Primary': CLASS_LEVELS.filter(c => ['Class 1', 'Class 2', 'Class 3'].includes(c)),
    'Upper Primary': CLASS_LEVELS.filter(c => ['Class 4', 'Class 5', 'Class 6'].includes(c)),
    'JHS': CLASS_LEVELS.filter(c => c.includes('JHS'))
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl md:text-2xl font-black text-white">Term Planner</h1>
          {isLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleTermChange('prev')} disabled={!selectedTerm || selectedTerm.termNumber === 1} className="text-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-lg">
            <span className="text-white font-bold">{selectedTerm?.name || 'Select Term'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleTermChange('next')} disabled={!selectedTerm || selectedTerm.termNumber === 3} className="text-white">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
            <GraduationCap className="w-4 h-4 text-yellow-400" />
            <select value={classLevel} onChange={(e) => onClassChange(e.target.value)} className="px-2 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium border-0 focus:ring-2 focus:ring-blue-400">
              {Object.entries(classGroups).map(([group, classes]) => (
                <optgroup key={group} label={group} className="text-gray-900 bg-white">
                  {classes.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Settings className="w-4 h-4 mr-1" /> Dates
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">Term Date Settings {isSyncing && <Cloud className="w-4 h-4 text-blue-400 animate-pulse" />}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-xs text-slate-400">Changes sync automatically to the cloud</p>
                {termSettings.terms.map(term => (
                  <div key={term.id} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{term.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => openEditDates(term)} className="text-blue-400 hover:text-blue-300">Edit</Button>
                    </div>
                    {editingTerm === term.termNumber ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input type="date" value={editDates.start} onChange={(e) => setEditDates(p => ({ ...p, start: e.target.value }))} className="flex-1 px-2 py-1 bg-slate-600 rounded text-sm" />
                          <input type="date" value={editDates.end} onChange={(e) => setEditDates(p => ({ ...p, end: e.target.value }))} className="flex-1 px-2 py-1 bg-slate-600 rounded text-sm" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveDates} className="bg-green-600 hover:bg-green-700" disabled={isSyncing}>{isSyncing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTerm(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">{new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedTerm && (
        <div className="mt-3 text-sm text-slate-300">
          <span className="font-medium">{termSettings.academicYear} Academic Year</span>
          <span className="mx-2">•</span>
          <span>{new Date(selectedTerm.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedTerm.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="mx-2">•</span>
          <span className="text-yellow-400 font-medium">{classLevel}</span>
        </div>
      )}
    </div>
  );
};
