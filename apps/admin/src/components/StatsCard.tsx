export function StatsCard({
  label,
  value,
  icon,
  accent = '#7C6EF6',
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-tertiary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${accent}22` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
