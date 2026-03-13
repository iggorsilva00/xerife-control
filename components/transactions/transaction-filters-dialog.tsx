'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TransactionFilters } from '@/lib/services/transaction-service';
import { getCategories } from '@/lib/services/category-service';

interface TransactionFiltersDialogProps {
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
}

export function TransactionFiltersDialog({ filters, onApply, onClose }: TransactionFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const cats = await getCategories();
    setCategories(cats);
  }

  function handleApply() {
    onApply(localFilters);
  }

  function handleClear() {
    setLocalFilters({});
    onApply({});
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Filtros Avançados</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={localFilters.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  startDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={localFilters.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  endDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div>
            <Label>Categoria</Label>
            <Select
              value={localFilters.category || 'all'}
              onValueChange={(v) => setLocalFilters({
                ...localFilters,
                category: v === 'all' ? undefined : v
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(v: any) => setLocalFilters({
                ...localFilters,
                status: v === 'all' ? undefined : v
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Forma de Pagamento</Label>
            <Select
              value={localFilters.paymentMethod || 'all'}
              onValueChange={(v: any) => setLocalFilters({
                ...localFilters,
                paymentMethod: v === 'all' ? undefined : v
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor Mínimo</Label>
              <Input
                type="number"
                step="0.01"
                value={localFilters.minValue?.toString() || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  minValue: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label>Valor Máximo</Label>
              <Input
                type="number"
                step="0.01"
                value={localFilters.maxValue?.toString() || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  maxValue: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Limpar
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
