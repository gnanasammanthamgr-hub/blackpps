import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Clock, Save, Star, Calendar, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { InlineLoader } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { fetchMessages, fetchReminders, updateProfile } from '@/lib/services';
import { formatDate, initials } from '@/lib/utils';
import type { Message, Reminder } from '@/types';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    phone: '',
    location: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        timezone: profile.timezone ?? 'UTC',
      });
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      try {
        const [m, r] = await Promise.allSettled([fetchMessages(), fetchReminders()]);
        if (m.status === 'fulfilled') setMessages(m.value);
        if (r.status === 'fulfilled') setReminders(r.value);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (user) {
        await updateProfile(user.id, form);
        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading profile..." /></DashboardLayout>;
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        <div className="px-4 py-4 rounded-xl bg-amber-50 text-amber-800 text-sm">
          Profile data is missing or cannot be read. Run the included Supabase profile repair SQL, then refresh this page.
        </div>
      </DashboardLayout>
    );
  }

  const completedCount = messages.filter((m) => m.status === 'completed').length;
  const pendingReminders = reminders.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <div className="space-y-4">
          <Card>
            <CardBody className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
                {initials(form.display_name || user?.email || 'U')}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{form.display_name || 'User'}</h2>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <Mail size={14} /> {user?.email}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Member since {formatDate(profile.created_at)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <StatRow icon={MessageSquare} label="Messages tracked" value={messages.length} color="#3b82f6" />
              <StatRow icon={Star} label="Completed" value={completedCount} color="#10b981" />
              <StatRow icon={Calendar} label="Pending reminders" value={pendingReminders} color="#f59e0b" />
            </CardBody>
          </Card>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
            <CardBody>
              <form onSubmit={handleSave} className="space-y-4">
                {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
                {saved && <div className="px-4 py-3 rounded-xl bg-green-50 text-green-600 text-sm">Profile updated successfully</div>}

                <Input
                  label="Display Name"
                  icon={<User size={18} />}
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />
                <Input
                  label="Email"
                  value={user?.email ?? ''}
                  disabled
                  className="bg-gray-50"
                />
                <Textarea
                  label="Bio"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    icon={<Phone size={18} />}
                    placeholder="+1 555-0123"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    label="Location"
                    icon={<MapPin size={18} />}
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <Input
                  label="Timezone"
                  icon={<Clock size={18} />}
                  placeholder="UTC"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                />
                <Button type="submit" loading={saving}>
                  <Save size={16} /> Save Changes
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatRow({ icon: Icon, label, value, color }: { icon: typeof User; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
