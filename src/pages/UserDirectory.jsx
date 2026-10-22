import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List, Star, UserX } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import useLocalStorage from '../hooks/useLocalStorage';
import usePageTitle from '../hooks/usePageTitle';
import { getUsers } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import UserCard from '../components/UserCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import { pluralize } from '../utils/formatters';

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  experience: (a, b) => b.experience - a.experience,
  company: (a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name),
};

// Search matches name or company, as the spec requires. The original API values are included
// so a query like "Leanne" still resolves to the mapped developer.
const matches = (user, q) =>
  [user.name, user.company, user.apiName, user.apiCompany].some((v) => v?.toLowerCase().includes(q));

export default function UserDirectory() {
  usePageTitle('Developers');
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [team, setTeam] = useState('all');
  const [sort, setSort] = useState('name');
  const [savedOnly, setSavedOnly] = useState(false);
  const [view, setView] = useLocalStorage('dd_directory_view', 'grid');
  const { isFavorite, toggle } = useFavorites();

  const debounced = useDebounce(query, 200);
  const { data: users, loading, error, retry } = useFetch(getUsers);

  // Keep the query in the URL so a search can be shared or bookmarked.
  useEffect(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debounced) next.set('q', debounced); else next.delete('q');
      return next;
    }, { replace: true });
  }, [debounced, setParams]);

  const teams = useMemo(() => [...new Set((users ?? []).map((u) => u.company))].sort(), [users]);

  const visible = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => !q || matches(u, q))
      .filter((u) => team === 'all' || u.company === team)
      .filter((u) => !savedOnly || isFavorite('user', u.id))
      .sort(SORTS[sort]);
  }, [users, debounced, team, savedOnly, sort, isFavorite]);

  return (
    <>
      <header className="page-head">
        <h1>Developers</h1>
        <p>Search by name or team. Results update as you type.</p>
      </header>

      <div className="toolbar">
        <label className="field-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or company" aria-label="Search developers" />
        </label>

        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Filter by team">
          <option value="all">All teams</option>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort developers">
          <option value="name">Sort by name</option>
          <option value="experience">Sort by experience</option>
          <option value="company">Sort by team</option>
        </select>

        <button type="button" className={`btn btn--toggle ${savedOnly ? 'is-on' : ''}`} onClick={() => setSavedOnly((s) => !s)} aria-pressed={savedOnly}>
          <Star size={16} aria-hidden="true" /> Saved
        </button>

        <div className="segmented" role="group" aria-label="Layout">
          <button type="button" className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={16} /></button>
          <button type="button" className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={16} /></button>
        </div>
      </div>

      {error && <AlertBanner title="Could not load developers" message={getErrorMessage(error)} onRetry={retry} />}
      {loading && <SkeletonLoader variant="cards" count={6} />}

      {users && (
        <>
          <p className="result-count" aria-live="polite">{pluralize(visible.length, 'developer')} found</p>
          {visible.length > 0 ? (
            <div className={view === 'grid' ? 'grid' : 'stack'}>
              {visible.map((u) => (
                <UserCard key={u.id} user={u} view={view} isFavorite={isFavorite('user', u.id)} onToggleFavorite={(id) => toggle('user', id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UserX}
              title="No developers match"
              message="Try a different name, pick another team or clear the saved filter."
              action={<button type="button" className="btn btn--ghost" onClick={() => { setQuery(''); setTeam('all'); setSavedOnly(false); }}>Clear filters</button>}
            />
          )}
        </>
      )}
    </>
  );
}
