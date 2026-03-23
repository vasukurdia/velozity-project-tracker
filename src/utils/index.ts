import { Priority, Status } from '../types';

export function formatDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due Today';
  if (diffDays < -7) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  return date < today;
}

export function isDueToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  return date.getTime() === today.getTime();
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: '#f87171',
  High: '#fbbf24',
  Medium: '#4f8ef7',
  Low: '#6b7280',
};

export const PRIORITY_BG: Record<Priority, string> = {
  Critical: 'rgba(248,113,113,0.15)',
  High: 'rgba(251,191,36,0.15)',
  Medium: 'rgba(79,142,247,0.15)',
  Low: 'rgba(107,114,128,0.15)',
};

export const STATUS_COLORS: Record<Status, string> = {
  'To Do': '#6b7280',
  'In Progress': '#4f8ef7',
  'In Review': '#9b6dff',
  'Done': '#34d399',
};

export const ALL_STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];
export const ALL_PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
