import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Percent, DollarSign, X, Plus } from 'lucide-react';
import type { StudentDiscount } from '@/types/billing';
import { DEFAULT_DISCOUNT_TYPES } from '@/types/billing';

interface Props {
  discounts: StudentDiscount[];
  onChange: (discounts: StudentDiscount[]) => void;
  subtotal: number;
}

export function DiscountManager({ discounts, onChange, subtotal }: Props) {
  const [discountType, setDiscountType] = useState('');
  const [customName, setCustomName] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(true);

  const addDiscount = () => {
    const name = discountType === 'custom' ? customName : discountType;
    if (!name || !discountValue) return;

    const value = parseFloat(discountValue);
    const newDiscount: StudentDiscount = {
      id: `disc-${Date.now()}`,
      student_id: '',
      discount_type_id: '',
      discount_name: name,
      discount_value: isPercentage ? (subtotal * value / 100) : value,
      is_percentage: isPercentage,
      reason: `${value}${isPercentage ? '%' : ' GH₵'} ${name}`
    };

    onChange([...discounts, newDiscount]);
    setDiscountType('');
    setCustomName('');
    setDiscountValue('');
  };

  const removeDiscount = (id: string) => {
    onChange(discounts.filter(d => d.id !== id));
  };

  const totalDiscount = discounts.reduce((sum, d) => sum + d.discount_value, 0);

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Discounts</Label>

      {discounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {discounts.map((discount) => (
            <Badge key={discount.id} variant="secondary" className="flex items-center gap-1 py-1">
              {discount.discount_name}: -GH₵{discount.discount_value.toFixed(2)}
              <button onClick={() => removeDiscount(discount.id)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select value={discountType} onValueChange={setDiscountType}>
          <SelectTrigger>
            <SelectValue placeholder="Discount type" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_DISCOUNT_TYPES.map((dt) => (
              <SelectItem key={dt.name} value={dt.name}>{dt.name}</SelectItem>
            ))}
            <SelectItem value="custom">Custom Discount</SelectItem>
          </SelectContent>
        </Select>

        {discountType === 'custom' && (
          <Input
            placeholder="Discount name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        )}

        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="Value"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="flex-1"
          />
          <Button
            size="icon"
            variant={isPercentage ? 'default' : 'outline'}
            onClick={() => setIsPercentage(true)}
            title="Percentage"
          >
            <Percent className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={!isPercentage ? 'default' : 'outline'}
            onClick={() => setIsPercentage(false)}
            title="Fixed Amount"
          >
            <DollarSign className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={addDiscount} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {totalDiscount > 0 && (
        <div className="text-right text-green-600 font-semibold">
          Total Discount: -GH₵{totalDiscount.toFixed(2)}
        </div>
      )}
    </div>
  );
}
