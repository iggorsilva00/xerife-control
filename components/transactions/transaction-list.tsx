'use client';

import { useState } from 'react';
import { Edit2, Trash2, Copy, Check, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { deleteTransaction, duplicateTransaction, updateTransaction } from '@/lib/services/transaction-service';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { getCategories } from '@/lib/services/category-service';
import { EmptyState } from '@/components/ui/skeleton-cards';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionList({ transactions, onEdit, onRefresh }: TransactionListProps) {
  const { currency } = useApp();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useState(() => {
    loadCategories();
  });

  async function loadCategories() {
    const cats = await getCategories();
    setCategories(cats);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    
    try {
      setDeleting(id);
      await deleteTransaction(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateTransaction(id);
      onRefresh();
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  }

  async function toggleStatus(transaction: Transaction) {
    try {
      await updateTransaction(transaction.id, {
        status: transaction.status === 'pago' ? 'pendente' : 'pago'
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  function getCategoryName(categoryId: string) {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Desconhecido';
  }

  function getCategoryColor(categoryId: string) {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || '#999999';
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="w-8 h-8" />}
        title="Nenhum lançamento encontrado"
        description="Adicione receitas e despesas para começar a controlar suas finanças."
      />
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(transaction.category) }}
                />
                <h3 className="font-semibold">{transaction.description}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  {getCategoryName(transaction.category)}
                </span>
                {transaction.classification === 'empresarial' && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    Empresarial
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{formatDate(transaction.date)}</span>
                <span className="capitalize">{transaction.paymentMethod}</span>
                {transaction.recurrent === 'mensal' && <span>🔄 Recorrente</span>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value, currency)}
                </div>
                <button
                  onClick={() => toggleStatus(transaction)}
                  className={`text-xs px-2 py-1 rounded ${
                    transaction.status === 'pago'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  {transaction.status === 'pago' ? <Check className="w-3 h-3 inline" /> : <X className="w-3 h-3 inline" />}
                  {' '}{transaction.status === 'pago' ? 'Pago' : 'Pendente'}
                </button>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(transaction)}
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDuplicate(transaction.id)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deleting === transaction.id}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
