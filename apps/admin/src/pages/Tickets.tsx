import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { DataTable, StatusPill } from '../components/DataTable';

const STATUSES = ['all', 'open', 'in_progress', 'resolved', 'closed'];

export function Tickets() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*, profile:profiles(full_name, username)')
        .order('updated_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Tickets</h1>

        <div className="flex gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === status
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        headers={['Subject', 'User', 'Category', 'Priority', 'Status', 'Updated']}
        isLoading={isLoading}
        emptyMessage={`${tickets?.length ?? 0} tickets`}
      >
        {(tickets ?? []).map((ticket) => (
          <tr key={ticket.id} className="transition hover:bg-white/5">
            <td className="px-4 py-3">
              <Link
                to={`/tickets/${ticket.id}`}
                className="font-medium text-text-primary hover:text-accent-secondary"
              >
                {ticket.subject}
              </Link>
            </td>
            <td className="px-4 py-3 text-text-secondary">
              {ticket.profile?.full_name || ticket.profile?.username || 'Unknown'}
            </td>
            <td className="px-4 py-3 capitalize text-text-secondary">
              {ticket.category}
            </td>
            <td className="px-4 py-3">
              <span
                className={`text-xs font-semibold ${
                  ticket.priority === 'high'
                    ? 'text-status-error'
                    : ticket.priority === 'medium'
                      ? 'text-status-warning'
                      : 'text-status-success'
                }`}
              >
                {ticket.priority}
              </span>
            </td>
            <td className="px-4 py-3">
              <StatusPill status={ticket.status} />
            </td>
            <td className="px-4 py-3 text-text-secondary">
              {new Date(ticket.updated_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
