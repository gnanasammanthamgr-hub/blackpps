import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Clock, CheckCircle, AlertTriangle, Bell,
  ArrowRight, TrendingUp, Calendar as CalIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InlineLoader } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { DonutChart, BarChart, ProgressBar } from '@/components/ui/Charts';
import { MessageCard } from '@/components/MessageCard';
import { fetchDashboardStats, fetchMessages, fetchReminders } from '@/lib/services';
import { PLATFORMS, getPlatformMeta, getPriorityMeta } from '@/lib/constants';
import { formatRelative } from '@/lib/utils';
import type { DashboardStats, Message, Reminder } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [statsResult, messagesResult, remindersResult] = await Promise.allSettled([
          fetchDashboardStats(),
          fetchMessages(),
          fetchReminders(),
        ]);

        if (cancelled) return;

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value);
        } else {
          console.error('Dashboard stats failed:', statsResult.reason);
          // Never leave the dashboard in an endless loading state.
          setStats({
            total: 0,
            pending: 0,
            completed: 0,
            postponed: 0,
            urgent: 0,
            todayReminders: 0,
            platformBreakdown: { whatsapp: 0, telegram: 0, instagram: 0, email: 0, wechat: 0, other: 0 },
            priorityBreakdown: { low: 0, medium: 0, high: 0, urgent: 0 },
            categoryBreakdown: {},
            weeklyTrend: Array.from({ length: 7 }, (_, index) => {
              const day = new Date();
              day.setDate(day.getDate() - (6 - index));
              return {
                date: day.toLocaleDateString('en-US', { weekday: 'short' }),
                count: 0,
                completed: 0,
              };
            }),
          });
          setLoadError('Some dashboard data could not be loaded. Check Supabase tables/RLS settings.');
        }

        if (messagesResult.status === 'fulfilled') {
          setMessages(messagesResult.value.slice(0, 5));
        } else {
          console.error('Recent messages failed:', messagesResult.reason);
          setLoadError((current) => current ?? 'Some dashboard data could not be loaded. Check Supabase tables/RLS settings.');
        }

        if (remindersResult.status === 'fulfilled') {
          setReminders(remindersResult.value.filter((rm) => rm.status === 'pending').slice(0, 4));
        } else {
          console.error('Dashboard reminders failed:', remindersResult.reason);
          setLoadError((current) => current ?? 'Some dashboard data could not be loaded. Check Supabase tables/RLS settings.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading your dashboard..." /></DashboardLayout>;
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Dashboard data could not be loaded. Please refresh the page or check Supabase configuration.
        </div>
      </DashboardLayout>
    );
  }

  const platformData = PLATFORMS.map((p) => ({
    label: p.label,
    value: stats.platformBreakdown[p.value] ?? 0,
    color: p.color,
  })).filter((p) => p.value > 0);

  const priorityData = [
    { label: 'Urgent', value: stats.priorityBreakdown.urgent, color: '#ef4444' },
    { label: 'High', value: stats.priorityBreakdown.high, color: '#f59e0b' },
    { label: 'Medium', value: stats.priorityBreakdown.medium, color: '#3b82f6' },
    { label: 'Low', value: stats.priorityBreakdown.low, color: '#6b7280' },
  ].filter((p) => p.value > 0);

  const statCards = [
    { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending Replies', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
    { label: 'Urgent', value: stats.urgent, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
  ];

  return (
    <DashboardLayout>
      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {' · '}{stats.todayReminders} reminders today
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} hover>
            <CardBody className="!p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Weekly trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Message Trends</CardTitle>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
          </CardHeader>
          <CardBody>
            <BarChart data={stats.weeklyTrend.map((d) => ({ label: d.date, value: d.count, secondary: d.completed }))} height={200} />
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-blue-500" /> Total messages
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-purple-400" /> Completed
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Platform breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Platform</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col items-center">
            <DonutChart data={platformData} />
            <div className="w-full mt-4 space-y-2">
              {platformData.slice(0, 5).map((p) => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.label}</span>
                  </span>
                  <span className="font-medium text-gray-900">{p.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Priority + Reminders */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <ProgressBar data={priorityData} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {priorityData.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.label}</span>
                  </span>
                  <span className="font-medium text-gray-900">{p.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Reminders</CardTitle>
              <Link to="/reminders" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardBody className="!p-3">
            {reminders.length === 0 ? (
              <EmptyState title="No reminders" description="You're all caught up!" />
            ) : (
              <div className="space-y-2">
                {reminders.map((r) => {
                  const meta = getPriorityMeta(r.priority);
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                        <Bell size={16} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                        <p className="text-xs text-gray-500">{formatRelative(r.due_date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Link to="/messages" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="!p-3">
          {messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Add your first message to start tracking"
              action={<Link to="/messages/new"><Button size="sm">Add Message</Button></Link>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {messages.map((m) => (
                <Link key={m.id} to={`/messages/${m.id}`}>
                  <MessageCard message={m} />
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
