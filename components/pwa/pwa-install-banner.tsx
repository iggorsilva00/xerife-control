'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS (Safari não dispara beforeinstallprompt)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const safari = /safari/.test(navigator.userAgent.toLowerCase());
    const isIosSafari = ios && safari && !('standalone' in navigator && (navigator as any).standalone);
    setIsIos(isIosSafari);

    // Verifica se o usuário já dispensou o banner
    const dismissed = localStorage.getItem('xerife-pwa-dismissed');
    if (dismissed) return;

    if (isIosSafari) {
      // No iOS, mostra instruções manuais após 3s
      setTimeout(() => setIsVisible(true), 3000);
      return;
    }

    // Android/Chrome: captura o evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setIsVisible(false);
    setInstallPrompt(null);
  }

  function handleDismiss() {
    setIsVisible(false);
    localStorage.setItem('xerife-pwa-dismissed', '1');
  }

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">XC</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Instalar Xerife Control
            </p>

            {isIos ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Toque em <strong>Compartilhar</strong> <span className="text-blue-600">⬆</span> e depois em{' '}
                <strong>"Adicionar à Tela de Início"</strong> para instalar.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Instale no celular para acessar offline, sem precisar do navegador.
              </p>
            )}

            {!isIos && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="gap-1.5 text-xs h-8"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs h-8 text-gray-500"
                >
                  Agora não
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
