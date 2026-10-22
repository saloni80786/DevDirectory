import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import { getUsers } from '../services/userService';
import { getProjects } from '../services/projectService';

const PAGES = [
  { group: 'Go to', label: 'Home', to: '/' },
  { group: 'Go to', label: 'Developer directory', to: '/users' },
  { group: 'Go to', label: 'Project vault', to: '/projects' },
  { group: 'Do', label: 'Publish a bulletin', to: '/add-post' },
  { group: 'Do', label: 'Add a project', to: '/add-project' },
  { group: 'Do', label: 'Sign in', to: '/login' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState({ users: [], projects: [] });

  // Load searchable records the first time the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
    Promise.allSettled([getUsers(), getProjects()]).then(([u, p]) =>
      setRemote({ users: u.value ?? [], projects: p.value ?? [] }),
    );
  }, [open]);

  const results = useMemo(() => {
    const all = [
      ...PAGES,
      ...remote.users.map((u) => ({ group: 'Developers', label: u.name, hint: `${u.role}, ${u.company}`, to: `/users/${u.id}`, extra: u.apiName })),
      ...remote.projects.map((p) => ({ group: 'Projects', label: p.name, hint: p.tagline, to: `/projects/${p.id}` })),
    ];
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 8);
    return all.filter((r) => `${r.label} ${r.hint ?? ''} ${r.extra ?? ''}`.toLowerCase().includes(q)).slice(0, 10);
  }, [query, remote]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (item) => {
    if (!item) return;
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') go(results[active]);
  };

  return (
    <div className="overlay overlay--top" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Quick search">
        <div className="palette__input">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search developers, projects or pages"
            aria-label="Search"
          />
        </div>
        <ul className="palette__list" role="listbox">
          {results.length === 0 && <li className="palette__empty">Nothing matches "{query}".</li>}
          {results.map((r, i) => (
            <li key={`${r.group}-${r.to}`} role="option" aria-selected={i === active}>
              <button type="button" className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
                <span className="palette__group">{r.group}</span>
                <span className="palette__label">{r.label}</span>
                {r.hint && <span className="palette__hint">{r.hint}</span>}
                {i === active && <CornerDownLeft size={14} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
