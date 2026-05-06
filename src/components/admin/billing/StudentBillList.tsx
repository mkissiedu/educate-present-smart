import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ParentReceiptUpload } from './ParentReceiptUpload';
import { Search, Send, CreditCard, Eye, User, Filter, MessageCircle, Building2 } from 'lucide-react';
import type { StudentBill } from '@/types/billing';

interface Props {
  bills: StudentBill[];
  onSendWhatsApp: (bill: StudentBill) => void;
  onInitiatePayment: (bill: StudentBill) => void;
  onViewBill: (bill: StudentBill) => void;
  onBulkSendWhatsApp?: (bills: StudentBill[]) => void;
  schoolId?: string;
}

export function StudentBillList({ bills, onSendWhatsApp, onInitiatePayment, onViewBill, onBulkSendWhatsApp, schoolId }: Props) {
  const [search, setSearch] = useState('');
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadBill, setUploadBill] = useState<StudentBill | null>(null);

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.bill_code.toLowerCase().includes(search.toLowerCase()) ||
      b.class_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => setSelectedBills(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const selectAll = () => setSelectedBills(filteredBills.map(b => b.id));
  const deselectAll = () => setSelectedBills([]);
  const handleBulkSend = () => {
    const selected = bills.filter(b => selectedBills.includes(b.id));
    if (onBulkSendWhatsApp) onBulkSendWhatsApp(selected);
    else selected.forEach(b => onSendWhatsApp(b));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredBills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalBalance = filteredBills.reduce((sum, b) => sum + b.balance, 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <CardTitle className="text-base">Bills ({filteredBills.length})</CardTitle>
            <div className="flex gap-2 text-sm">
              <Badge variant="outline">Total: GH₵{totalAmount.toFixed(2)}</Badge>
              <Badge variant="outline" className="text-orange-600">Outstanding: GH₵{totalBalance.toFixed(2)}</Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search student, bill code, class..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedBills.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={deselectAll}>Clear ({selectedBills.length})</Button>
              <Button size="sm" onClick={handleBulkSend} className="gap-1 bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4" /> Send {selectedBills.length} via WhatsApp
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-2"><button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Select All</button></div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox checked={selectedBills.includes(bill.id)} onCheckedChange={() => toggleSelect(bill.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{bill.student_name || 'Unknown'}</span>
                    <Badge variant="outline" className="font-mono text-xs">{bill.bill_code}</Badge>
                    {bill.class_name && <Badge variant="secondary" className="text-xs">{bill.class_name}</Badge>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total: GH₵{bill.total_amount.toFixed(2)} | Paid: GH₵{bill.amount_paid.toFixed(2)} | <span className={bill.balance > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>Balance: GH₵{bill.balance.toFixed(2)}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onViewBill(bill)} title="View"><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onSendWhatsApp(bill)} title="WhatsApp" disabled={bill.sent_via_whatsapp}>
                    <Send className={`h-4 w-4 ${bill.sent_via_whatsapp ? 'text-gray-400' : 'text-green-600'}`} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onInitiatePayment(bill)} title="Payment" disabled={bill.status === 'paid'}>
                    <CreditCard className={`h-4 w-4 ${bill.status === 'paid' ? 'text-gray-400' : 'text-blue-600'}`} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setUploadBill(bill)} title="Bank Receipt" disabled={bill.status === 'paid'}>
                    <Building2 className={`h-4 w-4 ${bill.status === 'paid' ? 'text-gray-400' : 'text-amber-600'}`} />
                  </Button>
                </div>
              </div>
            ))}
            {filteredBills.length === 0 && <div className="text-center py-8 text-gray-500">No bills found</div>}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!uploadBill} onOpenChange={() => setUploadBill(null)}>
        <DialogContent><DialogHeader><DialogTitle>Upload Bank Receipt</DialogTitle></DialogHeader>
          {uploadBill && schoolId && <ParentReceiptUpload schoolId={schoolId} studentId={uploadBill.student_id} studentName={uploadBill.student_name} billCode={uploadBill.bill_code} billId={uploadBill.id} onSuccess={() => setUploadBill(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
