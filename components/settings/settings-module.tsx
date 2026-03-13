'use client';

import { useState } from 'react';
import { Moon, Sun, DollarSign, Briefcase, Download, Upload, Database, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/lib/contexts/app-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { exportDatabase, importDatabase } from '@/lib/db';
import { exportToExcel } from '@/lib/services/export-service';
import { generateMonthlyPDF } from '@/lib/services/pdf-service';
import { Currency } from '@/lib/types';

export function SettingsModule() {
  const { currency, theme, isBusinessModuleActive, updateCurrency, toggleTheme, toggleBusinessModule, user } = useApp();
  const { logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const now = new Date();
  const [pdfMonth, setPdfMonth] = useState(now.getMonth());
  const [pdfYear, setPdfYear] = useState(now.getFullYear());

  async function handleExportData() {
    try {
      setExporting(true);
      await exportToExcel();
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao exportar dados');
    } finally {
      setExporting(false);
    }
  }

  async function handleGeneratePDF() {
    try {
      setGeneratingPdf(true);
      await generateMonthlyPDF(pdfMonth, pdfYear);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Erro ao gerar relatório PDF');
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleBackup() {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xerife-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup error:', error);
      alert('Erro ao fazer backup');
    }
  }

  async function handleRestore() {
    if (!confirm('Tem certeza? Isso irá substituir todos os dados atuais!')) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target?.files?.[0];
        if (!file) return;
        
        const text = await file.text();
        await importDatabase(text);
        alert('Backup restaurado com sucesso! A página será recarregada.');
        window.location.reload();
      } catch (error) {
        console.error('Restore error:', error);
        alert('Erro ao restaurar backup');
      }
    };
    input.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{user?.name}</p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <div>
                <Label>Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Moeda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5" />
            <Label>Moeda Padrão</Label>
          </div>
          <Select value={currency} onValueChange={(v) => updateCurrency(v as Currency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
              <SelectItem value="USD">Dólar Americano ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5" />
              <div>
                <Label>Módulo Empresarial</Label>
                <p className="text-sm text-muted-foreground">
                  Controle separado de finanças empresariais
                </p>
              </div>
            </div>
            <Switch
              checked={isBusinessModuleActive}
              onCheckedChange={toggleBusinessModule}
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <CardTitle>Backup e Exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Importante:</strong> Seus dados são armazenados localmente.
              Faça backups regulares para não perder suas informações!
            </p>
          </div>

          <Button onClick={handleExportData} disabled={exporting} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar Dados (Excel + CSV)'}
          </Button>

          {/* PDF Report */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Relatório PDF Mensal
            </p>
            <div className="flex gap-2">
              <Select value={String(pdfMonth)} onValueChange={(v) => setPdfMonth(Number(v))}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
                    <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(pdfYear)} onValueChange={(v) => setPdfYear(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[now.getFullYear() - 1, now.getFullYear()].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGeneratePDF} disabled={generatingPdf} variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              {generatingPdf ? 'Gerando...' : 'Gerar Relatório PDF'}
            </Button>
          </div>

          <Button onClick={handleBackup} variant="outline" className="w-full">
            <Database className="w-4 h-4 mr-2" />
            Fazer Backup
          </Button>

          <Button onClick={handleRestore} variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Restaurar Backup
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={logout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Bloquear Aplicativo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
