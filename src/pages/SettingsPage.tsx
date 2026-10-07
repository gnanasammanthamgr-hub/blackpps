import { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Globe, Shield, LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InlineLoader } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/services';

export function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    reminder_time_offset: 15,
  });

  useEffect(() => {
    if (profile) {
      setSettings({
        email_notifications: profile.email_notifications,
        push_notifications: profile.push_notifications,
        reminder_time_offset: profile.reminder_time_offset,
      });
    }
    // Auth profile loading is asynchronous; never leave Settings on a permanent loader.
    const timer = window.setTimeout(() => setLoading(false), 1200);
    if (profile) setLoading(false);
    return () => window.clearTimeout(timer);
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (user) {
        await updateProfile(user.id, settings);
        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading settings..." /></DashboardLayout>;
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <div className="px-4 py-4 rounded-xl bg-amber-50 text-amber-800 text-sm">
          Settings profile is missing or blocked by Supabase RLS. Run the included Supabase profile repair SQL, then refresh.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your preferences and account</p>
      </div>

      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-600 text-sm">Settings saved successfully</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <ToggleRow
              icon={Mail}
              label="Email Notifications"
              desc="Receive email alerts for reminders and updates"
              enabled={settings.email_notifications}
              onToggle={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
            />
            <ToggleRow
              icon={Bell}
              label="Push Notifications"
              desc="Get push notifications in your browser"
              enabled={settings.push_notifications}
              onToggle={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}
            />
            <div className="pt-2">
              <Input
                label="Reminder Lead Time (minutes)"
                type="number"
                icon={<Clock size={18} />}
                value={settings.reminder_time_offset}
                onChange={(e) => setSettings({ ...settings, reminder_time_offset: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-400 mt-1">How many minutes before a due date to send a reminder</p>
            </div>
          </CardBody>
        </Card>

        {/* Account */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-purple-500" />
                <CardTitle>Account</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <InfoRow icon={Mail} label="Email" value={user?.email ?? '—'} />
              <InfoRow icon={Globe} label="Timezone" value={profile.timezone} />
              <InfoRow icon={Clock} label="Member since" value={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogOut size={18} className="text-red-500" />
                <CardTitle>Session</CardTitle>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 mb-3">Sign out of your account on this device</p>
              <Button variant="danger" onClick={handleSignOut}>
                <LogOut size={16} /> Sign Out
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}

function ToggleRow({ icon: Icon, label, desc, enabled, onToggle }: { icon: typeof Bell; label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button onClick={onToggle} className="shrink-0">
        {enabled ? <ToggleRight size={36} className="text-blue-600" /> : <ToggleLeft size={36} className="text-gray-300" />}
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
