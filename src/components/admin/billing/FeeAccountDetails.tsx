import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudentBillsForAccount, getStudentPayments, getOrCreateFeeAccount } from '@/lib/billing-payments';
import { getStudentPaymentPlans, getPlanInstallments } from '@/lib/payment-plans';
import { generateFeeStatement } from '@/lib/fee-account-utils';
import { User, ArrowLeft, Wallet, Receipt, FileText, TrendingUp, TrendingDown, Loader2, CalendarClock } from 'lucide-react';
import type { FeeAccount, StudentBill, FeePayment, StudentFeeStatement } from '@/types/billing';
import type { PaymentPlan, PlanInstallment } from '@/types/payment-plan';

interface Props {
  student: { id: string; name: string; class_name?: string };
  schoolId: string;
  schoolName: string;
  onBack: () => void;
}

export function FeeAccountDetails({ student, schoolId, schoolName, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<StudentBill[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [statement, setStatement] = useState<StudentFeeStatement | null>(null);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);

  useEffect(() => { loadAccountData(); }, [student.id]);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const [acc, billData, paymentData, planData] = await Promise.all([
        getOrCreateFeeAccount(student.id, schoolId),
        getStudentBillsForAccount(student.id),
        getStudentPayments(student.id),
        getStudentPaymentPlans(student.id)
      ]);
      setBills(billData);
      setPayments(paymentData);
      setPlans(planData);
      setStatement(generateFeeStatement(student.id, student.name, student.class_name || '', schoolName, billData, paymentData));
    } catch (err) {
      console.error('Error loading account:', err);
    }
    setLoading(false);
  };

  const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalPaid = payments.filter(p => p.payment_status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const balance = totalBilled - totalPaid;

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><User className="h-6 w-6 text-emerald-600" /></div>
          <div><h2 className="text-xl font-bold">{student.name}</h2><Badge variant="secondary">{student.class_name || 'No Class'}</Badge></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200"><CardContent className="pt-4"><div className="flex items-center gap-2 text-blue-600 mb-1"><TrendingUp className="h-4 w-4" /><span className="text-sm">Total Billed</span></div><p className="text-2xl font-bold text-blue-700">GH₵{totalBilled.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-green-50 border-green-200"><CardContent className="pt-4"><div className="flex items-center gap-2 text-green-600 mb-1"><TrendingDown className="h-4 w-4" /><span className="text-sm">Total Paid</span></div><p className="text-2xl font-bold text-green-700">GH₵{totalPaid.toFixed(2)}</p></CardContent></Card>
        <Card className={balance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1" style={{ color: balance > 0 ? '#ea580c' : '#059669' }}><Wallet className="h-4 w-4" /><span className="text-sm">Balance</span></div><p className="text-2xl font-bold" style={{ color: balance > 0 ? '#c2410c' : '#047857' }}>GH₵{balance.toFixed(2)}</p></CardContent></Card>
      </div>
      <Tabs defaultValue="statement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statement" className="gap-1"><FileText className="h-4 w-4" /> Statement</TabsTrigger>
          <TabsTrigger value="bills" className="gap-1"><Receipt className="h-4 w-4" /> Bills ({bills.length})</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1"><Wallet className="h-4 w-4" /> Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="plans" className="gap-1"><CalendarClock className="h-4 w-4" /> Plans ({plans.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="statement">{statement && <FeeStatementView statement={statement} />}</TabsContent>
        <TabsContent value="bills"><BillsListView bills={bills} /></TabsContent>
        <TabsContent value="payments"><PaymentsListView payments={payments} /></TabsContent>
        <TabsContent value="plans"><PlansListView plans={plans} /></TabsContent>
      </Tabs>
    </div>
  );
}

function FeeStatementView({ statement }: { statement: StudentFeeStatement }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base">Fee Statement</CardTitle><Button size="sm" onClick={() => window.print()} className="gap-1"><FileText className="h-4 w-4" /> Print</Button></CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="text-left p-2">Date</th><th className="text-left p-2">Description</th><th className="text-left p-2">Reference</th><th className="text-right p-2">Debit (GH₵)</th><th className="text-right p-2">Credit (GH₵)</th><th className="text-right p-2">Balance (GH₵)</th></tr></thead>
            <tbody>{statement.entries.map((e) => (<tr key={e.id} className="border-t"><td className="p-2">{new Date(e.date).toLocaleDateString()}</td><td className="p-2">{e.description}</td><td className="p-2 font-mono text-xs">{e.reference}</td><td className="p-2 text-right text-red-600">{e.debit > 0 ? e.debit.toFixed(2) : '-'}</td><td className="p-2 text-right text-green-600">{e.credit > 0 ? e.credit.toFixed(2) : '-'}</td><td className="p-2 text-right font-medium">{e.balance.toFixed(2)}</td></tr>))}</tbody>
            <tfoot className="bg-gray-50 font-semibold"><tr className="border-t-2"><td colSpan={3} className="p-2">Totals</td><td className="p-2 text-right text-red-600">{statement.total_debits.toFixed(2)}</td><td className="p-2 text-right text-green-600">{statement.total_credits.toFixed(2)}</td><td className="p-2 text-right">{statement.closing_balance.toFixed(2)}</td></tr></tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function BillsListView({ bills }: { bills: StudentBill[] }) {
  return (
    <Card><CardContent className="pt-4"><div className="space-y-2">{bills.map(b => (<div key={b.id} className="p-3 bg-gray-50 rounded-lg flex justify-between"><div><p className="font-medium">{b.term} {b.academic_year}</p><p className="text-sm text-gray-500 font-mono">{b.bill_code}</p></div><div className="text-right"><p className="font-bold">GH₵{b.total_amount.toFixed(2)}</p><Badge className={b.status === 'paid' ? 'bg-green-100 text-green-800' : b.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>{b.status}</Badge></div></div>))}{bills.length === 0 && <p className="text-center py-4 text-gray-500">No bills found</p>}</div></CardContent></Card>
  );
}

function PaymentsListView({ payments }: { payments: FeePayment[] }) {
  return (
    <Card><CardContent className="pt-4"><div className="space-y-2">{payments.map(p => (<div key={p.id} className="p-3 bg-gray-50 rounded-lg flex justify-between"><div><p className="font-medium">{new Date(p.payment_date).toLocaleDateString()}</p><p className="text-sm text-gray-500">{p.payment_method.toUpperCase()} - {p.receipt_number}</p></div><div className="text-right"><p className="font-bold text-green-600">GH₵{p.amount.toFixed(2)}</p><Badge className={p.payment_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{p.payment_status}</Badge></div></div>))}{payments.length === 0 && <p className="text-center py-4 text-gray-500">No payments found</p>}</div></CardContent></Card>
  );
}

function PlansListView({ plans }: { plans: PaymentPlan[] }) {
  const statusColors = { active: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-gray-100 text-gray-800', defaulted: 'bg-red-100 text-red-800' };
  return (
    <Card><CardContent className="pt-4"><div className="space-y-2">{plans.map(p => (<div key={p.id} className="p-3 bg-gray-50 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-medium">{p.plan_name}</p><p className="text-sm text-gray-500 capitalize">{p.plan_type} - {p.number_of_installments} installments</p></div><div className="text-right"><p className="font-bold">GH₵{p.total_amount.toFixed(2)}</p><Badge className={statusColors[p.status]}>{p.status}</Badge></div></div><div className="mt-2 text-xs text-gray-500">Start: {new Date(p.start_date).toLocaleDateString()} | End: {p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</div></div>))}{plans.length === 0 && <p className="text-center py-4 text-gray-500">No payment plans</p>}</div></CardContent></Card>
  );
}
