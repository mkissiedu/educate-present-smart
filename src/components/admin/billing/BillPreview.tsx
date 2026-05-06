import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Calendar, Hash } from 'lucide-react';
import type { BillLineItem, StudentDiscount } from '@/types/billing';

interface Props {
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  lineItems: BillLineItem[];
  discounts: StudentDiscount[];
  previousBalance: number;
  billCode?: string;
}

export function BillPreview({
  studentName, className, term, academicYear,
  lineItems, discounts, previousBalance, billCode
}: Props) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDiscount = discounts.reduce((sum, d) => sum + d.discount_value, 0);
  const totalAmount = subtotal - totalDiscount + previousBalance;

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> Bill Preview
          </CardTitle>
          {billCode && (
            <Badge variant="outline" className="font-mono">
              <Hash className="h-3 w-3 mr-1" />{billCode}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2 text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" /> {studentName || 'Student Name'}
          </div>
          <div>{className || 'Class'}</div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {term} - {academicYear}
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <div className="font-semibold text-gray-700">Fee Items:</div>
          {lineItems.filter(i => i.amount > 0).map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>GH₵{item.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-1 border-t">
            <span>Subtotal</span>
            <span>GH₵{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {discounts.length > 0 && (
          <div className="space-y-1">
            <div className="font-semibold text-green-700">Discounts:</div>
            {discounts.map((d) => (
              <div key={d.id} className="flex justify-between text-green-600">
                <span>{d.discount_name}</span>
                <span>-GH₵{d.discount_value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {previousBalance > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Previous Balance</span>
            <span>GH₵{previousBalance.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount Due</span>
          <span className="text-blue-600">GH₵{totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
