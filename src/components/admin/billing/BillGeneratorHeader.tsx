import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Calendar } from 'lucide-react';

interface Props {
  term: string;
  academicYear: string;
  dueDate: string;
  onTermChange: (term: string) => void;
  onYearChange: (year: string) => void;
  onDueDateChange: (date: string) => void;
}

export function BillGeneratorHeader({ term, academicYear, dueDate, onTermChange, onYearChange, onDueDateChange }: Props) {
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const years = ['2023/2024', '2024/2025', '2025/2026'];

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          School Fee Bill Generator
        </CardTitle>
        <p className="text-blue-100 text-sm mt-1">Generate bills, send via WhatsApp, and verify bank payments</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-blue-100">Academic Term</Label>
            <Select value={term} onValueChange={onTermChange}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-blue-100">Academic Year</Label>
            <Select value={academicYear} onValueChange={onYearChange}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-blue-100 flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Due Date
            </Label>
            <Input type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} className="bg-white/20 border-white/30 text-white" />
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm">
          <p className="font-medium">Bank Payment WhatsApp Number:</p>
          <p className="text-blue-100">Parents can send bank deposit receipts to the school's dedicated WhatsApp number for verification</p>
        </div>
      </CardContent>
    </Card>
  );
}

