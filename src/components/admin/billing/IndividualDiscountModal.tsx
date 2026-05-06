import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Percent, DollarSign, X, User, Tag } from 'lucide-react';
import type { StudentDiscount } from '@/types/billing';
import { DEFAULT_DISCOUNT_TYPES } from '@/types/billing';

interface StudentInfo {
  id: string;
  name: string;
  class_name?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: StudentInfo[];
  onApplyDiscounts: (studentDiscounts: Map<string, StudentDiscount[]>) => void;
  subtotal: number;
}

export function IndividualDiscountModal({ isOpen, onClose, students, onApplyDiscounts, subtotal }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [discountType, setDiscountType] = useState('');
  const [customName, setCustomName] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(true);
  const [studentDiscounts, setStudentDiscounts] = useState<Map<string, StudentDiscount[]>>(new Map());

  const addDiscount = () => {
    if (!selectedStudent || !discountValue) return;
    const name = discountType === 'custom' ? customName : discountType;
    if (!name) return;

    const value = parseFloat(discountValue);
    const discount: StudentDiscount = {
      id: `disc-${Date.now()}`,
      student_id: selectedStudent,
      discount_type_id: '',
      discount_name: name,
      discount_value: isPercentage ? (subtotal * value / 100) : value,
      is_percentage: isPercentage,
      reason: `${value}${isPercentage ? '%' : ' GH₵'} ${name}`
    };

    const updated = new Map(studentDiscounts);
    const existing = updated.get(selectedStudent) || [];
    updated.set(selectedStudent, [...existing, discount]);
    setStudentDiscounts(updated);
    setDiscountValue('');
  };

  const removeDiscount = (studentId: string, discountId: string) => {
    const updated = new Map(studentDiscounts);
    const existing = updated.get(studentId) || [];
    updated.set(studentId, existing.filter(d => d.id !== discountId));
    if (updated.get(studentId)?.length === 0) updated.delete(studentId);
    setStudentDiscounts(updated);
  };

  const handleApply = () => {
    onApplyDiscounts(studentDiscounts);
    onClose();
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Individual Student Discounts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.class_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {DEFAULT_DISCOUNT_TYPES.map(dt => (
                    <SelectItem key={dt.name} value={dt.name}>{dt.name}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {discountType === 'custom' && (
            <Input placeholder="Custom discount name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          )}
          <div className="flex gap-2">
            <Input type="number" placeholder="Value" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="flex-1" />
            <Button size="icon" variant={isPercentage ? 'default' : 'outline'} onClick={() => setIsPercentage(true)}><Percent className="h-4 w-4" /></Button>
            <Button size="icon" variant={!isPercentage ? 'default' : 'outline'} onClick={() => setIsPercentage(false)}><DollarSign className="h-4 w-4" /></Button>
            <Button onClick={addDiscount}>Add</Button>
          </div>

          {studentDiscounts.size > 0 && (
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {Array.from(studentDiscounts.entries()).map(([studentId, discounts]) => (
                <div key={studentId} className="space-y-1">
                  <div className="flex items-center gap-1 text-sm font-medium"><User className="h-3 w-3" /> {getStudentName(studentId)}</div>
                  <div className="flex flex-wrap gap-1 pl-4">
                    {discounts.map(d => (
                      <Badge key={d.id} variant="secondary" className="text-xs">
                        {d.discount_name}: -GH₵{d.discount_value.toFixed(2)}
                        <button onClick={() => removeDiscount(studentId, d.id)} className="ml-1"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleApply} disabled={studentDiscounts.size === 0}>Apply to {studentDiscounts.size} Students</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
