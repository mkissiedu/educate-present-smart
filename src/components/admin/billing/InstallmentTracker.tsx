import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, CreditCard, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { getPlanInstallments, recordInstallmentPayment } from '@/lib/payment-plans';
import { useToast } from '@/hooks/use-toast';
import type { PaymentPlan, PlanInstallment, InstallmentStatus } from '@/types/payment-plan';

interface Props {
  plan: PaymentPlan;
  studentName: string;
  onBack: () => void;
  onRefresh: () => void;
}

const statusConfig: Record<InstallmentStatus, { color: string; icon: any }> = {
  pending: { color: 'bg-gray-100 text-gray-800', icon: Clock },
  partial: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export function InstallmentTracker({ plan, studentName, onBack, onRefresh }: Props) {
  const { toast } = useToast();
  const [installments, setInstallments] = useState<PlanInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<PlanInstallment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { loadInstallments(); }, [plan.id]);

  const loadInstallments = async () => {
    setLoading(true);
    const data = await getPlanInstallments(plan.id);
    setInstallments(data);
    setLoading(false);
  };

  const totalPaid = installments.reduce((s, i) => s + (i.amount_paid || 0), 0);
  const progress = plan.total_amount > 0 ? (totalPaid / plan.total_amount) * 100 : 0;

  const handleRecordPayment = async () => {
    if (!paymentModal || !paymentAmount) return;
    setIsProcessing(true);
    try {
      await recordInstallmentPayment(paymentModal.id, parseFloat(paymentAmount));
      toast({ title: 'Success', description: 'Payment recorded' });
      setPaymentModal(null);
      setPaymentAmount('');
      loadInstallments();
      onRefresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  const openPaymentModal = (inst: PlanInstallment) => {
    setPaymentModal(inst);
    setPaymentAmount((inst.amount - (inst.amount_paid || 0)).toFixed(2));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div>
          <h2 className="text-xl font-bold">{studentName}</h2>
          <p className="text-gray-500">{plan.plan_name}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Payment Progress</span>
            <span className="font-bold">GH₵{totalPaid.toFixed(2)} / GH₵{plan.total_amount.toFixed(2)}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-right text-sm text-gray-500 mt-1">{progress.toFixed(0)}% complete</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Installments</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {installments.map(inst => {
              const StatusIcon = statusConfig[inst.status].icon;
              const remaining = inst.amount - (inst.amount_paid || 0);
              const isOverdue = inst.status === 'overdue' || (new Date(inst.due_date) < new Date() && inst.status !== 'paid');

              return (
                <div key={inst.id} className={`p-4 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inst.status === 'paid' ? 'bg-green-100' : isOverdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <StatusIcon className={`h-5 w-5 ${inst.status === 'paid' ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">Installment #{inst.installment_number}</p>
                        <p className="text-sm text-gray-500">Due: {new Date(inst.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">GH₵{inst.amount.toFixed(2)}</p>
                      <Badge className={statusConfig[inst.status].color}>{inst.status}</Badge>
                    </div>
                  </div>
                  {inst.amount_paid > 0 && (
                    <div className="mt-2 pt-2 border-t text-sm">
                      <span className="text-green-600">Paid: GH₵{inst.amount_paid.toFixed(2)}</span>
                      {remaining > 0 && <span className="text-orange-600 ml-3">Remaining: GH₵{remaining.toFixed(2)}</span>}
                    </div>
                  )}
                  {inst.status !== 'paid' && (
                    <Button size="sm" className="mt-2 gap-1" onClick={() => openPaymentModal(inst)}>
                      <CreditCard className="h-4 w-4" /> Record Payment
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment - Installment #{paymentModal?.installment_number}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-500">Amount Due: GH₵{paymentModal?.amount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Already Paid: GH₵{(paymentModal?.amount_paid || 0).toFixed(2)}</div>
            <Input type="number" placeholder="Payment amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal(null)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
