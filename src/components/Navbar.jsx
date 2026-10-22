import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Plus, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initialsOf } from '../utils/indianProfiles';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/users', label: 'Developers' },
  { to: '/projects', label: 'Projects' },
  { to: '/add-post', label: 'Publish' },
];

export function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#16171a" />
      <path d="M18 18h14c9 0 15 6 15 14s-6 14-15 14H18z" fill="none" stroke="#D9B26F" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3.5" fill="#ECEDEF" />
    </svg>
  );
}

export default function Navbar({ onOpenPalette }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo /> <span>DevDirectory</span>
        </Link>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="search-trigger" onClick={onOpenPalette} aria-label="Open quick search">
            <Search size={16} aria-hidden="true" />
            <span>Quick search</span>
            <kbd>Ctrl K</kbd>
          </button>

          <Link to="/add-project" className="btn btn--primary btn--small hide-sm">
            <Plus size={16} aria-hidden="true" /> New project
          </Link>

          {isAuthenticated ? (
            <div className="session">
              <span className="avatar avatar--sm" title={user?.email}>{initialsOf(user?.name)}</span>
              <button type="button" className="icon-btn" onClick={logout} aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--ghost btn--small">
              <LogIn size={16} aria-hidden="true" /> Sign in
            </Link>
          )}

          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
