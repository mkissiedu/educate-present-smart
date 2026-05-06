import { useState, useEffect } from 'react';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { BillGeneratorHeader } from './billing/BillGeneratorHeader';
import { ClassBillSelector } from './billing/ClassBillSelector';
import { BillLineItemsEditor } from './billing/BillLineItemsEditor';
import { DiscountManager } from './billing/DiscountManager';
import { BillPreview } from './billing/BillPreview';
import { StudentBillList } from './billing/StudentBillList';
import { IndividualDiscountModal } from './billing/IndividualDiscountModal';
import { BankPaymentVerification } from './billing/BankPaymentVerification';
import { FeeAccountSearch } from './billing/FeeAccountSearch';
import { FeeAccountDetails } from './billing/FeeAccountDetails';
import { PaymentPlanCreator } from './billing/PaymentPlanCreator';
import { PaymentPlanList } from './billing/PaymentPlanList';
import { InstallmentTracker } from './billing/InstallmentTracker';
import { ReminderTemplateManager } from './billing/ReminderTemplateManager';
import { ReminderScheduleConfig } from './billing/ReminderScheduleConfig';
import { ReminderHistory } from './billing/ReminderHistory';
import { createStudentBill, getStudentBills } from '@/lib/supabase-billing';
import { getStudentPreviousBalance, markBillSentWhatsApp } from '@/lib/billing-payments';
import { getPendingSubmissions } from '@/lib/bank-payment-verification';
import { getPaymentPlans } from '@/lib/payment-plans';
import { getReminderTemplates, getReminderSchedule } from '@/lib/supabase-reminders';
import { fetchStudents } from '@/lib/supabase-students';
import type { BillLineItem, StudentDiscount, StudentBill } from '@/types/billing';
import type { PaymentPlan } from '@/types/payment-plan';
import type { ReminderTemplate, ReminderSchedule } from '@/types/reminder';
import { FileText, Loader2, Users, Receipt, UserCog, Building2, Wallet, CalendarClock, Bell, Send } from 'lucide-react';

export function BillGenerator() {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const { toast } = useToast();
  const schoolId = currentSchool?.id || user?.school_id;
  const schoolName = currentSchool?.name || 'School';

  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [dueDate, setDueDate] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);
  const [discounts, setDiscounts] = useState<StudentDiscount[]>([]);
  const [individualDiscounts, setIndividualDiscounts] = useState<Map<string, StudentDiscount[]>>(new Map());
  const [generatedBills, setGeneratedBills] = useState<StudentBill[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);

  useEffect(() => { if (schoolId) loadData(); }, [schoolId]);

  const loadData = async () => {
    const [studentData, billData, pendingSubs, plans] = await Promise.all([
      fetchStudents(schoolId!), getStudentBills(schoolId!), 
      getPendingSubmissions(schoolId!).catch(() => []),
      getPaymentPlans(schoolId!).catch(() => [])
    ]);
    setStudents(studentData);
    setPendingVerifications(pendingSubs.length);
    setPaymentPlans(plans);
    const enrichedBills = billData.map(b => {
      const s = studentData.find(st => st.id === b.student_id);
      return { ...b, student_name: s?.name || 'Unknown', class_name: s?.class_name };
    });
    setGeneratedBills(enrichedBills);
    const classMap = new Map();
    studentData.forEach(s => {
      const cls = s.class_name || 'Unassigned';
      if (!classMap.has(cls)) classMap.set(cls, { id: cls, name: cls, studentCount: 0 });
      classMap.get(cls).studentCount++;
    });
    setClasses(Array.from(classMap.values()));
  };

  const subtotal = lineItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  const selectedStudents = students.filter(s => selectedClasses.includes(s.class_name || 'Unassigned'));
  const activePlans = paymentPlans.filter(p => p.status === 'active').length;
  const getStudentName = (id?: string) => students.find(s => s.id === id)?.name || 'Unknown';

  const generateBills = async () => {
    if (!schoolId || selectedClasses.length === 0 || lineItems.filter(i => i.amount > 0).length === 0) {
      toast({ title: 'Error', description: 'Select classes and add line items', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const bills: StudentBill[] = [];
      for (const student of selectedStudents) {
        const prevBalance = await getStudentPreviousBalance(student.id, term);
        const allDiscounts = [...discounts, ...(individualDiscounts.get(student.id) || [])];
        const studentTotalDiscount = allDiscounts.reduce((sum, d) => sum + d.discount_value, 0);
        const totalAmount = subtotal - studentTotalDiscount + prevBalance;
        const bill = await createStudentBill({
          school_id: schoolId, student_id: student.id, class_id: student.class_name,
          term, academic_year: academicYear, line_items: lineItems.filter(i => i.amount > 0),
          subtotal, discounts: allDiscounts, total_discount: studentTotalDiscount,
          previous_balance: prevBalance, total_amount: Math.max(0, totalAmount),
          amount_paid: 0, balance: Math.max(0, totalAmount), status: 'pending',
          due_date: dueDate || undefined, sent_via_whatsapp: false
        });
        bills.push({ ...bill, student_name: student.name, class_name: student.class_name });
      }
      setGeneratedBills(prev => [...bills, ...prev]);
      toast({ title: 'Success', description: `Generated ${bills.length} bills` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsGenerating(false);
  };

  const handleSendWhatsApp = async (bill: StudentBill) => {
    const student = students.find(s => s.id === bill.student_id);
    const phone = student?.parent_phone || student?.guardian_phone;
    if (!phone) { toast({ title: 'No phone', description: 'Parent phone not found', variant: 'destructive' }); return; }
    const { error } = await supabase.functions.invoke('send-bill-whatsapp', { body: { parentPhone: phone, studentName: student.name, billCode: bill.bill_code, totalAmount: bill.total_amount, balance: bill.balance, lineItems: bill.line_items, discounts: bill.discounts, dueDate: bill.due_date, schoolName } });
    if (!error) { await markBillSentWhatsApp(bill.id); toast({ title: 'Sent', description: 'Bill sent via WhatsApp' }); loadData(); }
  };

  const handlePayment = async (bill: StudentBill) => {
    const student = students.find(s => s.id === bill.student_id);
    const { data } = await supabase.functions.invoke('hubtel-payment', { body: { billCode: bill.bill_code, amount: bill.balance, phoneNumber: student?.parent_phone, studentName: student?.name, schoolName } });
    if (data?.checkoutUrl) { window.open(data.checkoutUrl, '_blank'); toast({ title: 'Payment', description: 'Payment page opened' }); }
  };

  return (
    <div className="p-6 space-y-6">
      <BillGeneratorHeader term={term} academicYear={academicYear} dueDate={dueDate} onTermChange={setTerm} onYearChange={setAcademicYear} onDueDateChange={setDueDate} />
      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="generate" className="gap-1"><FileText className="h-4 w-4" /> Generate</TabsTrigger>
          <TabsTrigger value="bills" className="gap-1"><Receipt className="h-4 w-4" /> Bills ({generatedBills.length})</TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1"><Wallet className="h-4 w-4" /> Fee Accounts</TabsTrigger>
          <TabsTrigger value="plans" className="gap-1"><CalendarClock className="h-4 w-4" /> Plans {activePlans > 0 && <Badge className="ml-1 h-5 px-1.5 bg-emerald-500">{activePlans}</Badge>}</TabsTrigger>
          <TabsTrigger value="reminders" className="gap-1"><Bell className="h-4 w-4" /> Reminders</TabsTrigger>
          <TabsTrigger value="verify" className="gap-1"><Building2 className="h-4 w-4" /> Verify {pendingVerifications > 0 && <Badge className="ml-1 bg-red-500">{pendingVerifications}</Badge>}</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="space-y-4">
          <ClassBillSelector classes={classes} selectedClasses={selectedClasses} onSelectionChange={setSelectedClasses} />
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardContent className="pt-4"><BillLineItemsEditor lineItems={lineItems} onChange={setLineItems} /></CardContent></Card>
            <div className="space-y-4">
              <Card><CardContent className="pt-4"><DiscountManager discounts={discounts} onChange={setDiscounts} subtotal={subtotal} /><Button variant="outline" size="sm" className="mt-3 w-full gap-1" onClick={() => setShowIndividualModal(true)}><UserCog className="h-4 w-4" /> Individual Discounts</Button></CardContent></Card>
              <BillPreview studentName="Sample Student" className={selectedClasses[0] || 'Class'} term={term} academicYear={academicYear} lineItems={lineItems} discounts={discounts} previousBalance={0} />
            </div>
          </div>
          <Button onClick={generateBills} disabled={isGenerating || selectedClasses.length === 0} className="w-full gap-2" size="lg">{isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />} Generate Bills for {selectedStudents.length} Students</Button>
        </TabsContent>
        <TabsContent value="bills"><StudentBillList bills={generatedBills} onSendWhatsApp={handleSendWhatsApp} onInitiatePayment={handlePayment} onViewBill={(b) => toast({ title: b.bill_code, description: `${b.student_name}: GH₵${b.total_amount}` })} schoolId={schoolId} /></TabsContent>
        <TabsContent value="accounts">{selectedStudent ? <FeeAccountDetails student={selectedStudent} schoolId={schoolId!} schoolName={schoolName} onBack={() => setSelectedStudent(null)} /> : <FeeAccountSearch students={students} onSelectStudent={setSelectedStudent} />}</TabsContent>
        <TabsContent value="plans">{selectedPlan ? <InstallmentTracker plan={selectedPlan} studentName={getStudentName(selectedPlan.student_id)} onBack={() => setSelectedPlan(null)} onRefresh={loadData} /> : <div className="grid lg:grid-cols-2 gap-4"><PaymentPlanCreator schoolId={schoolId!} students={students} classes={classes} onPlanCreated={loadData} /><PaymentPlanList plans={paymentPlans} students={students} onViewPlan={setSelectedPlan} onRefresh={loadData} schoolId={schoolId} /></div>}</TabsContent>
        <TabsContent value="reminders"><BillReminderTab schoolId={schoolId!} students={students} bills={generatedBills} /></TabsContent>
        <TabsContent value="verify"><BankPaymentVerification /></TabsContent>
      </Tabs>
      <IndividualDiscountModal isOpen={showIndividualModal} onClose={() => setShowIndividualModal(false)} students={selectedStudents} onApplyDiscounts={setIndividualDiscounts} subtotal={subtotal} />
    </div>
  );
}

function BillReminderTab({ schoolId, students, bills }: { schoolId: string; students: any[]; bills: StudentBill[] }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [schedule, setSchedule] = useState<ReminderSchedule | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadReminders(); }, [schoolId]);

  const loadReminders = async () => {
    const [t, s] = await Promise.all([getReminderTemplates(schoolId).catch(() => []), getReminderSchedule(schoolId).catch(() => null)]);
    setTemplates(t); setSchedule(s);
  };

  const sendReminders = async () => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke('send-bill-reminders', { body: { schoolId } });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Reminders Sent', description: `Sent ${data?.sent || 0} reminders` });
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5" /> Automated Bill Reminders</h3>
        <Button onClick={sendReminders} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Send Due Reminders Now</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ReminderTemplateManager templates={templates} schoolId={schoolId} onRefresh={loadReminders} />
        <ReminderScheduleConfig schedule={schedule} schoolId={schoolId} onRefresh={loadReminders} />
      </div>
      <ReminderHistory schoolId={schoolId} students={students} />
    </div>
  );
}

