import React from 'react';
import { ClassPeriod, ScheduleEntry, SchoolClass, DAYS_OF_WEEK } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  viewType: 'class' | 'teacher';
  title: string;
  schoolName: string;
  periods: ClassPeriod[];
  entries: ScheduleEntry[];
  teachers: { id: string; name: string }[];
  classes: SchoolClass[];
}

export const PrintableSchedule: React.FC<Props> = ({ isOpen, onClose, viewType, title, schoolName, periods, entries, teachers, classes }) => {
  if (!isOpen) return null;

  const handlePrint = () => window.print();
  const getEntry = (day: number, periodId: string) => entries.find(e => e.day_of_week === day && e.period_id === periodId);
  const getTeacherName = (id?: string) => teachers.find(t => t.id === id)?.name || '';
  const getClassName = (id?: string) => classes.find(c => c.id === id)?.name || '';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-xl font-bold text-white">Print Preview</h2>
            <div className="flex gap-2">
              <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
              <Button variant="outline" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 print:p-4 print:shadow-none">
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">{schoolName}</h1>
              <h2 className="text-xl text-gray-700 mt-1">{viewType === 'class' ? 'Class' : 'Teacher'} Timetable</h2>
              <p className="text-lg text-emerald-600 font-medium mt-1">{title}</p>
              <p className="text-sm text-gray-500 mt-1">Academic Year 2024/2025</p>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-left">Time</th>
                  {DAYS_OF_WEEK.map(d => (
                    <th key={d.value} className="border border-gray-300 p-2 bg-gray-100 text-center">{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map(period => (
                  <tr key={period.id} className={period.is_break ? 'bg-amber-50' : ''}>
                    <td className="border border-gray-300 p-2">
                      <div className="font-medium">{period.name}</div>
                      <div className="text-xs text-gray-500">{period.start_time} - {period.end_time}</div>
                    </td>
                    {DAYS_OF_WEEK.map(day => {
                      const entry = getEntry(day.value, period.id);
                      if (period.is_break) {
                        return <td key={day.value} className="border border-gray-300 p-2 text-center text-amber-600">Break</td>;
                      }
                      return (
                        <td key={day.value} className="border border-gray-300 p-2">
                          {entry ? (
                            <div>
                              <div className="font-medium text-gray-900">{entry.subject}</div>
                              {viewType === 'class' && entry.teacher_id && <div className="text-xs text-gray-600">{getTeacherName(entry.teacher_id)}</div>}
                              {viewType === 'teacher' && entry.class_id && <div className="text-xs text-gray-600">{getClassName(entry.class_id)}</div>}
                              {entry.room_number && <div className="text-xs text-gray-400">Room {entry.room_number}</div>}
                            </div>
                          ) : <span className="text-gray-300">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 pt-4 border-t text-xs text-gray-500 flex justify-between">
              <span>Generated on {new Date().toLocaleDateString()}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
