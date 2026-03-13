'use client';

import { useState } from 'react';
import { Home, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ModulesStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ModulesStep({ data, updateData, onNext, onBack }: ModulesStepProps) {
  const [enableBusiness, setEnableBusiness] = useState(data.enableBusiness ?? false);

  function handleNext() {
    updateData({ enableBusiness });
    onNext();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Módulos de Controle</CardTitle>
          <CardDescription>
            Escolha quais módulos deseja utilizar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Módulo Pessoal</h3>
                <p className="text-sm text-muted-foreground">
                  Controle de finanças pessoais, contas e gastos do dia a dia
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ Sempre ativo
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">Módulo Empresarial</h3>
                  <Switch
                    checked={enableBusiness}
                    onCheckedChange={setEnableBusiness}
                    id="business-module"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Controle separado para receitas e despesas empresariais, cálculo de lucro real
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
            💡 Você pode ativar ou desativar o módulo empresarial a qualquer momento nas configurações
          </div>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ChevronLeft className="mr-2 w-4 h-4" />
              Voltar
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Próximo
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
