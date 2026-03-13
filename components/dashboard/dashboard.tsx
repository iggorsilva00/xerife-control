'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, Settings, CreditCard, Home, Target } from 'lucide-react';
import { DashboardOverview } from './dashboard-overview';
import { TransactionsModule } from '../transactions/transactions-module';
import { AccountsModule } from '../accounts/accounts-module';
import { SettingsModule } from '../settings/settings-module';
import { GoalsModule } from '../goals/goals-module';
import { NotificationsPanel } from '../notifications/notifications-panel';
import { PwaInstallBanner } from '../pwa/pwa-install-banner';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'transactions' | 'accounts' | 'goals' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'transactions' as Tab, label: 'Lançamentos', icon: TrendingUp },
    { id: 'accounts' as Tab, label: 'Contas', icon: CreditCard },
    { id: 'goals' as Tab, label: 'Metas', icon: Target },
    { id: 'settings' as Tab, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Xerife Control
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Controle Financeiro
                </p>
              </div>
            </div>

            {/* Notifications bell */}
            <NotificationsPanel />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'transactions' && <TransactionsModule />}
        {activeTab === 'accounts' && <AccountsModule />}
        {activeTab === 'goals' && <GoalsModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
}
