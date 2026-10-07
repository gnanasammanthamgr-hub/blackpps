import { useEffect, useState } from 'react';
import { Plus, Bell, CheckCircle, Clock, Trash2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Loading';
import { fetchReminders, createReminder, updateReminderStatus, deleteReminder } from '@/lib/services';
import { PRIORITIES, getPriorityMeta } from '@/lib/constants';
import { formatRelative, formatDate, isOverdue } from '@/lib/utils';
import type { Reminder, ReminderInput, Priority } from '@/types';

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reminders.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pending = reminders.filter((r) => r.status === 'pending');
  const completed = reminders.filter((r) => r.status === 'completed');
  const overdue = pending.filter((r) => isOverdue(r.due_date));

  const handleComplete = async (id: string) => {
    await updateReminderStatus(id, 'completed');
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)));
  };

  const handleSnooze = async (id: string) => {
    await updateReminderStatus(id, 'snoozed');
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'snoozed' } : r)));
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading reminders..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders & Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pending.length} pending · {completed.length} completed · {overdue.length} overdue
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add Reminder</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardBody className="!p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock size={20} className="text-amber-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{pending.length}</p><p className="text-xs text-gray-500">Pending</p></div>
        </CardBody></Card>
        <Card><CardBody className="!p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><AlertCircle size={20} className="text-red-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{overdue.length}</p><p className="text-xs text-gray-500">Overdue</p></div>
        </CardBody></Card>
        <Card><CardBody className="!p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle size={20} className="text-green-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{completed.length}</p><p className="text-xs text-gray-500">Completed</p></div>
        </CardBody></Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'snoozed', label: 'Snoozed' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === t.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Bell size={28} />} title="No reminders" description="Create a reminder to get notified about upcoming tasks" />
        </CardBody></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const meta = getPriorityMeta(r.priority);
            const overdueFlag = r.status === 'pending' && isOverdue(r.due_date);
            return (
              <Card key={r.id} hover={false}>
                <CardBody className="!p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                    <Bell size={18} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${r.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{r.title}</h4>
                      <Badge color={meta.color} bg={meta.bg}>{meta.label}</Badge>
                      {overdueFlag && <Badge color="#ef4444" bg="#fee2e2">Overdue</Badge>}
                      {r.is_demo && <Badge color="#8b5cf6" bg="#ede9fe">Demo</Badge>}
                    </div>
                    {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                    <p className={`text-xs mt-1 ${overdueFlag ? 'text-red-500' : 'text-gray-400'}`}>
                      Due {formatRelative(r.due_date)} · {formatDate(r.due_date, true)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleComplete(r.id)} className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors" title="Complete">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleSnooze(r.id)} className="p-2 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Snooze">
                          <Clock size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <AddReminderModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={loadReminders} />
    </DashboardLayout>
  );
}

function AddReminderModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<ReminderInput>({
    title: '',
    description: '',
    due_date: new Date(Date.now() + 3600000 * 24).toISOString().slice(0, 16),
    priority: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      await createReminder({
        ...form,
        due_date: new Date(form.due_date).toISOString(),
      });
      setForm({ title: '', description: '', due_date: new Date(Date.now() + 3600000 * 24).toISOString().slice(0, 16), priority: 'medium' });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
        <Input label="Title" placeholder="e.g. Reply to Sarah's message" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea label="Description (optional)" rows={2} placeholder="Add more details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Add Reminder</Button>
        </div>
      </form>
    </Modal>
  );
}
