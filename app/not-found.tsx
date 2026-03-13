'use client';

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 p-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl font-bold text-blue-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Página não encontrada</h1>
        <p className="text-gray-500 dark:text-gray-400">Esta página não existe.</p>
        <Button onClick={() => router.push('/')} className="gap-2">
          <Home className="w-4 h-4" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
