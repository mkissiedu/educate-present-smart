import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { fetchAllUsers } from '@/lib/supabase-admin';
import { generateMonthlyAttendanceReport } from '@/lib/supabase-punch-clock';
import { MonthlyAttendanceReport as ReportType, TeacherMonthlyAttendance } from '@/types/punch-clock';
import { User } from '@/types/user';
import { AttendanceReportModal } from '@/components/AttendanceReportModal';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Eye,
  Printer,
  Filter,
  Search,
} from 'lucide-react';

export const MonthlyAttendanceReport: React.FC = () => {
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [report, setReport] = useState<ReportType | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMonthlyAttendance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'punctuality' | 'late'>('name');

  useEffect(() => {
    if (currentSchool?.id) loadReport();
  }, [currentSchool?.id, selectedMonth, selectedYear, includeWeekends]);

  const loadReport = async () => {
    if (!currentSchool?.id) return;
    setLoading(true);

    try {
      const users = await fetchAllUsers(currentSchool.id);
      const teacherList = users.filter(u => u.role === 'teacher' || u.role === 'super_teacher');
      setTeachers(teacherList);

      const reportData = await generateMonthlyAttendanceReport(
        currentSchool.id,
        currentSchool.name,
        selectedMonth,
        selectedYear,
        teacherList.map(t => ({
          id: t.id,
          name: t.name,
          email: t.email,
          assignedClasses: t.assignedClasses,
        })),
        { includeWeekends }
      );

      setReport(reportData);
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const exportToPDF = async () => {
    if (!report) return;
    setExporting(true);

    try {
      // Create PDF content
      const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      // Build HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Monthly Attendance Report - ${monthName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .school-name { font-size: 24px; font-weight: bold; color: #1e40af; }
            .report-date { color: #6b7280; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
            .summary-value { font-size: 28px; font-weight: bold; color: #1e40af; }
            .summary-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #f9fafb; }
            .status-present { color: #059669; }
            .status-late { color: #d97706; }
            .status-absent { color: #dc2626; }
            .percentage { font-weight: bold; }
            .good { color: #059669; }
            .warning { color: #d97706; }
            .poor { color: #dc2626; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
            .settings-info { background: #f3f4f6; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="school-name">${report.schoolName}</div>
              <div class="report-date">Monthly Attendance Report - ${monthName}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #6b7280;">Generated: ${new Date(report.reportGeneratedAt).toLocaleString()}</div>
            </div>
          </div>

          <div class="settings-info">
            <strong>Report Settings:</strong> Late Threshold: ${report.lateThresholdTime} | 
            Early Departure: ${report.earlyDepartureTime} | 
            Working Days: ${report.totalWorkingDays} | 
            Weekends: ${includeWeekends ? 'Included' : 'Excluded'}
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-value">${report.totalTeachers}</div>
              <div class="summary-label">Total Teachers</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${report.averageAttendanceRate}%</div>
              <div class="summary-label">Avg Attendance Rate</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${report.averagePunctualityRate}%</div>
              <div class="summary-label">Avg Punctuality Rate</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${report.totalLateArrivals}</div>
              <div class="summary-label">Total Late Arrivals</div>
            </div>
          </div>

          <h2>Teacher Attendance Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Classes</th>
                <th>Days Present</th>
                <th>Days Absent</th>
                <th>Late Arrivals</th>
                <th>Early Departures</th>
                <th>Avg Arrival</th>
                <th>Avg Departure</th>
                <th>Total Hours</th>
                <th>Attendance %</th>
                <th>Punctuality %</th>
              </tr>
            </thead>
            <tbody>
              ${report.teacherReports.map(t => `
                <tr>
                  <td><strong>${t.teacherName}</strong></td>
                  <td>${t.assignedClasses?.join(', ') || '-'}</td>
                  <td class="status-present">${t.daysPresent}</td>
                  <td class="status-absent">${t.daysAbsent}</td>
                  <td class="status-late">${t.lateArrivals}</td>
                  <td>${t.earlyDepartures}</td>
                  <td>${t.averageArrivalTime}</td>
                  <td>${t.averageDepartureTime}</td>
                  <td>${t.totalWorkHours}h</td>
                  <td class="percentage ${t.attendancePercentage >= 90 ? 'good' : t.attendancePercentage >= 75 ? 'warning' : 'poor'}">${t.attendancePercentage}%</td>
                  <td class="percentage ${t.punctualityPercentage >= 90 ? 'good' : t.punctualityPercentage >= 75 ? 'warning' : 'poor'}">${t.punctualityPercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report is generated for payroll and administrative purposes. 
            Attendance data is based on punch clock records with geolocation verification.</p>
            <p><strong>Report ID:</strong> ${report.schoolId}-${selectedYear}${String(selectedMonth).padStart(2, '0')}</p>
          </div>
        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast({
        title: 'PDF Export Ready',
        description: 'Print dialog opened. Save as PDF to export.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const csvRows = [
      ['Monthly Attendance Report', report.schoolName, monthName],
      ['Generated', new Date(report.reportGeneratedAt).toLocaleString()],
      [''],
      ['Teacher Name', 'Email', 'Classes', 'Working Days', 'Days Present', 'Days Absent', 
       'Late Arrivals', 'Early Departures', 'Avg Arrival', 'Avg Departure', 
       'Total Hours', 'Attendance %', 'Punctuality %'],
      ...report.teacherReports.map(t => [
        t.teacherName,
        t.teacherEmail || '',
        t.assignedClasses?.join('; ') || '',
        t.totalWorkingDays,
        t.daysPresent,
        t.daysAbsent,
        t.lateArrivals,
        t.earlyDepartures,
        t.averageArrivalTime,
        t.averageDepartureTime,
        t.totalWorkHours,
        t.attendancePercentage,
        t.punctualityPercentage,
      ]),
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV Exported',
      description: 'Attendance report downloaded as CSV file.',
    });
  };

  // Filter and sort teachers
  const filteredTeachers = report?.teacherReports.filter(t =>
    t.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch (sortBy) {
      case 'attendance':
        return b.attendancePercentage - a.attendancePercentage;
      case 'punctuality':
        return b.punctualityPercentage - a.punctualityPercentage;
      case 'late':
        return b.lateArrivals - a.lateArrivals;
      default:
        return a.teacherName.localeCompare(b.teacherName);
    }
  });

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Monthly Attendance Report
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => changeMonth(-1)}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white font-semibold text-lg min-w-[180px] text-center">
            {monthName}
          </span>
          <Button
            variant="ghost"
            onClick={() => changeMonth(1)}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={loadReport}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={includeWeekends}
              onCheckedChange={setIncludeWeekends}
            />
            <span className="text-white/70 text-sm">Include Weekends</span>
          </div>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-blue-500/30 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.totalTeachers}</div>
              <div className="text-xs text-blue-300">Teachers</div>
            </div>
            <div className="bg-purple-500/30 rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.totalWorkingDays}</div>
              <div className="text-xs text-purple-300">Working Days</div>
            </div>
            <div className="bg-green-500/30 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.averageAttendanceRate}%</div>
              <div className="text-xs text-green-300">Avg Attendance</div>
            </div>
            <div className="bg-cyan-500/30 rounded-lg p-3 text-center">
              <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.averagePunctualityRate}%</div>
              <div className="text-xs text-cyan-300">Avg Punctuality</div>
            </div>
            <div className="bg-amber-500/30 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.totalLateArrivals}</div>
              <div className="text-xs text-amber-300">Late Arrivals</div>
            </div>
            <div className="bg-orange-500/30 rounded-lg p-3 text-center">
              <LogOut className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.totalEarlyDepartures}</div>
              <div className="text-xs text-orange-300">Early Departures</div>
            </div>
            <div className="bg-red-500/30 rounded-lg p-3 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{report.totalAbsences}</div>
              <div className="text-xs text-red-300">Total Absences</div>
            </div>
            <div className="bg-slate-500/30 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{report.lateThresholdTime}</div>
              <div className="text-xs text-slate-300">Late Threshold</div>
            </div>
          </div>

          {/* Top Performers & Needs Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Attendance */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-400" />
                  Top Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.topAttendance.slice(0, 3).map((t, i) => (
                  <div key={t.teacherId} className="flex items-center justify-between bg-white/5 rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                      } text-white`}>
                        {i + 1}
                      </span>
                      <span className="text-white text-sm">{t.teacherName}</span>
                    </div>
                    <Badge className="bg-green-500/30 text-green-300">{t.percentage}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Frequent Late Arrivals */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Frequent Late Arrivals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.frequentLateArrivals.length === 0 ? (
                  <div className="text-center py-4 text-white/50 text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    No frequent late arrivals!
                  </div>
                ) : (
                  report.frequentLateArrivals.slice(0, 3).map((t, i) => (
                    <div key={t.teacherId} className="flex items-center justify-between bg-white/5 rounded p-2">
                      <span className="text-white text-sm">{t.teacherName}</span>
                      <Badge className="bg-amber-500/30 text-amber-300">{t.count} times</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="attendance">Sort by Attendance</option>
                <option value="punctuality">Sort by Punctuality</option>
                <option value="late">Sort by Late Arrivals</option>
              </select>
            </div>
          </div>

          {/* Teacher List */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teacher Attendance Details ({sortedTeachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/60 border-b border-white/10">
                      <th className="text-left py-3 px-2">Teacher</th>
                      <th className="text-center py-3 px-2">Present</th>
                      <th className="text-center py-3 px-2">Absent</th>
                      <th className="text-center py-3 px-2">Late</th>
                      <th className="text-center py-3 px-2">Early Out</th>
                      <th className="text-center py-3 px-2">Avg In</th>
                      <th className="text-center py-3 px-2">Avg Out</th>
                      <th className="text-center py-3 px-2">Hours</th>
                      <th className="text-center py-3 px-2">Attendance</th>
                      <th className="text-center py-3 px-2">Punctuality</th>
                      <th className="text-center py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeachers.map((teacher) => (
                      <tr key={teacher.teacherId} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2">
                          <div>
                            <div className="text-white font-medium">{teacher.teacherName}</div>
                            <div className="text-xs text-white/50">
                              {teacher.assignedClasses?.join(', ') || 'No classes'}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className="text-green-400 font-medium">{teacher.daysPresent}</span>
                          <span className="text-white/40">/{teacher.totalWorkingDays}</span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={teacher.daysAbsent > 0 ? 'text-red-400' : 'text-white/50'}>
                            {teacher.daysAbsent}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={teacher.lateArrivals > 0 ? 'text-amber-400' : 'text-white/50'}>
                            {teacher.lateArrivals}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={teacher.earlyDepartures > 0 ? 'text-orange-400' : 'text-white/50'}>
                            {teacher.earlyDepartures}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2 text-white/70">{teacher.averageArrivalTime}</td>
                        <td className="text-center py-3 px-2 text-white/70">{teacher.averageDepartureTime}</td>
                        <td className="text-center py-3 px-2 text-white/70">{teacher.totalWorkHours}h</td>
                        <td className="text-center py-3 px-2">
                          <Badge className={
                            teacher.attendancePercentage >= 90 ? 'bg-green-500/30 text-green-300' :
                            teacher.attendancePercentage >= 75 ? 'bg-amber-500/30 text-amber-300' :
                            'bg-red-500/30 text-red-300'
                          }>
                            {teacher.attendancePercentage}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-2">
                          <Badge className={
                            teacher.punctualityPercentage >= 90 ? 'bg-green-500/30 text-green-300' :
                            teacher.punctualityPercentage >= 75 ? 'bg-amber-500/30 text-amber-300' :
                            'bg-red-500/30 text-red-300'
                          }>
                            {teacher.punctualityPercentage}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTeacher(teacher)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedTeachers.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  No teachers found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <AttendanceReportModal
          teacher={selectedTeacher}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
};

export default MonthlyAttendanceReport;
