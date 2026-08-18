import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { DataTable } from '../components/DataTable';

export function Users() {
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: downloadCounts } = useQuery({
    queryKey: ['user-download-counts'],
    queryFn: async () => {
      const { data } = await supabase.from('downloads').select('user_id');
      const counts: Record<string, number> = {};
      (data ?? []).forEach((d) => {
        counts[d.user_id] = (counts[d.user_id] ?? 0) + 1;
      });
      return counts;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-64 rounded-xl border border-white/10 bg-bg-card px-4 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary"
        />
      </div>

      <DataTable
        headers={['User', 'Role', 'Downloads', 'Joined']}
        isLoading={isLoading}
        emptyMessage={`${users?.length ?? 0} users`}
      >
        {(users ?? []).map((user) => (
          <tr key={user.id} className="transition hover:bg-white/5">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary/20 text-sm font-bold text-accent-secondary">
                  {(user.full_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    {user.full_name || user.username || 'Unnamed'}
                  </p>
                  <p className="text-xs text-text-tertiary">{user.id.slice(0, 8)}…</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.role === 'admin'
                    ? 'bg-accent-primary/20 text-accent-secondary'
                    : 'bg-white/5 text-text-secondary'
                }`}
              >
                {user.role}
              </span>
            </td>
            <td className="px-4 py-3 text-text-secondary">
              {downloadCounts?.[user.id] ?? 0}
            </td>
            <td className="px-4 py-3 text-text-secondary">
              {new Date(user.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
