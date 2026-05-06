import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Users, User, Loader2 } from 'lucide-react';
import { createPaymentPlan } from '@/lib/payment-plans';
import { useToast } from '@/hooks/use-toast';
import type { PlanType } from '@/types/payment-plan';

interface Props {
  schoolId: string;
  students: any[];
  classes: { id: string; name: string }[];
  onPlanCreated: () => void;
}

export function PaymentPlanCreator({ schoolId, students, classes, onPlanCreated }: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<'individual' | 'class'>('individual');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState<PlanType>('monthly');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [installments, setInstallments] = useState<{ amount: string; due_date: string }[]>([{ amount: '', due_date: '' }]);
  const [isCreating, setIsCreating] = useState(false);

  const generateInstallments = () => {
    const amount = parseFloat(totalAmount) || 0;
    if (amount <= 0) return;
    
    const today = new Date();
    let dates: Date[] = [];
    let count = 3;

    if (planType === 'monthly') {
      count = 3;
      for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setMonth(d.getMonth() + i + 1);
        d.setDate(15);
        dates.push(d);
      }
    } else if (planType === 'termly') {
      count = 2;
      dates = [new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000), new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)];
    }

    const perInst = Math.ceil(amount / count);
    const newInst = dates.map((d, i) => ({
      amount: (i === dates.length - 1 ? amount - perInst * (count - 1) : perInst).toString(),
      due_date: d.toISOString().split('T')[0]
    }));
    setInstallments(newInst);
  };

  const addInstallment = () => setInstallments([...installments, { amount: '', due_date: '' }]);
  const removeInstallment = (idx: number) => setInstallments(installments.filter((_, i) => i !== idx));
  const updateInstallment = (idx: number, field: 'amount' | 'due_date', value: string) => {
    const updated = [...installments];
    updated[idx][field] = value;
    setInstallments(updated);
  };

  const handleCreate = async () => {
    if (!planName || !totalAmount || installments.some(i => !i.amount || !i.due_date)) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      if (mode === 'individual') {
        await createPaymentPlan({
          school_id: schoolId, student_id: selectedStudent, plan_name: planName, plan_type: planType,
          total_amount: parseFloat(totalAmount),
          installments: installments.map(i => ({ amount: parseFloat(i.amount), due_date: i.due_date })),
          notes
        });
      } else {
        const classStudents = students.filter(s => s.class_name === selectedClass);
        for (const student of classStudents) {
          await createPaymentPlan({
            school_id: schoolId, student_id: student.id, class_id: selectedClass, plan_name: planName, plan_type: planType,
            total_amount: parseFloat(totalAmount),
            installments: installments.map(i => ({ amount: parseFloat(i.amount), due_date: i.due_date })),
            notes
          });
        }
      }
      toast({ title: 'Success', description: 'Payment plan created' });
      onPlanCreated();
      setPlanName(''); setTotalAmount(''); setInstallments([{ amount: '', due_date: '' }]);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsCreating(false);
  };

  const instTotal = installments.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const diff = (parseFloat(totalAmount) || 0) - instTotal;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Create Payment Plan</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={mode === 'individual' ? 'default' : 'outline'} size="sm" onClick={() => setMode('individual')}><User className="h-4 w-4 mr-1" /> Individual</Button>
          <Button variant={mode === 'class' ? 'default' : 'outline'} size="sm" onClick={() => setMode('class')}><Users className="h-4 w-4 mr-1" /> Class</Button>
        </div>
        {mode === 'individual' ? (
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - {s.class_name}</SelectItem>)}</SelectContent>
          </Select>
        ) : (
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Plan Name</Label><Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Term 1 Payment Plan" /></div>
          <div><Label>Plan Type</Label>
            <Select value={planType} onValueChange={(v: PlanType) => setPlanType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="termly">Termly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><Label>Total Amount (GH₵)</Label><Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} /></div>
          <Button variant="outline" onClick={generateInstallments}>Auto-Generate</Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><Label>Installments</Label><Badge variant={diff === 0 ? 'default' : 'destructive'}>{diff === 0 ? 'Balanced' : `Diff: GH₵${diff.toFixed(2)}`}</Badge></div>
          {installments.map((inst, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground w-6">#{idx + 1}</span>
              <Input type="number" placeholder="Amount" value={inst.amount} onChange={e => updateInstallment(idx, 'amount', e.target.value)} className="flex-1" />
              <Input type="date" value={inst.due_date} onChange={e => updateInstallment(idx, 'due_date', e.target.value)} className="flex-1" />
              {installments.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeInstallment(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addInstallment} className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Installment</Button>
        </div>
        <Textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        <Button onClick={handleCreate} disabled={isCreating} className="w-full">{isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Payment Plan</Button>
      </CardContent>
    </Card>
  );
}
