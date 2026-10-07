export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | null, includeTime = false): string {
  if (!date) return '—';
  const d = new Date(date);
  const opts: Intl.DateTimeFormatOptions = includeTime
    ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', opts);
}

export function formatRelative(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor(absDiff / 3600000);
  const mins = Math.floor(absDiff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return diff < 0 ? `${mins}m ago` : `in ${mins}m`;
  if (hours < 24) return diff < 0 ? `${hours}h ago` : `in ${hours}h`;
  if (days < 7) return diff < 0 ? `${days}d ago` : `in ${days}d`;
  return formatDate(date);
}

export function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function isToday(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}
