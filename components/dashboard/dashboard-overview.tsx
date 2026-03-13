'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/contexts/app-context';
import { getTotalBalance } from '@/lib/services/account-service';
import { getMonthlySummary } from '@/lib/services/transaction-service';
import { formatCurrency } from '@/lib/utils/currency';
import { ExpensesByCategoryChart } from './charts/expenses-by-category-chart';
import { MonthlyComparisonChart } from './charts/monthly-comparison-chart';
import { BusinessVsPersonalChart } from './charts/business-vs-personal-chart';
import { DashboardSkeleton } from '@/components/ui/skeleton-cards';

export function DashboardOverview() {
  const { currency, isBusinessModuleActive } = useApp();
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const balance = await getTotalBalance();
      setTotalBalance(balance);

      const now = new Date();
      const summary = await getMonthlySummary(now.getMonth(), now.getFullYear());
      setMonthlyData(summary);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyData?.despesas || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyData?.receitas || 0, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de receitas
            </p>
          </CardContent>
        </Card>

        {isBusinessModuleActive && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Empresarial</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (monthlyData?.lucroEmpresarial || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(monthlyData?.lucroEmpresarial || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receita - Despesas
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByCategoryChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyComparisonChart />
          </CardContent>
        </Card>
      </div>

      {isBusinessModuleActive && (
        <Card>
          <CardHeader>
            <CardTitle>Pessoal vs Empresarial</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessVsPersonalChart />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
