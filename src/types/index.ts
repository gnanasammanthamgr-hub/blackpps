export type Platform = 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'wechat' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type MessageStatus = 'pending' | 'completed' | 'postponed';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';
export type NotificationType = 'info' | 'reminder' | 'warning' | 'success';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  phone: string;
  location: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_time_offset: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  platform: Platform;
  sender: string;
  sender_contact: string;
  content: string;
  priority: Priority;
  category: string;
  status: MessageStatus;
  message_date: string;
  due_date: string | null;
  reminder_time: string | null;
  notes: string;
  is_starred: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  message_id: string | null;
  title: string;
  description: string;
  due_date: string;
  status: ReminderStatus;
  priority: Priority;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  message_id: string | null;
  is_read: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface MessageInput {
  platform: Platform;
  sender: string;
  sender_contact?: string;
  content: string;
  priority: Priority;
  category: string;
  status?: MessageStatus;
  message_date?: string;
  due_date?: string | null;
  reminder_time?: string | null;
  notes?: string;
  is_starred?: boolean;
}

export interface ReminderInput {
  title: string;
  description?: string;
  due_date: string;
  priority: Priority;
  message_id?: string | null;
}

export interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
  postponed: number;
  urgent: number;
  todayReminders: number;
  platformBreakdown: Record<Platform, number>;
  priorityBreakdown: Record<Priority, number>;
  categoryBreakdown: Record<string, number>;
  weeklyTrend: { date: string; count: number; completed: number }[];
}
