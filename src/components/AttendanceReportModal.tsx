import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeacherMonthlyAttendance, DailyAttendanceRecord } from '@/types/punch-clock';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  TrendingUp,
  Award,
} from 'lucide-react';

interface AttendanceReportModalProps {
  teacher: TeacherMonthlyAttendance;
  month: number;
  year: number;
  onClose: () => void;
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({
  teacher,
  month,
  year,
  onClose,
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: DailyAttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500/30 text-green-300">Present</Badge>;
      case 'late':
        return <Badge className="bg-amber-500/30 text-amber-300">Late</Badge>;
      case 'early_departure':
        return <Badge className="bg-orange-500/30 text-orange-300">Early Out</Badge>;
      case 'incomplete':
        return <Badge className="bg-blue-500/30 text-blue-300">Incomplete</Badge>;
      case 'absent':
        return <Badge className="bg-red-500/30 text-red-300">Absent</Badge>;
      default:
        return null;
    }
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-white">{teacher.teacherName}</h2>
            <p className="text-sm text-white/60">
              Attendance Report - {monthName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="p-4 bg-slate-900/50 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{teacher.daysPresent}/{teacher.totalWorkingDays}</div>
            <div className="text-xs text-white/60">Days Present</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{teacher.attendancePercentage}%</div>
            <div className="text-xs text-white/60">Attendance Rate</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{teacher.punctualityPercentage}%</div>
            <div className="text-xs text-white/60">Punctuality</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{teacher.totalWorkHours}h</div>
            <div className="text-xs text-white/60">Total Hours</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3 border-b border-white/10">
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{teacher.lateArrivals}</div>
            <div className="text-xs text-white/60">Late Arrivals</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">{teacher.earlyDepartures}</div>
            <div className="text-xs text-white/60">Early Departures</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{teacher.averageArrivalTime}</div>
            <div className="text-xs text-white/60">Avg Arrival</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{teacher.averageDepartureTime}</div>
            <div className="text-xs text-white/60">Avg Departure</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{teacher.averageWorkHours}</div>
            <div className="text-xs text-white/60">Avg Work Hours</div>
          </div>
        </div>

        {/* Daily Records Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Attendance Records
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Day</th>
                  <th className="text-center py-2 px-2">Punch In</th>
                  <th className="text-center py-2 px-2">Punch Out</th>
                  <th className="text-center py-2 px-2">Hours</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-center py-2 px-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {teacher.dailyRecords.map((record) => (
                  <tr
                    key={record.date}
                    className={`border-b border-white/5 ${
                      record.status === 'absent' ? 'bg-red-500/5' :
                      record.status === 'late' ? 'bg-amber-500/5' :
                      record.status === 'early_departure' ? 'bg-orange-500/5' :
                      ''
                    }`}
                  >
                    <td className="py-2 px-2 text-white">{formatDate(record.date)}</td>
                    <td className="py-2 px-2 text-white/70">{record.dayOfWeek}</td>
                    <td className="py-2 px-2 text-center">
                      {record.punchInTime ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className={record.isLate ? 'text-amber-400' : 'text-green-400'}>
                            {formatTime(record.punchInTime)}
                          </span>
                          {record.punchInVerified && (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-white/30">--:--</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {record.punchOutTime ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className={record.isEarlyDeparture ? 'text-orange-400' : 'text-green-400'}>
                            {formatTime(record.punchOutTime)}
                          </span>
                          {record.punchOutVerified && (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-white/30">--:--</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center text-white/70">
                      {record.workHours > 0 ? `${record.workHours.toFixed(1)}h` : '--'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {record.isLate && (
                        <span className="text-xs text-amber-400">
                          +{record.minutesLate}min
                        </span>
                      )}
                      {record.isEarlyDeparture && (
                        <span className="text-xs text-orange-400">
                          -{record.minutesEarly}min
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-end">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportModal;
