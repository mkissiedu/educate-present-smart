import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Eye, XCircle, ChevronDown, ChevronUp, Bell, BarChart3, Loader2 } from 'lucide-react';
import { cancelPlan, sendInstallmentReminders, getComplianceReport } from '@/lib/payment-plans';
import { useToast } from '@/hooks/use-toast';
import type { PaymentPlan, PlanStatus, PlanComplianceReport } from '@/types/payment-plan';

interface Props {
  plans: PaymentPlan[];
  students: any[];
  onViewPlan: (plan: PaymentPlan) => void;
  onRefresh: () => void;
  schoolId?: string;
}

const statusColors: Record<PlanStatus, string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  defaulted: 'bg-red-100 text-red-800'
};

export function PaymentPlanList({ plans, students, onViewPlan, onRefresh, schoolId }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<PlanComplianceReport | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => { if (showReport && schoolId) loadReport(); }, [showReport, schoolId]);

  const loadReport = async () => {
    if (!schoolId) return;
    const data = await getComplianceReport(schoolId);
    setReport(data);
  };

  const getStudentName = (studentId?: string) => students.find(s => s.id === studentId)?.name || 'Class Plan';

  const filteredPlans = plans.filter(p => {
    const studentName = getStudentName(p.student_id).toLowerCase();
    const matchesSearch = studentName.includes(search.toLowerCase()) || p.plan_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = async (planId: string) => {
    if (!confirm('Cancel this payment plan?')) return;
    try {
      await cancelPlan(planId);
      toast({ title: 'Cancelled', description: 'Payment plan cancelled' });
      onRefresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleSendReminders = async () => {
    if (!schoolId) return;
    setSendingReminders(true);
    try {
      const { data } = await sendInstallmentReminders(schoolId, 3);
      toast({ title: 'Reminders Sent', description: `${data?.reminders_sent || 0} reminders sent` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSendingReminders(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Payment Plans ({filteredPlans.length})</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowReport(!showReport)} className="gap-1"><BarChart3 className="h-4 w-4" /> Report</Button>
          <Button size="sm" variant="outline" onClick={handleSendReminders} disabled={sendingReminders} className="gap-1">
            {sendingReminders ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Send Reminders
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showReport && report && (
          <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg mb-4">
            <div className="text-center"><p className="text-2xl font-bold text-emerald-600">{report.active_plans}</p><p className="text-xs text-gray-500">Active Plans</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{report.completed_plans}</p><p className="text-xs text-gray-500">Completed</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-orange-600">{report.overdue_installments}</p><p className="text-xs text-gray-500">Overdue</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-blue-600">{report.collection_rate.toFixed(0)}%</p><p className="text-xs text-gray-500">Collection Rate</p></div>
            <div className="col-span-4 pt-2 border-t text-sm text-center text-gray-600">Total Expected: GH₵{report.total_expected.toFixed(2)} | Collected: GH₵{report.total_collected.toFixed(2)}</div>
          </div>
        )}
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="defaulted">Defaulted</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="border rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}>
                <div className="flex items-center gap-3">{expandedId === plan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}<div><p className="font-medium">{getStudentName(plan.student_id)}</p><p className="text-sm text-gray-500">{plan.plan_name}</p></div></div>
                <div className="flex items-center gap-3"><div className="text-right"><p className="font-bold">GH₵{plan.total_amount.toFixed(2)}</p><p className="text-xs text-gray-500">{plan.number_of_installments} installments</p></div><Badge className={statusColors[plan.status]}>{plan.status}</Badge></div>
              </div>
              {expandedId === plan.id && (
                <div className="p-3 border-t bg-white">
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3"><div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{plan.plan_type}</span></div><div><span className="text-gray-500">Start:</span> <span className="font-medium">{new Date(plan.start_date).toLocaleDateString()}</span></div><div><span className="text-gray-500">End:</span> <span className="font-medium">{plan.end_date ? new Date(plan.end_date).toLocaleDateString() : '-'}</span></div></div>
                  {plan.notes && <p className="text-sm text-gray-600 mb-3">{plan.notes}</p>}
                  <div className="flex gap-2"><Button size="sm" onClick={() => onViewPlan(plan)} className="gap-1"><Eye className="h-4 w-4" /> View</Button>{plan.status === 'active' && <Button size="sm" variant="destructive" onClick={() => handleCancel(plan.id)} className="gap-1"><XCircle className="h-4 w-4" /> Cancel</Button>}</div>
                </div>
              )}
            </div>
          ))}
          {filteredPlans.length === 0 && <p className="text-center py-8 text-gray-500">No payment plans found</p>}
        </div>
      </CardContent>
    </Card>
  );
}
