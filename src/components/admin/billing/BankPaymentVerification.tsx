import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getBankPaymentSubmissions, updateSubmissionStatus } from '@/lib/bank-payment-verification';
import { recordPayment } from '@/lib/billing-payments';
import { supabase } from '@/lib/supabase';
import type { BankPaymentSubmission } from '@/types/bank-payment';
import { CheckCircle, XCircle, Eye, Loader2, Building2, Calendar, FileText } from 'lucide-react';

export function BankPaymentVerification() {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const schoolId = currentSchool?.id || user?.school_id;

  const [submissions, setSubmissions] = useState<BankPaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<BankPaymentSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [verifiedAmount, setVerifiedAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => { if (schoolId) loadSubmissions(); }, [schoolId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getBankPaymentSubmissions(schoolId!);
      setSubmissions(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' });
    }
    setLoading(false);
  };

  const openReview = (sub: BankPaymentSubmission) => {
    setSelectedSubmission(sub);
    setVerifiedAmount(sub.amount_claimed.toString());
    setAdminNotes('');
    setRejectionReason('');
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;
    setProcessing(true);
    try {
      await updateSubmissionStatus(selectedSubmission.id, 'approved', user.id, adminNotes);
      if (selectedSubmission.bill_id) {
        await recordPayment({
          bill_id: selectedSubmission.bill_id, student_id: selectedSubmission.student_id!,
          amount: parseFloat(verifiedAmount), payment_method: 'bank',
          transaction_id: selectedSubmission.transaction_reference,
          payment_status: 'success', receipt_sent: false,
          notes: `Bank payment verified. Ref: ${selectedSubmission.transaction_reference}`
        });
        if (selectedSubmission.parent_phone) {
          const { data: bill } = await supabase.from('student_bills').select('*').eq('id', selectedSubmission.bill_id).single();
          const newBalance = Math.max(0, (bill?.balance || 0) - parseFloat(verifiedAmount));
          await supabase.functions.invoke('send-bill-whatsapp', {
            body: { parentPhone: selectedSubmission.parent_phone, studentName: selectedSubmission.student_name,
              billCode: selectedSubmission.bill_code, totalAmount: bill?.total_amount, balance: newBalance,
              schoolName: currentSchool?.name, isReceipt: true, amountPaid: parseFloat(verifiedAmount),
              receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}` }
          });
        }
      }
      toast({ title: 'Approved', description: 'Payment verified and student account credited' });
      setShowReviewModal(false);
      loadSubmissions();
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedSubmission || !user || !rejectionReason) return;
    setProcessing(true);
    try {
      await updateSubmissionStatus(selectedSubmission.id, 'rejected', user.id, adminNotes, rejectionReason);
      if (selectedSubmission.parent_phone) {
        await supabase.functions.invoke('send-bill-whatsapp', {
          body: { parentPhone: selectedSubmission.parent_phone, studentName: selectedSubmission.student_name,
            billCode: selectedSubmission.bill_code || 'N/A', schoolName: currentSchool?.name,
            isRejection: true, rejectionReason }
        });
      }
      toast({ title: 'Rejected', description: 'Payment rejected and parent notified' });
      setShowReviewModal(false);
      loadSubmissions();
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    setProcessing(false);
  };

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-300', approved: 'bg-green-500/20 text-green-300', rejected: 'bg-red-500/20 text-red-300' };
    return <Badge className={styles[status] || 'bg-gray-500/20'}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Bank Payment Verification</h3>
          {pendingCount > 0 && <Badge className="bg-red-500">{pendingCount} pending</Badge>}
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>
       : filtered.length === 0 ? <Card className="bg-white/5 border-white/10"><CardContent className="py-8 text-center text-gray-400">No {filter} submissions</CardContent></Card>
       : <div className="grid gap-3">{filtered.map(sub => (
          <Card key={sub.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{sub.student_name || 'Unknown'}</span>
                    {statusBadge(sub.status)}
                    <Badge variant="outline" className="text-xs">{sub.submission_source}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{sub.bill_code || 'No bill'}</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{sub.bank_name || 'Bank'}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">GH₵{sub.amount_claimed.toFixed(2)}</div>
                </div>
                <Button size="sm" onClick={() => openReview(sub)} className="gap-1"><Eye className="h-4 w-4" /> Review</Button>
              </div>
            </CardContent>
          </Card>
        ))}</div>}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review Bank Payment</DialogTitle></DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Student:</span> <span className="font-medium">{selectedSubmission.student_name}</span></div>
                <div><span className="text-gray-500">Bill:</span> <span className="font-medium">{selectedSubmission.bill_code || 'N/A'}</span></div>
                <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-emerald-600">GH₵{selectedSubmission.amount_claimed.toFixed(2)}</span></div>
                <div><span className="text-gray-500">Bank:</span> <span className="font-medium">{selectedSubmission.bank_name || 'N/A'}</span></div>
                <div><span className="text-gray-500">Ref:</span> <span className="font-medium">{selectedSubmission.transaction_reference || 'N/A'}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedSubmission.deposit_date || 'N/A'}</span></div>
              </div>
              {selectedSubmission.receipt_image_url && <img src={selectedSubmission.receipt_image_url} alt="Receipt" className="max-h-48 rounded-lg border" />}
              <div><label className="text-sm font-medium">Verified Amount</label><Input type="number" value={verifiedAmount} onChange={e => setVerifiedAmount(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Admin Notes</label><Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Optional..." rows={2} /></div>
              {selectedSubmission.status !== 'approved' && <div><label className="text-sm font-medium">Rejection Reason</label><Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Required to reject..." rows={2} /></div>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason} className="gap-1">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
            </Button>
            <Button onClick={handleApprove} disabled={processing} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
