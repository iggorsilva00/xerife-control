'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getMonthlySummary } from '@/lib/services/transaction-service';
import { getMonthShortName } from '@/lib/utils/date';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';

export function MonthlyComparisonChart() {
  const { currency } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  async function loadChartData() {
    try {
      const now = new Date();
      const chartData = [];

      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();

        const summary = await getMonthlySummary(month, year);

        chartData.push({
          month: getMonthShortName(month),
          receitas: summary.receitas,
          despesas: summary.despesas,
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
          <Bar dataKey="receitas" name="Receitas" fill="#00B894" />
          <Bar dataKey="despesas" name="Despesas" fill="#FF6B6B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
