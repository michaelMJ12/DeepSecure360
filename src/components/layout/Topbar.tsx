import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { humanize } from '@/utils/format';

export function Topbar({ onToggleMenu }: { onToggleMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/cases?search=${encodeURIComponent(q.trim())}`);
  };

  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}` : '';

  return (
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={onToggleMenu} aria-label="Toggle navigation">
        <Icon name="menu" />
      </button>
      <form className="topbar-search" onSubmit={submit} role="search">
        <Icon name="search" size={16} className="control-icon" />
        <input className="input input-with-icon" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cases by number, title or assignee" aria-label="Global search" />
      </form>
      <div className="topbar-right">
        <ThemeToggle />
        <button type="button" className="icon-btn" aria-label="Notifications"><Icon name="bell" /></button>
        <div className="user-chip">
          <span className="avatar">{initials}</span>
          <span className="user-meta">
            <strong>{user?.first_name} {user?.last_name}</strong>
            <small>{user ? humanize(user.role) : ''}</small>
          </span>
        </div>
        <button type="button" className="icon-btn" onClick={() => void logout()} aria-label="Sign out"><Icon name="logout" /></button>
      </div>
    </header>
  );
}
