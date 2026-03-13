'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppNotification } from '@/lib/types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  checkAndGenerateNotifications,
} from '@/lib/services/notification-service';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  vencimento: <Clock className="w-4 h-4 text-amber-500" />,
  meta: <Target className="w-4 h-4 text-blue-500" />,
  recorrencia: <RefreshCw className="w-4 h-4 text-purple-500" />,
  saldo_baixo: <Bell className="w-4 h-4 text-red-500" />,
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    // Gera/verifica notificações ao montar
    checkAndGenerateNotifications().then(loadNotifications);

    // Verifica a cada 5 minutos
    const interval = setInterval(() => {
      checkAndGenerateNotifications().then(loadNotifications);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadNotifications() {
    const all = await getNotifications();
    const visible = all.filter((n) => n.status !== 'dispensada').slice(0, 30);
    setNotifications(visible);
    setUnreadCount(all.filter((n) => n.status === 'nao_lida').length);
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    loadNotifications();
  }

  async function handleRead(id: string) {
    await markAsRead(id);
    loadNotifications();
  }

  async function handleDismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await dismissNotification(id);
    loadNotifications();
  }

  const unread = notifications.filter((n) => n.status === 'nao_lida');
  const read = notifications.filter((n) => n.status === 'lida');

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-1">Novas</p>
                    {unread.map((n) => (
                      <NotifItem key={n.id} notif={n} onRead={handleRead} onDismiss={handleDismiss} />
                    ))}
                  </>
                )}
                {read.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-1">Anteriores</p>
                    {read.map((n) => (
                      <NotifItem key={n.id} notif={n} onRead={handleRead} onDismiss={handleDismiss} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NotifItemProps {
  notif: AppNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
}

function NotifItem({ notif, onRead, onDismiss }: NotifItemProps) {
  const isUnread = notif.status === 'nao_lida';
  const timeAgo = formatTimeAgo(new Date(notif.createdAt));

  return (
    <div
      onClick={() => isUnread && onRead(notif.id)}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
        isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {TYPE_ICONS[notif.type] || <Bell className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-tight ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
            {notif.title}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{notif.message}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo}</p>
      </div>

      <button
        onClick={(e) => onDismiss(notif.id, e)}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora mesmo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}
