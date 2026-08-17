import { ReactNode } from 'react';

export function DataTable({
  headers,
  children,
  isLoading,
  emptyMessage = 'No data',
}: {
  headers: string[];
  children: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-elevated">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-12 text-center text-text-tertiary"
              >
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
      {!isLoading && (
        <div className="px-4 py-3 text-xs text-text-tertiary">{emptyMessage}</div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: '#3B82F6',
    in_progress: '#F59E0B',
    resolved: '#22C55E',
    closed: '#6B7280',
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: `${colors[status] ?? '#6B7280'}22`,
        color: colors[status] ?? '#6B7280',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
