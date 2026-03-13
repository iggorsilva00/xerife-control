'use client';

import { Wallet, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">Bem-vindo ao Xerife Control</CardTitle>
          <CardDescription className="text-base">
            Seu controle financeiro pessoal e empresarial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Importante: Armazenamento 100% Local
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Todos os seus dados são armazenados localmente no seu dispositivo.
              Eles não sincronizam entre diferentes dispositivos ou navegadores.
              <strong className="block mt-2">
                Você é responsável por fazer backups regulares dos seus dados!
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🔒 Privacidade Total</h4>
              <p className="text-sm text-muted-foreground">
                Seus dados nunca saem do seu dispositivo
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">📊 Controle Completo</h4>
              <p className="text-sm text-muted-foreground">
                Gerencie finanças pessoais e empresariais
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">💳 Múltiplas Contas</h4>
              <p className="text-sm text-muted-foreground">
                Gerencie contas, cartões e transferências
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">📄 Exportação Fácil</h4>
              <p className="text-sm text-muted-foreground">
                Exporte seus dados em Excel e CSV
              </p>
            </div>
          </div>

          <Button onClick={onNext} className="w-full" size="lg">
            Começar Configuração
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
