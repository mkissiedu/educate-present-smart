import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { uploadReceiptImage } from '@/lib/bank-payment-verification';
import { Upload, Loader2, CheckCircle, Building2, Receipt, Phone } from 'lucide-react';

interface Props {
  schoolId: string;
  studentId?: string;
  studentName?: string;
  billCode?: string;
  billId?: string;
  parentPhone?: string;
  onSuccess?: () => void;
}

const BANKS = ['GCB Bank', 'Ecobank', 'Fidelity Bank', 'Stanbic Bank', 'Absa Bank', 'CalBank', 'Access Bank', 'Zenith Bank', 'UBA', 'Standard Chartered', 'First Atlantic Bank', 'Republic Bank', 'Prudential Bank', 'ADB', 'NIB', 'Other'];

export function ParentReceiptUpload({ schoolId, studentId, studentName, billCode, billId, parentPhone, onSuccess }: Props) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB allowed', variant: 'destructive' });
      return;
    }
    setReceiptFile(file || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bankName || !receiptFile) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const imageUrl = await uploadReceiptImage(receiptFile, schoolId);
      const { error } = await supabase.functions.invoke('receive-bank-receipt', {
        body: { schoolId, studentId, billId, billCode, studentName, parentPhone, amount: parseFloat(amount), bankName, transactionRef, depositDate, receiptImageUrl: imageUrl }
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Submitted!', description: 'Your receipt is pending verification' });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Receipt Submitted!</h3>
          <p className="text-gray-600 mb-4">Your bank payment receipt has been submitted for verification. You will receive a WhatsApp confirmation once approved.</p>
          <p className="text-sm text-gray-500">Reference: {billCode}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Submit Bank Receipt</CardTitle>
        <CardDescription>Upload your bank deposit receipt for verification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {billCode && <div className="p-3 bg-blue-50 rounded-lg text-sm"><strong>Bill:</strong> {billCode} {studentName && `- ${studentName}`}</div>}
          
          <div className="space-y-2">
            <Label>Amount Deposited (GH₵) *</Label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label>Bank *</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
              <SelectContent>{BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Reference</Label>
            <Input value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="Bank reference number" />
          </div>

          <div className="space-y-2">
            <Label>Deposit Date</Label>
            <Input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Receipt Image *</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="receipt-upload" />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                {receiptFile ? (
                  <div className="text-green-600"><CheckCircle className="h-8 w-8 mx-auto mb-2" />{receiptFile.name}</div>
                ) : (
                  <div className="text-gray-500"><Upload className="h-8 w-8 mx-auto mb-2" />Click to upload receipt image</div>
                )}
              </label>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Submit for Verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
