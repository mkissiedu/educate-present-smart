import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CalendarDays,
  Settings
} from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getLeaveTypes, 
  getLeaveRequests, 
  getPendingLeaveRequests,
  updateLeaveRequestStatus,
  getLeaveStatistics,
  getTeamLeaveCalendar,
  createLeaveType,
  updateLeaveType
} from '@/lib/supabase-leave';
import type { LeaveType, LeaveRequest, LeaveStatus } from '@/types/punch-clock';

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300', icon: <Clock className="h-3.5 w-3.5" />, label: 'Pending' },
  approved: { color: 'text-green-700', bgColor: 'bg-green-100 border-green-300', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Approved' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100 border-red-300', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Rejected' },
  cancelled: { color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Cancelled' }
};

export default function LeaveManagement() {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [teamCalendar, setTeamCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // Review Modal
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<Partial<LeaveType> | null>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (currentSchool?.id) {
      loadData();
    }
  }, [currentSchool?.id, calendarMonth, calendarYear]);

  const loadData = async () => {
    if (!currentSchool?.id) return;
    
    setLoading(true);
    try {
      const [types, all, pending, stats, calendar] = await Promise.all([
        getLeaveTypes(currentSchool.id),
        getLeaveRequests(currentSchool.id),
        getPendingLeaveRequests(currentSchool.id),
        getLeaveStatistics(currentSchool.id, currentYear),
        getTeamLeaveCalendar(currentSchool.id, calendarMonth, calendarYear)
      ]);
      
      setLeaveTypes(types);
      setAllRequests(all);
      setPendingRequests(pending);
      setStatistics(stats);
      setTeamCalendar(calendar);
    } catch (error) {
      console.error('Error loading leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!selectedRequest || !user?.id) return;
    
    setSubmitting(true);
    try {
      const status: LeaveStatus = action === 'approve' ? 'approved' : 'rejected';
      await updateLeaveRequestStatus(
        selectedRequest.id,
        status,
        user.id,
        user.name || user.email || 'Admin',
        reviewNotes
      );
      
      setSelectedRequest(null);
      setReviewNotes('');
      setReviewAction(null);
      loadData();
    } catch (error) {
      console.error('Error reviewing request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = allRequests.filter(request => {
    if (!request) return false;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const teacherName = (request.teacher_name || '').toLowerCase();
    const leaveTypeName = (request.leave_type_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = q === '' || teacherName.includes(q) || leaveTypeName.includes(q);
    return matchesStatus && matchesSearch;
  });


  const handleSaveLeaveType = async () => {
    if (!editingLeaveType || !currentSchool?.id) return;
    
    try {
      if (editingLeaveType.id) {
        await updateLeaveType(editingLeaveType.id, editingLeaveType);
      } else {
        await createLeaveType({ ...editingLeaveType, school_id: currentSchool.id });
      }
      setEditingLeaveType(null);
      loadData();
    } catch (error) {
      console.error('Error saving leave type:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Teacher', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason', 'Reviewed By', 'Review Date'];
    const rows = filteredRequests.map(r => [
      r.teacher_name,
      r.leave_type_name,
      r.start_date,
      r.end_date,
      r.total_days,
      r.status,
      r.reason || '',
      r.reviewed_by_name || '',
      r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-600">Review and manage teacher leave requests</p>
        </div>
        <Button variant="outline" onClick={() => setShowSettingsModal(true)} className="gap-2">
          <Settings className="h-4 w-4" />
          Leave Settings
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{statistics?.pendingRequests || 0}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-800">{statistics?.approvedRequests || 0}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{statistics?.rejectedRequests || 0}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <XCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Requests</p>
                <p className="text-2xl font-bold text-blue-800">{statistics?.totalRequests || 0}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <FileText className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Days Approved</p>
                <p className="text-2xl font-bold text-purple-800">{statistics?.totalDaysApproved || 0}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <CalendarDays className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Requests
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Team Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending leave requests to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {(request.teacher_name || '?').charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.teacher_name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-600">{request.leave_type_name || ''}</p>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {request.reason && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              <span className="font-medium">Reason:</span> {request.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewAction('reject');
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewAction('approve');
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by teacher or leave type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Requests Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                    const status = statusConfig[request.status];
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.teacher_name}</TableCell>
                        <TableCell>{request.leave_type_name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{request.total_days}</TableCell>
                        <TableCell>
                          <Badge className={`${status.bgColor} ${status.color} flex items-center gap-1 w-fit`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {request.reviewed_by_name || '-'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Team Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Leave Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      if (calendarMonth === 1) {
                        setCalendarMonth(12);
                        setCalendarYear(calendarYear - 1);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[150px] text-center">
                    {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      if (calendarMonth === 12) {
                        setCalendarMonth(1);
                        setCalendarYear(calendarYear + 1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teamCalendar.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leave scheduled for this month
                </div>
              ) : (
                <div className="space-y-3">
                  {teamCalendar.filter(t => t).map((teacher) => {
                    const teacherName = teacher?.teacherName || teacher?.teacher_name || 'Unknown Teacher';
                    const teacherId = teacher?.teacherId || teacher?.teacher_id || teacherName;
                    const leaves = Array.isArray(teacher?.leaves) ? teacher.leaves : [];
                    return (
                    <div key={teacherId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {teacherName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{teacherName}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {leaves.map((leave: LeaveRequest) => (
                            <Badge 
                              key={leave.id}
                              className={leave.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                            >
                              {leave.leave_type_name}: {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                              {leave.status === 'pending' && ' (Pending)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics?.byLeaveType?.map((item: any) => {
                    const leaveType = leaveTypes.find(t => t.name === item.type);
                    const percentage = statistics.totalRequests > 0 
                      ? (item.count / statistics.totalRequests) * 100 
                      : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{item.type}</span>
                          <span className="text-gray-600">{item.count} requests ({item.days} days)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: leaveType?.color || '#6B7280'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year Overview ({currentYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {statistics?.totalRequests > 0 
                        ? Math.round((statistics.approvedRequests / statistics.totalRequests) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Avg Days/Request</p>
                    <p className="text-2xl font-bold text-green-800">
                      {statistics?.approvedRequests > 0 
                        ? (statistics.totalDaysApproved / statistics.approvedRequests).toFixed(1)
                        : 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Pending Review</p>
                    <p className="text-2xl font-bold text-purple-800">{statistics?.pendingRequests || 0}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Rejection Rate</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {statistics?.totalRequests > 0 
                        ? Math.round((statistics.rejectedRequests / statistics.totalRequests) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={!!selectedRequest && !!reviewAction} onOpenChange={() => { setSelectedRequest(null); setReviewAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><span className="font-medium">Teacher:</span> {selectedRequest.teacher_name}</p>
                <p><span className="font-medium">Leave Type:</span> {selectedRequest.leave_type_name}</p>
                <p><span className="font-medium">Dates:</span> {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Duration:</span> {selectedRequest.total_days} day{selectedRequest.total_days !== 1 ? 's' : ''}</p>
                {selectedRequest.reason && (
                  <p><span className="font-medium">Reason:</span> {selectedRequest.reason}</p>
                )}
              </div>
              
              <div>
                <Label>Review Notes (Optional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewAction === 'approve' 
                    ? "Add any notes for the teacher..." 
                    : "Please provide a reason for rejection..."
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setReviewAction(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={() => reviewAction && handleReview(reviewAction)}
              disabled={submitting}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {submitting ? 'Processing...' : reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Request Details Modal */}
      <Dialog open={!!selectedRequest && !reviewAction} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {(selectedRequest.teacher_name || '?').charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedRequest.teacher_name || 'Unknown'}</h3>
                  <Badge className={statusConfig[selectedRequest.status]?.bgColor || 'bg-gray-100'}>
                    {statusConfig[selectedRequest.status]?.label || selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Leave Type</p>
                  <p className="font-medium">{selectedRequest.leave_type_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{selectedRequest.total_days} day{selectedRequest.total_days !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(selectedRequest.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedRequest.reason && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reason</p>
                  <p className="p-3 bg-gray-50 rounded-lg">{selectedRequest.reason}</p>
                </div>
              )}
              
              {selectedRequest.reviewed_by_name && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">
                    Reviewed by <span className="font-medium">{selectedRequest.reviewed_by_name}</span> on {new Date(selectedRequest.reviewed_at!).toLocaleDateString()}
                  </p>
                  {selectedRequest.review_notes && (
                    <p className="mt-2 text-sm">{selectedRequest.review_notes}</p>
                  )}
                </div>
              )}
              
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setReviewAction('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setReviewAction('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Leave Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Type Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {leaveTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-gray-500">
                      {type.days_allowed} days • {type.is_paid ? 'Paid' : 'Unpaid'}
                      {type.requires_documentation && ' • Documentation required'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingLeaveType(type)}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Close
            </Button>
            <Button onClick={() => setEditingLeaveType({ 
              name: '', 
              days_allowed: 0, 
              is_paid: true, 
              requires_documentation: false,
              color: '#3B82F6',
              is_active: true
            })}>
              Add Leave Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Type Modal */}
      <Dialog open={!!editingLeaveType} onOpenChange={() => setEditingLeaveType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLeaveType?.id ? 'Edit' : 'Add'} Leave Type</DialogTitle>
          </DialogHeader>
          
          {editingLeaveType && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingLeaveType.name || ''}
                  onChange={(e) => setEditingLeaveType({ ...editingLeaveType, name: e.target.value })}
                  placeholder="e.g., Sick Leave"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingLeaveType.description || ''}
                  onChange={(e) => setEditingLeaveType({ ...editingLeaveType, description: e.target.value })}
                  placeholder="Brief description of this leave type"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Days Allowed</Label>
                  <Input
                    type="number"
                    value={editingLeaveType.days_allowed || 0}
                    onChange={(e) => setEditingLeaveType({ ...editingLeaveType, days_allowed: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={editingLeaveType.color || '#3B82F6'}
                    onChange={(e) => setEditingLeaveType({ ...editingLeaveType, color: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingLeaveType.is_paid}
                    onChange={(e) => setEditingLeaveType({ ...editingLeaveType, is_paid: e.target.checked })}
                    className="rounded"
                  />
                  <span>Paid Leave</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingLeaveType.requires_documentation}
                    onChange={(e) => setEditingLeaveType({ ...editingLeaveType, requires_documentation: e.target.checked })}
                    className="rounded"
                  />
                  <span>Requires Documentation</span>
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLeaveType(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLeaveType}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
