import type { Platform, Priority, MessageStatus } from '@/types';

export const PLATFORMS: { value: Platform; label: string; color: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: 'whatsapp' },
  { value: 'telegram', label: 'Telegram', color: '#0088cc', icon: 'telegram' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F', icon: 'instagram' },
  { value: 'email', label: 'Email', color: '#4285F4', icon: 'mail' },
  { value: 'wechat', label: 'WeChat', color: '#07C160', icon: 'wechat' },
  { value: 'other', label: 'Other', color: '#6366f1', icon: 'message' },
];

export const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'low', label: 'Low', color: '#6b7280', bg: '#f3f4f6' },
  { value: 'medium', label: 'Medium', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'high', label: 'High', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444', bg: '#fee2e2' },
];

export const STATUSES: { value: MessageStatus; label: string; color: string; bg: string }[] = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'completed', label: 'Completed', color: '#10b981', bg: '#d1fae5' },
  { value: 'postponed', label: 'Postponed', color: '#6b7280', bg: '#f3f4f6' },
];

export const CATEGORIES = [
  'Work',
  'Personal',
  'Family',
  'Friends',
  'Business',
  'Finance',
  'Health',
  'Travel',
  'Education',
  'Other',
];

export function getPlatformMeta(platform: string) {
  return PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[5];
}

export function getPriorityMeta(priority: string) {
  return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1];
}

export function getStatusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}
