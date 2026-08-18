import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { supabase } from '../api/supabase';
import { StatsCard } from '../components/StatsCard';
import { StatusPill } from '../components/DataTable';

const STATUS_COLORS: Record<string, string> = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  resolved: '#22C55E',
  closed: '#6B7280',
};

export function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [users, wallpapers, downloads, tickets] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('wallpapers').select('id', { count: 'exact', head: true }),
        supabase.from('downloads').select('id', { count: 'exact', head: true }),
        supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
      ]);
      return {
        users: users.count ?? 0,
        wallpapers: wallpapers.count ?? 0,
        downloads: downloads.count ?? 0,
        openTickets: tickets.count ?? 0,
      };
    },
  });

  // Downloads per day for last 14 days
  const { data: downloadsChart } = useQuery({
    queryKey: ['downloads-chart'],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { data } = await supabase
        .from('downloads')
        .select('created_at')
        .gte('created_at', since.toISOString());

      const byDay = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay.set(d.toISOString().slice(5, 10), 0);
      }
      (data ?? []).forEach((row) => {
        const key = row.created_at.slice(5, 10);
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
      });

      return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
    },
  });

  const { data: ticketStatusData } = useQuery({
    queryKey: ['ticket-status-chart'],
    queryFn: async () => {
      const { data } = await supabase.from('tickets').select('status');
      const counts: Record<string, number> = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      };
      (data ?? []).forEach((t) => {
        counts[t.status] = (counts[t.status] ?? 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: recentTickets } = useQuery({
    queryKey: ['recent-tickets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={stats?.users ?? '…'}
          icon="👥"
          accent="#7C6EF6"
        />
        <StatsCard
          label="Wallpapers"
          value={stats?.wallpapers ?? '…'}
          icon="🖼️"
          accent="#06B6D4"
        />
        <StatsCard
          label="Downloads"
          value={stats?.downloads ?? '…'}
          icon="⬇️"
          accent="#22C55E"
        />
        <StatsCard
          label="Open Tickets"
          value={stats?.openTickets ?? '…'}
          icon="🎫"
          accent="#F59E0B"
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">
            Downloads (last 14 days)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadsChart ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="#6B6B80"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#6B6B80" fontSize={11} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A2E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7C6EF6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">
            Tickets by Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketStatusData ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(ticketStatusData ?? []).map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? '#6B7280'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1A1A2E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#A0A0B8', fontSize: 12 }}>
                      {value.replace('_', ' ')}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-text-secondary">
          Recent Tickets
        </h2>
        <div className="space-y-2">
          {(recentTickets ?? []).map((ticket) => (
            <a
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3 transition hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {ticket.subject}
                </p>
                <p className="text-xs text-text-tertiary">
                  {new Date(ticket.created_at).toLocaleDateString()} ·{' '}
                  {ticket.category}
                </p>
              </div>
              <StatusPill status={ticket.status} />
            </a>
          ))}
          {(recentTickets ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-text-tertiary">
              No tickets yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
