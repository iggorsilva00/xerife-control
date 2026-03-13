'use client';

import { useState } from 'react';
import { Lock, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SecurityStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SecurityStep({ data, updateData, onNext, onBack }: SecurityStepProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    setError('');

    if (pin.length < 4) {
      setError('O PIN deve ter pelo menos 4 caracteres');
      return;
    }

    if (pin !== confirmPin) {
      setError('Os PINs não coincidem');
      return;
    }

    updateData({ pin });
    onNext();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Proteja seus Dados</CardTitle>
          <CardDescription>
            Crie um PIN ou senha para proteger suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN ou Senha</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Digite seu PIN (mínimo 4 caracteres)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirmar PIN ou Senha</Label>
            <Input
              id="confirm-pin"
              type="password"
              placeholder="Digite novamente"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>⚠️ Importante:</strong> Guarde seu PIN em um local seguro.
              Não há como recuperá-lo se você esquecer!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ChevronLeft className="mr-2 w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={pin.length < 4 || confirmPin.length < 4}
            >
              Próximo
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
