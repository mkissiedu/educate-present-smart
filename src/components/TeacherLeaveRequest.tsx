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
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Send, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  Briefcase,
  Heart,
  GraduationCap,
  Users
} from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getLeaveTypes, 
  getTeacherLeaveRequests, 
  getTeacherLeaveBalances,
  createLeaveRequest,
  cancelLeaveRequest
} from '@/lib/supabase-leave';
import type { LeaveType, LeaveRequest, TeacherLeaveBalance, LeaveRequestFormData } from '@/types/punch-clock';

const leaveTypeIcons: Record<string, React.ReactNode> = {
  'Sick Leave': <Heart className="h-4 w-4" />,
  'Annual Leave': <CalendarDays className="h-4 w-4" />,
  'Personal Leave': <Briefcase className="h-4 w-4" />,
  'Maternity Leave': <Users className="h-4 w-4" />,
  'Paternity Leave': <Users className="h-4 w-4" />,
  'Bereavement Leave': <Heart className="h-4 w-4" />,
  'Study Leave': <GraduationCap className="h-4 w-4" />,
  'Unpaid Leave': <Calendar className="h-4 w-4" />
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
  approved: { color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
  cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <X className="h-3 w-3" />, label: 'Cancelled' }
};

export default function TeacherLeaveRequest() {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<TeacherLeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('balances');
  
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (currentSchool?.id && user?.id) {
      loadData();
    }
  }, [currentSchool?.id, user?.id]);

  const loadData = async () => {
    if (!currentSchool?.id || !user?.id) return;
    
    setLoading(true);
    try {
      const [types, requests, balances] = await Promise.all([
        getLeaveTypes(currentSchool.id),
        getTeacherLeaveRequests(currentSchool.id, user.id, currentYear),
        getTeacherLeaveBalances(currentSchool.id, user.id, currentYear)
      ]);
      
      setLeaveTypes(types);
      setLeaveRequests(requests);
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Error loading leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleSubmit = async () => {
    if (!currentSchool?.id || !user?.id || !formData.leave_type_id) return;
    
    const selectedType = leaveTypes.find(t => t.id === formData.leave_type_id);
    if (!selectedType) return;

    setSubmitting(true);
    try {
      const result = await createLeaveRequest(
        currentSchool.id,
        user.id,
        user.name || user.email || 'Unknown Teacher',
        formData,
        selectedType.name
      );

      if (result) {
        setShowNewRequestModal(false);
        setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    
    const success = await cancelLeaveRequest(requestId);
    if (success) {
      loadData();
    }
  };

  const selectedLeaveType = leaveTypes.find(t => t.id === formData.leave_type_id);
  const calculatedDays = calculateDays(formData.start_date, formData.end_date);
  const selectedBalance = leaveBalances.find(b => b.leaveType.id === formData.leave_type_id);

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
          <p className="text-gray-600">Request time off and track your leave balances</p>
        </div>
        <Button onClick={() => setShowNewRequestModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveBalances.map((balance) => (
              <Card key={balance.leaveType.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: balance.leaveType.color }}
                />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${balance.leaveType.color}20` }}
                    >
                      {leaveTypeIcons[balance.leaveType.name] || <Calendar className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{balance.leaveType.name}</h3>
                      <p className="text-xs text-gray-500">
                        {balance.leaveType.is_paid ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-green-600">{balance.remainingDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Used</span>
                      <span className="text-gray-900">{balance.usedDays} days</span>
                    </div>
                    {balance.pendingDays > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending</span>
                        <span className="text-yellow-600">{balance.pendingDays} days</span>
                      </div>
                    )}
                    
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${(balance.usedDays / balance.totalDays) * 100}%`,
                            backgroundColor: balance.leaveType.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {balance.usedDays} of {balance.totalDays} days used
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {leaveRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
                <p className="text-gray-500 mb-4">You haven't submitted any leave requests yet.</p>
                <Button onClick={() => setShowNewRequestModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((request) => {
                const status = statusConfig[request.status];
                return (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${leaveTypes.find(t => t.id === request.leave_type_id)?.color || '#6B7280'}20` }}
                          >
                            {leaveTypeIcons[request.leave_type_name] || <Calendar className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.leave_type_name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
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
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{request.reason}</p>
                            )}
                            {request.review_notes && request.status !== 'pending' && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <span className="font-medium">Review notes:</span> {request.review_notes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${status.color} flex items-center gap-1`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                          {request.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancel(request.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-sm font-medium text-gray-500">{day}</div>
                ))}
                {generateCalendarDays().map((day, index) => {
                  const leaveOnDay = leaveRequests.find(r => 
                    r.status === 'approved' &&
                    new Date(r.start_date) <= day.date &&
                    new Date(r.end_date) >= day.date
                  );
                  const pendingOnDay = leaveRequests.find(r => 
                    r.status === 'pending' &&
                    new Date(r.start_date) <= day.date &&
                    new Date(r.end_date) >= day.date
                  );
                  
                  return (
                    <div 
                      key={index}
                      className={`p-2 text-sm rounded-lg ${
                        !day.isCurrentMonth ? 'text-gray-300' :
                        leaveOnDay ? 'text-white' :
                        pendingOnDay ? 'bg-yellow-100 text-yellow-800' :
                        day.isToday ? 'bg-blue-100 text-blue-800 font-semibold' :
                        'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={leaveOnDay ? { 
                        backgroundColor: leaveTypes.find(t => t.id === leaveOnDay.leave_type_id)?.color || '#6B7280'
                      } : undefined}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                {leaveTypes.slice(0, 4).map(type => (
                  <div key={type.id} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: type.color }}
                    />
                    <span>{type.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded bg-yellow-300" />
                  <span>Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Request Modal */}
      <Dialog open={showNewRequestModal} onOpenChange={setShowNewRequestModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Leave Type Selection */}
            <div>
              <Label>Leave Type</Label>
              <Select
                value={formData.leave_type_id}
                onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => {
                    const balance = leaveBalances.find(b => b.leaveType.id === type.id);
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span>{type.name}</span>
                          <span className="text-gray-500 text-xs">
                            ({balance?.remainingDays || 0} days available)
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedLeaveType && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">{selectedLeaveType.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className={selectedLeaveType.is_paid ? 'text-green-600' : 'text-orange-600'}>
                      {selectedLeaveType.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                    {selectedLeaveType.requires_documentation && (
                      <span className="text-blue-600 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Documentation Required
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Days Calculation */}
            {calculatedDays > 0 && (
              <div className={`p-3 rounded-lg ${
                selectedBalance && calculatedDays > selectedBalance.remainingDays 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Total Working Days: <strong>{calculatedDays}</strong>
                  </span>
                  {selectedBalance && (
                    <span className={`text-sm ${
                      calculatedDays > selectedBalance.remainingDays ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {calculatedDays > selectedBalance.remainingDays 
                        ? `Exceeds balance by ${calculatedDays - selectedBalance.remainingDays} days`
                        : `${selectedBalance.remainingDays - calculatedDays} days will remain`
                      }
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label>Reason</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
                rows={3}
              />
            </div>

            {/* Documentation Notice */}
            {selectedLeaveType?.requires_documentation && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Documentation Required</p>
                  <p className="text-yellow-700">
                    This leave type requires supporting documentation. Please submit relevant documents to your administrator.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                submitting || 
                !formData.leave_type_id || 
                !formData.start_date || 
                !formData.end_date ||
                (selectedBalance && calculatedDays > selectedBalance.remainingDays)
              }
              className="gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to generate calendar days
function generateCalendarDays(): { date: Date; isCurrentMonth: boolean; isToday: boolean }[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  
  // Add days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false, isToday: false });
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({ 
      date, 
      isCurrentMonth: true, 
      isToday: i === today.getDate() 
    });
  }
  
  // Add days from next month
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false, isToday: false });
  }
  
  return days;
}
