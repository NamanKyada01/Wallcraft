import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: '#3B82F6',
    in_progress: '#F59E0B',
    resolved: '#22C55E',
    closed: '#6B7280',
  };
  return colors[status] ?? '#6B7280';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: '#22C55E',
    medium: '#F59E0B',
    high: '#EF4444',
  };
  return colors[priority] ?? '#6B7280';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
