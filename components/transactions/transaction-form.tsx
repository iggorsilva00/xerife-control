'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Transaction, TransactionType, PaymentMethod, Classification } from '@/lib/types';
import { createTransaction, updateTransaction, findDuplicates } from '@/lib/services/transaction-service';
import { getCategories } from '@/lib/services/category-service';
import { getAccounts } from '@/lib/services/account-service';
import { getCards } from '@/lib/services/card-service';
import { suggestCategory } from '@/lib/services/category-service';
import { useApp } from '@/lib/contexts/app-context';

interface TransactionFormProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const { isBusinessModuleActive } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  
  const [formData, setFormData] = useState({
    type: (transaction?.type || 'despesa') as TransactionType,
    value: transaction?.value?.toString() || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: transaction?.description || '',
    category: transaction?.category || '',
    paymentMethod: (transaction?.paymentMethod || 'dinheiro') as PaymentMethod,
    classification: (transaction?.classification || 'pessoal') as Classification,
    status: transaction?.status || 'pago',
    recurrent: transaction?.recurrent || 'nao',
    accountId: transaction?.accountId || '',
    cardId: transaction?.cardId || '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    const [cats, accs, crds] = await Promise.all([
      getCategories(),
      getAccounts(),
      getCards()
    ]);
    setCategories(cats);
    setAccounts(accs);
    setCards(crds);
  }

  async function handleDescriptionChange(desc: string) {
    setFormData({ ...formData, description: desc });
    
    if (desc.length > 3 && !formData.category) {
      const suggested = await suggestCategory(desc);
      if (suggested) {
        setFormData(prev => ({ ...prev, category: suggested }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value <= 0) {
        setError('Valor inválido');
        setLoading(false);
        return;
      }

      const transactionData = {
        type: formData.type,
        value,
        date: new Date(formData.date),
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        classification: formData.classification,
        status: formData.status as any,
        recurrent: formData.recurrent as any,
        accountId: formData.accountId || undefined,
        cardId: formData.cardId || undefined,
      };

      if (!transaction && !duplicateWarning) {
        const duplicates = await findDuplicates(transactionData);
        if (duplicates.length > 0) {
          setDuplicateWarning(true);
          setLoading(false);
          return;
        }
      }

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await createTransaction(transactionData);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar lançamento');
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter(c => 
    c.type === 'ambos' || 
    c.type === formData.classification
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {duplicateWarning && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Possível duplicata</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Já existe um lançamento similar. Deseja continuar?
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Classificação</Label>
              <Select value={formData.classification} onValueChange={(v: any) => setFormData({ ...formData, classification: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                  {isBusinessModuleActive && (
                    <SelectItem value="empresarial">Empresarial</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Ex: Compra no supermercado"
              required
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={formData.paymentMethod} onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.paymentMethod === 'credito' && (
            <div>
              <Label>Cartão</Label>
              <Select value={formData.cardId} onValueChange={(v) => setFormData({ ...formData, cardId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.paymentMethod !== 'credito' && (
            <div>
              <Label>Conta</Label>
              <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Recorrência</Label>
            <Select value={formData.recurrent} onValueChange={(v: any) => setFormData({ ...formData, recurrent: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não recorrente</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar Lançamento'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
