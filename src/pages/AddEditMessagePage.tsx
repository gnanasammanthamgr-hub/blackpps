import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { InlineLoader } from '@/components/ui/Loading';
import { fetchMessage, createMessage, updateMessage } from '@/lib/services';
import { PLATFORMS, PRIORITIES, CATEGORIES } from '@/lib/constants';
import type { Platform, Priority, MessageStatus, MessageInput } from '@/types';

export function AddEditMessagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<MessageInput>({
    platform: 'whatsapp',
    sender: '',
    sender_contact: '',
    content: '',
    priority: 'medium',
    category: 'Work',
    status: 'pending',
    message_date: new Date().toISOString().slice(0, 16),
    due_date: '',
    reminder_time: '',
    notes: '',
    is_starred: false,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const msg = await fetchMessage(id);
        if (msg) {
          setForm({
            platform: msg.platform,
            sender: msg.sender,
            sender_contact: msg.sender_contact,
            content: msg.content,
            priority: msg.priority,
            category: msg.category,
            status: msg.status,
            message_date: msg.message_date?.slice(0, 16) ?? '',
            due_date: msg.due_date?.slice(0, 16) ?? '',
            reminder_time: msg.reminder_time?.slice(0, 16) ?? '',
            notes: msg.notes,
            is_starred: msg.is_starred,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.sender.trim()) {
      setError('Sender name is required');
      return;
    }
    if (!form.content.trim()) {
      setError('Message content is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        message_date: form.message_date ? new Date(form.message_date).toISOString() : new Date().toISOString(),
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        reminder_time: form.reminder_time ? new Date(form.reminder_time).toISOString() : null,
      };
      if (isEdit && id) {
        await updateMessage(id, payload);
        navigate(`/messages/${id}`);
      } else {
        const created = await createMessage(payload);
        navigate(`/messages/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save message');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading message..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Link to={isEdit ? `/messages/${id}` : '/messages'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Message' : 'Add New Message'}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{isEdit ? 'Update the message details' : 'Track a message you need to reply to or view later'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardBody className="space-y-4">
                {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Platform"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </Select>
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>

                <Input
                  label="Sender / Contact Name"
                  placeholder="e.g. John Doe"
                  value={form.sender}
                  onChange={(e) => setForm({ ...form, sender: e.target.value })}
                />

                <Input
                  label="Contact Info (optional)"
                  placeholder="e.g. +1 555-0123 or @username"
                  value={form.sender_contact}
                  onChange={(e) => setForm({ ...form, sender_contact: e.target.value })}
                />

                <Textarea
                  label="Message Content"
                  rows={5}
                  placeholder="Paste or type the important message here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />

                <Textarea
                  label="Notes (optional)"
                  rows={3}
                  placeholder="Any additional notes or context..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>

                {isEdit && (
                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as MessageStatus })}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                  </Select>
                )}

                <Input
                  label="Message Date"
                  type="datetime-local"
                  value={form.message_date}
                  onChange={(e) => setForm({ ...form, message_date: e.target.value })}
                />

                <Input
                  label="Due Date (optional)"
                  type="datetime-local"
                  value={form.due_date ?? ''}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />

                <Input
                  label="Reminder Time (optional)"
                  type="datetime-local"
                  value={form.reminder_time ?? ''}
                  onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_starred ?? false}
                    onChange={(e) => setForm({ ...form, is_starred: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Star this message</span>
                </label>
              </CardBody>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" loading={saving} className="flex-1" size="lg">
                <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Message'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate(isEdit ? `/messages/${id}` : '/messages')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
