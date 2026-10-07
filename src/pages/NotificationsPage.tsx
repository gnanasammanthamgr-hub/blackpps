import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Loading';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/lib/services';
import { formatRelative } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: '#3b82f6', bg: '#dbeafe' },
  reminder: { icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  warning: { icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
  success: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading notifications..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount} unread · {notifications.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Unread {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">{unreadCount}</span>}
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Bell size={28} />} title="No notifications" description={filter === 'unread' ? "You're all caught up!" : "Notifications will appear here"} />
        </CardBody></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type];
            return (
              <Card key={n.id} hover={false}>
                <CardBody className={`!p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4' : ''}`} >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? 'border-l-blue-500' : ''}`}
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <cfg.icon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${n.is_read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>{n.title}</h4>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatRelative(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Mark as read">
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
