import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { BillLineItem } from '@/types/billing';
import { DEFAULT_LINE_ITEMS } from '@/types/billing';

interface Props {
  lineItems: BillLineItem[];
  onChange: (items: BillLineItem[]) => void;
}

export function BillLineItemsEditor({ lineItems, onChange }: Props) {
  const [newItemName, setNewItemName] = useState('');

  const initializeDefaults = () => {
    const items = DEFAULT_LINE_ITEMS.map((item, idx) => ({
      ...item,
      id: `item-${idx}-${Date.now()}`
    }));
    onChange(items);
  };

  const updateItem = (id: string, field: keyof BillLineItem, value: any) => {
    onChange(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(lineItems.filter(item => item.id !== id));
  };

  const addCustomItem = () => {
    if (!newItemName.trim()) return;
    onChange([...lineItems, {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      amount: 0,
      isOptional: true
    }]);
    setNewItemName('');
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Bill Line Items</Label>
        {lineItems.length === 0 && (
          <Button size="sm" variant="outline" onClick={initializeDefaults}>
            Load Default Items
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {lineItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Checkbox
              checked={!item.isOptional || item.amount > 0}
              onCheckedChange={(checked) => updateItem(item.id, 'amount', checked ? item.amount || 0 : 0)}
            />
            <span className="flex-1 text-sm">{item.name}</span>
            <Input
              type="number"
              value={item.amount || ''}
              onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
              className="w-28 h-8"
              placeholder="0.00"
            />
            <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="h-8 w-8">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add custom item..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
        />
        <Button onClick={addCustomItem} size="icon"><Plus className="h-4 w-4" /></Button>
      </div>

      <div className="text-right font-semibold text-lg border-t pt-2">
        Subtotal: GH₵{subtotal.toFixed(2)}
      </div>
    </div>
  );
}
