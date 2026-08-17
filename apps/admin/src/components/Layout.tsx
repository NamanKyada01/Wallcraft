import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/wallpapers', label: 'Wallpapers', icon: '🖼️' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
];

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-bg-secondary md:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-lg">
            🖼️
          </div>
          <div>
            <p className="font-bold text-text-primary">Wallcraft</p>
            <p className="text-xs text-text-tertiary">Admin Panel</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-primary/15 text-accent-secondary'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mx-3 mb-5 flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium text-status-error hover:bg-status-error/10"
        >
          <span className="mr-3">🚪</span> Log out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
