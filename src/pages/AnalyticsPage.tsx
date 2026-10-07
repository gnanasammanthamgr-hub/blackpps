import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/Loading';
import { DonutChart, BarChart, ProgressBar } from '@/components/ui/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchDashboardStats, fetchMessages, fetchReminders } from '@/lib/services';
import { PLATFORMS, PRIORITIES } from '@/lib/constants';
import type { DashboardStats, Message, Reminder } from '@/types';

export function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.allSettled([fetchDashboardStats(), fetchMessages(), fetchReminders()]);
        const [statsResult, messagesResult, remindersResult] = results;

        if (statsResult.status === 'fulfilled') setStats(statsResult.value);
        else setError(statsResult.reason instanceof Error ? statsResult.reason.message : 'Unable to load analytics data');

        if (messagesResult.status === 'fulfilled') setMessages(messagesResult.value);
        if (remindersResult.status === 'fulfilled') setReminders(remindersResult.value);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading analytics..." /></DashboardLayout>;
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <Card><CardBody>
          <EmptyState title="Analytics unavailable" description={error || 'Could not load analytics. Check Supabase tables and RLS policies.'} />
        </CardBody></Card>
      </DashboardLayout>
    );
  }

  if (stats.total === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <Card><CardBody>
          <EmptyState title="No data to analyze" description="Add some messages to see your analytics" />
        </CardBody></Card>
      </DashboardLayout>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const responseRate = stats.total > 0 ? Math.round(((stats.completed + stats.postponed) / stats.total) * 100) : 0;

  const platformData = PLATFORMS.map((p) => ({
    label: p.label,
    value: stats.platformBreakdown[p.value] ?? 0,
    color: p.color,
  })).filter((p) => p.value > 0);

  const priorityData = PRIORITIES.map((p) => ({
    label: p.label,
    value: stats.priorityBreakdown[p.value] ?? 0,
    color: p.color,
  })).filter((p) => p.value > 0);

  const categoryEntries = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);

  const reminderStats = {
    total: reminders.length,
    completed: reminders.filter((r) => r.status === 'completed').length,
    pending: reminders.filter((r) => r.status === 'pending').length,
    snoozed: reminders.filter((r) => r.status === 'snoozed').length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Insights into your message tracking activity</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Activity} label="Completion Rate" value={`${completionRate}%`} color="#10b981" bg="#d1fae5" />
        <MetricCard icon={TrendingUp} label="Response Rate" value={`${responseRate}%`} color="#3b82f6" bg="#dbeafe" />
        <MetricCard icon={BarChart3} label="Total Tracked" value={String(stats.total)} color="#8b5cf6" bg="#ede9fe" />
        <MetricCard icon={PieChart} label="Avg / Platform" value={(stats.total / platformData.length || 0).toFixed(1)} color="#f59e0b" bg="#fef3c7" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
          <CardBody>
            <BarChart data={stats.weeklyTrend.map((d) => ({ label: d.date, value: d.count, secondary: d.completed }))} height={200} />
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-blue-500" /> New messages
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded bg-purple-400" /> Completed
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Platform Distribution</CardTitle></CardHeader>
          <CardBody className="flex flex-col items-center">
            <DonutChart data={platformData} size={180} />
            <div className="w-full mt-4 grid grid-cols-2 gap-2">
              {platformData.map((p) => (
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

      {/* Priority + Category */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Priority Breakdown</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Top Categories</CardTitle></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {categoryEntries.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${(count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Reminder stats */}
      <Card>
        <CardHeader><CardTitle>Reminder Statistics</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-4">
            <ReminderStat label="Total" value={reminderStats.total} color="#3b82f6" />
            <ReminderStat label="Pending" value={reminderStats.pending} color="#f59e0b" />
            <ReminderStat label="Completed" value={reminderStats.completed} color="#10b981" />
            <ReminderStat label="Snoozed" value={reminderStats.snoozed} color="#6b7280" />
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

function MetricCard({ icon: Icon, label, value, color, bg }: { icon: typeof TrendingUp; label: string; value: string; color: string; bg: string }) {
  return (
    <Card>
      <CardBody className="!p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
            <Icon size={20} style={{ color }} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ReminderStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
