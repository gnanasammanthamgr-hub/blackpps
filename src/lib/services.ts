import { supabase } from '@/lib/supabase';
import type { Message, Reminder, Notification, MessageInput, ReminderInput, DashboardStats } from '@/types';
import { DEMO_MESSAGES, DEMO_REMINDERS, DEMO_NOTIFICATIONS } from '@/lib/demo-data';

export async function seedDemoData(userId: string) {
  const { data: existing } = await supabase
    .from('messages')
    .select('id')
    .eq('user_id', userId)
    .eq('is_demo', true)
    .limit(1);

  if (existing && existing.length > 0) return;

  const messagesToInsert = DEMO_MESSAGES.map((m) => ({ ...m, user_id: userId }));
  const { data: insertedMessages, error: msgError } = await supabase
    .from('messages')
    .insert(messagesToInsert)
    .select('id, platform, sender, content');

  if (msgError) throw msgError;

  const remindersToInsert = DEMO_REMINDERS.map((r) => ({ ...r, user_id: userId }));
  await supabase.from('reminders').insert(remindersToInsert);

  const notifsToInsert = DEMO_NOTIFICATIONS.map((n) => ({ ...n, user_id: userId }));
  await supabase.from('notifications').insert(notifsToInsert);
}

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function fetchMessage(id: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Message | null;
}

export async function createMessage(input: MessageInput): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Message;
}

export async function updateMessage(id: string, updates: Partial<MessageInput>): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Message;
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleMessageStar(id: string, starred: boolean): Promise<void> {
  await supabase.from('messages').update({ is_starred: starred }).eq('id', id);
}

export async function updateMessageStatus(id: string, status: string): Promise<void> {
  await supabase.from('messages').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function fetchReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function createReminder(input: ReminderInput): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Reminder;
}

export async function updateReminderStatus(id: string, status: string): Promise<void> {
  await supabase.from('reminders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteReminder(id: string): Promise<void> {
  await supabase.from('reminders').delete().eq('id', id);
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
}

export async function deleteNotification(id: string): Promise<void> {
  await supabase.from('notifications').delete().eq('id', id);
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const messages = await fetchMessages();
  const reminders = await fetchReminders();

  const platformBreakdown = {
    whatsapp: 0, telegram: 0, instagram: 0, email: 0, wechat: 0, other: 0,
  } as DashboardStats['platformBreakdown'];

  const priorityBreakdown = { low: 0, medium: 0, high: 0, urgent: 0 } as DashboardStats['priorityBreakdown'];
  const categoryBreakdown: Record<string, number> = {};

  messages.forEach((m) => {
    platformBreakdown[m.platform] = (platformBreakdown[m.platform] ?? 0) + 1;
    priorityBreakdown[m.priority] = (priorityBreakdown[m.priority] ?? 0) + 1;
    categoryBreakdown[m.category] = (categoryBreakdown[m.category] ?? 0) + 1;
  });

  const now = new Date();
  const weeklyTrend: { date: string; count: number; completed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const dayMsgs = messages.filter((m) => {
      const d = new Date(m.created_at);
      return d >= day && d < nextDay;
    });
    weeklyTrend.push({
      date: day.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayMsgs.length,
      completed: dayMsgs.filter((m) => m.status === 'completed').length,
    });
  }

  const todayReminders = reminders.filter((r) => {
    const d = new Date(r.due_date);
    return d.toDateString() === now.toDateString() && r.status === 'pending';
  }).length;

  return {
    total: messages.length,
    pending: messages.filter((m) => m.status === 'pending').length,
    completed: messages.filter((m) => m.status === 'completed').length,
    postponed: messages.filter((m) => m.status === 'postponed').length,
    urgent: messages.filter((m) => m.priority === 'urgent' && m.status === 'pending').length,
    todayReminders,
    platformBreakdown,
    priorityBreakdown,
    categoryBreakdown,
    weeklyTrend,
  };
}

export async function updateProfile(userId: string, updates: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}
