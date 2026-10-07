import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InlineLoader } from '@/components/ui/Loading';
import { PlatformIcon } from '@/components/MessageCard';
import { fetchMessages, fetchReminders } from '@/lib/services';
import { getPriorityMeta } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Message, Reminder } from '@/types';

export function CalendarPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const [m, r] = await Promise.all([fetchMessages(), fetchReminders()]);
        setMessages(m);
        setReminders(r);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [year, month]);

  const itemsForDay = (date: Date) => {
    const dateStr = date.toDateString();
    const msgs = messages.filter((m) => {
      if (!m.due_date) return false;
      return new Date(m.due_date).toDateString() === dateStr;
    });
    const rems = reminders.filter((r) => new Date(r.due_date).toDateString() === dateStr);
    return { msgs, rems };
  };

  const today = new Date();

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading calendar..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">View your messages and reminders by date</p>
      </div>

      <Card>
        <CardBody>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} className="min-h-[80px] sm:min-h-[100px]" />;
              const { msgs, rems } = itemsForDay(date);
              const hasItems = msgs.length + rems.length > 0;
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[80px] sm:min-h-[100px] rounded-lg p-1.5 border transition-all',
                    isToday ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100',
                    hasItems ? 'bg-gray-50' : ''
                  )}
                >
                  <p className={cn(
                    'text-xs font-medium mb-1',
                    isToday ? 'text-blue-600' : 'text-gray-600'
                  )}>{date.getDate()}</p>
                  <div className="space-y-0.5">
                    {msgs.slice(0, 2).map((m) => {
                      const meta = getPriorityMeta(m.priority);
                      return (
                        <Link
                          key={m.id}
                          to={`/messages/${m.id}`}
                          className="block text-[10px] truncate px-1.5 py-0.5 rounded font-medium hover:opacity-80 transition-opacity"
                          style={{ color: meta.color, backgroundColor: meta.bg }}
                          title={`${m.sender}: ${m.content.slice(0, 40)}`}
                        >
                          <PlatformIcon platform={m.platform} size={10} /> {m.sender}
                        </Link>
                      );
                    })}
                    {rems.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className="block text-[10px] truncate px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-600"
                        title={r.title}
                      >
                        🔔 {r.title}
                      </div>
                    ))}
                    {msgs.length + rems.length > 4 && (
                      <p className="text-[10px] text-gray-400 px-1">+{msgs.length + rems.length - 4} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
