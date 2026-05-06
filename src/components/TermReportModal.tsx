import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TermProgress, TermReport, CurriculumCoverage } from '@/types/term';
import { kgCurriculums } from '@/data/nacca-kg-all-subjects';
import { allCurriculums } from '@/data/nacca-all-subjects';
import { CLASS_SUBJECTS_MAP, ClassLevel } from '@/types/user';
import { FileText, Download, CheckCircle, AlertTriangle, BookOpen, Target, GraduationCap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: TermProgress;
  classLevel: string;
}

export const TermReportModal: React.FC<Props> = ({ isOpen, onClose, progress, classLevel }) => {
  const report = useMemo((): TermReport => {
    const curriculumCoverage: CurriculumCoverage[] = [];
    const subjects = CLASS_SUBJECTS_MAP[classLevel as ClassLevel] || [];
    
    subjects.forEach(subject => {
      const curriculum = allCurriculums[subject];
      if (!curriculum) {
        curriculumCoverage.push({ subject, totalIndicators: 0, coveredIndicators: 0, percentCovered: 0, strandsCovered: [] });
        return;
      }
      
      let totalIndicators = 0;
      const strandsCovered: { name: string; covered: number; total: number }[] = [];
      
      curriculum.strands.forEach(strand => {
        let strandTotal = 0;
        strand.subStrands.forEach(ss => ss.contentStandards.forEach(cs => { strandTotal += cs.indicators.length; }));
        totalIndicators += strandTotal;
        
        const subjectProgress = progress.subjectProgress.find(sp => sp.subject === subject);
        const coveredInStrand = subjectProgress?.indicatorsCovered.filter(id => 
          strand.subStrands.some(ss => ss.contentStandards.some(cs => cs.indicators.some(ind => ind.id === id)))
        ).length || 0;
        
        strandsCovered.push({ name: strand.name, covered: coveredInStrand, total: strandTotal });
      });

      const subjectProgress = progress.subjectProgress.find(sp => sp.subject === subject);
      curriculumCoverage.push({
        subject, totalIndicators, coveredIndicators: subjectProgress?.indicatorsCovered.length || 0,
        percentCovered: Math.round(((subjectProgress?.indicatorsCovered.length || 0) / Math.max(totalIndicators, 1)) * 100),
        strandsCovered
      });
    });

    const recommendations: string[] = [];
    if (progress.percentComplete < 50 && progress.currentWeek > 6) recommendations.push('Lesson completion is behind schedule. Consider reviewing planning.');
    progress.subjectProgress.forEach(sp => {
      if (sp.percentComplete < 30) recommendations.push(`${sp.subject} needs more lessons planned.`);
    });
    curriculumCoverage.forEach(cc => {
      if (cc.percentCovered < 20 && cc.totalIndicators > 0) recommendations.push(`${cc.subject} curriculum coverage is low. Review indicator alignment.`);
    });
    if (recommendations.length === 0) recommendations.push('Great progress! Keep up the excellent work.');

    return {
      term: progress.term, generatedAt: new Date().toISOString(), progress, curriculumCoverage,
      lessonsPerWeek: progress.weekStatuses.map(ws => ({ week: ws.week, count: ws.lessonsPlanned })),
      recommendations
    };
  }, [progress, classLevel]);

  const handleExport = () => {
    const content = `TERM REPORT - ${report.term.name}\n${'='.repeat(40)}\nGenerated: ${new Date(report.generatedAt).toLocaleString()}\nClass: ${classLevel}\n\nPROGRESS SUMMARY\n${'-'.repeat(20)}\nCurrent Week: ${report.progress.currentWeek}/12\nTotal Lessons: ${report.progress.totalLessons}\nCompleted: ${report.progress.completedLessons}\nProgress: ${report.progress.percentComplete}%\n\nSUBJECT BREAKDOWN\n${'-'.repeat(20)}\n${report.progress.subjectProgress.map(sp => `${sp.subject}: ${sp.lessonsPlanned}/${sp.totalExpected} (${sp.percentComplete}%)`).join('\n')}\n\nCURRICULUM COVERAGE\n${'-'.repeat(20)}\n${report.curriculumCoverage.map(cc => `${cc.subject}: ${cc.coveredIndicators}/${cc.totalIndicators} indicators (${cc.percentCovered}%)`).join('\n')}\n\nRECOMMENDATIONS\n${'-'.repeat(20)}\n${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `term-report-${classLevel.replace(/\s+/g, '-')}-${report.term.name.toLowerCase().replace(' ', '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Term Report - {report.term.name}
            <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />{classLevel}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-green-400" />Progress Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-xs text-slate-400">Week</span><p className="font-bold">{report.progress.currentWeek}/12</p></div>
              <div><span className="text-xs text-slate-400">Lessons</span><p className="font-bold">{report.progress.totalLessons}</p></div>
              <div><span className="text-xs text-slate-400">Completed</span><p className="font-bold">{report.progress.completedLessons}</p></div>
              <div><span className="text-xs text-slate-400">Progress</span><p className="font-bold">{report.progress.percentComplete}%</p></div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-400" />Curriculum Coverage ({report.curriculumCoverage.length} subjects)</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {report.curriculumCoverage.map(cc => (
                <div key={cc.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{cc.subject}</span>
                    <span className="text-slate-400 ml-2">{cc.coveredIndicators}/{cc.totalIndicators}</span>
                  </div>
                  <Progress value={cc.percentCovered} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">{report.recommendations[0]?.includes('Great') ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}Recommendations</h4>
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400">•</span>{rec}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
