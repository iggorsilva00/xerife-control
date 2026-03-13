'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getTransactions } from '@/lib/services/transaction-service';
import { getCategories } from '@/lib/services/category-service';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';

export function ExpensesByCategoryChart() {
  const { currency } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  async function loadChartData() {
    try {
      const transactions = await getTransactions();
      const categories = await getCategories();

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter transactions for current month and expenses only
      const monthlyExpenses = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === 'despesa' &&
          t.status === 'pago' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      });

      // Group by category
      const categoryMap = new Map<string, number>();
      monthlyExpenses.forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.value);
      });

      // Transform to chart data
      const chartData = Array.from(categoryMap.entries())
        .map(([categoryId, value]) => {
          const category = categories.find((c) => c.id === categoryId);
          return {
            name: category?.name || 'Desconhecido',
            value,
            color: category?.color || '#999999',
          };
        })
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Carregando...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Nenhuma despesa registrada este mês
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              const percent = ((entry.value / total) * 100).toFixed(1);
              return `${percent}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => formatCurrency(value, currency)}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
