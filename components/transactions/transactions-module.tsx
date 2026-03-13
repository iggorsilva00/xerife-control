'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionForm } from './transaction-form';
import { TransactionList } from './transaction-list';
import { TransactionFiltersDialog } from './transaction-filters-dialog';
import { Transaction } from '@/lib/types';
import { getTransactions, TransactionFilters } from '@/lib/services/transaction-service';
import { TransactionListSkeleton } from '@/components/ui/skeleton-cards';

export function TransactionsModule() {
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const allTransactions = await getTransactions();
      setTransactions(allTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    setEditingTransaction(null);
    setShowForm(true);
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
  }

  function handleFiltersApply(newFilters: TransactionFilters) {
    setFilters(newFilters);
    setShowFilters(false);
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Date filters
    if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;

    // Category filter
    if (filters.category && t.category !== filters.category) return false;

    // Classification filter
    if (filters.classification && t.classification !== filters.classification) return false;

    // Status filter
    if (filters.status && t.status !== filters.status) return false;

    // Payment method filter
    if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false;

    // Value range filters
    if (filters.minValue !== undefined && t.value < filters.minValue) return false;
    if (filters.maxValue !== undefined && t.value > filters.maxValue) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lançamentos</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Transaction List */}
      {loading ? (
        <TransactionListSkeleton />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onRefresh={loadTransactions}
        />
      )}

      {/* Transaction Form Dialog */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
        />
      )}

      {/* Filters Dialog */}
      {showFilters && (
        <TransactionFiltersDialog
          filters={filters}
          onApply={handleFiltersApply}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
