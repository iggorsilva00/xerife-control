'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getTransactions } from '@/lib/services/transaction-service';
import { getMonthShortName } from '@/lib/utils/date';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';

export function BusinessVsPersonalChart() {
  const { currency } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  async function loadChartData() {
    try {
      const transactions = await getTransactions();
      const now = new Date();
      const chartData = [];

      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthlyTransactions = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return (
            t.type === 'despesa' &&
            t.status === 'pago' &&
            tDate.getMonth() === month &&
            tDate.getFullYear() === year
          );
        });

        const pessoal = monthlyTransactions
          .filter((t) => t.classification === 'pessoal')
          .reduce((sum, t) => sum + t.value, 0);

        const empresarial = monthlyTransactions
          .filter((t) => t.classification === 'empresarial')
          .reduce((sum, t) => sum + t.value, 0);

        chartData.push({
          month: getMonthShortName(month),
          pessoal,
          empresarial,
        });
      }

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

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(value, currency)}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="pessoal" name="Pessoal" fill="#4ECDC4" stackId="a" />
          <Bar dataKey="empresarial" name="Empresarial" fill="#6C5CE7" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
