import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const baseActions = [
  { label: 'Go to Home', path: '/', roles: ['admin', 'manager', 'coach', 'player'] },
  { label: 'Logout', action: 'logout', roles: ['admin', 'manager', 'coach', 'player'] },
];

const roleActions = [
  { label: 'Admin: User Management', path: '/admin#users', roles: ['admin'] },
  { label: 'Admin: Player Archive', path: '/admin#archive', roles: ['admin'] },
  { label: 'Admin: Club Settings', path: '/admin#settings', roles: ['admin'] },
  { label: 'Admin: System Logs', path: '/admin#logs', roles: ['admin'] },
  { label: 'Manager: Fixtures', path: '/manager#fixtures', roles: ['manager'] },
  { label: 'Manager: Contracts', path: '/manager#contracts', roles: ['manager'] },
  { label: 'Manager: Documents', path: '/manager#documents', roles: ['manager'] },
  { label: 'Manager: Inventory', path: '/manager#inventory', roles: ['manager'] },
  { label: 'Manager: Finance', path: '/manager#finance', roles: ['manager'] },
  { label: 'Coach: Tactical Board', path: '/coach#tactical', roles: ['coach'] },
  { label: 'Coach: Training', path: '/coach#training', roles: ['coach'] },
  { label: 'Coach: Squad Health', path: '/coach#health', roles: ['coach'] },
  { label: 'Coach: Performance', path: '/coach#performance', roles: ['coach'] },
  { label: 'Player: Dashboard', path: '/player#dashboard', roles: ['player'] },
  { label: 'Player: Calendar', path: '/player#calendar', roles: ['player'] },
  { label: 'Player: Leave Requests', path: '/player#leave', roles: ['player'] },
];

const CommandMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = useMemo(() => {
    if (!user?.role) return [];

    return [...baseActions, ...roleActions]
      .filter((action) => action.roles.includes(user.role))
      .filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, user?.role]);

  const runAction = (action) => {
    setOpen(false);
    setQuery('');

    if (action.action === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    const [path, hash] = action.path.split('#');
    navigate(path);

    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-4 pt-28 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#070712]/95 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <div className="border-b border-white/10 p-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-lg text-white outline-none placeholder:text-white/35"
            placeholder="Type a command or destination..."
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {actions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
              No commands found.
            </div>
          ) : (
            actions.map((action) => (
              <button
                key={action.label}
                onClick={() => runAction(action)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-white transition hover:bg-white/[0.06]"
              >
                <span>{action.label}</span>
                <span className="text-xs uppercase tracking-[0.25em] text-white/35">Enter</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
