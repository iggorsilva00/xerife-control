'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createUserProfile } from '@/lib/services/user-service';
import { setPIN, updateSettings } from '@/lib/services/auth-service';
import { initializeDefaultCategories } from '@/lib/services/category-service';
import { useAuth } from '@/lib/contexts/auth-context';

interface CompletionStepProps {
  data: {
    name: string;
    currency: 'BRL' | 'USD' | 'EUR';
    enableBusiness: boolean;
    pin: string;
  };
}

export function CompletionStep({ data }: CompletionStepProps) {
  const [status, setStatus] = useState<'processing' | 'complete' | 'error'>('processing');
  const [error, setError] = useState('');
  const { checkAuthStatus, login } = useAuth();

  useEffect(() => {
    completeOnboarding();
  }, []);

  async function completeOnboarding() {
    try {
      // Create user profile
      await createUserProfile(data.name, data.currency, data.enableBusiness);

      // Set PIN
      await setPIN(data.pin);

      // Initialize default categories
      await initializeDefaultCategories();

      // Mark onboarding as completed
      await updateSettings({ onboardingCompleted: true });

      setStatus('complete');

      // Auto-login after 2 seconds
      setTimeout(async () => {
        await login(data.pin);
        await checkAuthStatus();
      }, 2000);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Erro ao completar configuração');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'processing' && (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle>Configurando seu Xerife Control...</CardTitle>
              <CardDescription>Aguarde um momento</CardDescription>
            </>
          )}

          {status === 'complete' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Tudo Pronto!</CardTitle>
              <CardDescription>
                Seu Xerife Control foi configurado com sucesso
              </CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <CardTitle className="text-red-600">Erro na Configuração</CardTitle>
              <CardDescription>{error}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {status === 'complete' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecionando para o painel...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
