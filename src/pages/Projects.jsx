import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Star, FolderOpen } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { CATEGORIES, STATUSES, getProjects, importProjects } from '../services/projectService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import ProjectCard from '../components/ProjectCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import { downloadJson, pluralize } from '../utils/formatters';

const SORTS = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name),
  owner: (a, b) => a.ownerName.localeCompare(b.ownerName),
};

// Accepts an exported file (array, or { projects: [] }) and keeps only fields the vault understands.
function normalise(item) {
  if (!item || typeof item.name !== 'string') return null;
  return {
    name: item.name,
    tagline: item.tagline ?? '',
    description: item.description ?? '',
    category: CATEGORIES.includes(item.category) ? item.category : 'Other',
    status: STATUSES.includes(item.status) ? item.status : 'Prototype',
    tech: Array.isArray(item.tech) ? item.tech : [],
    repoUrl: item.repoUrl ?? '',
    liveUrl: item.liveUrl ?? '',
    ownerId: Number(item.ownerId) || 1,
    ownerName: item.ownerName ?? '',
    featured: Boolean(item.featured),
  };
}

export default function Projects() {
  usePageTitle('Projects');
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();
  const fileRef = useRef(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');
  const [savedOnly, setSavedOnly] = useState(false);

  const debounced = useDebounce(query, 200);
  const { data: projects, loading, error, retry } = useFetch(getProjects);

  const visible = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return (projects ?? [])
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => !savedOnly || isFavorite('project', p.id))
      .filter((p) => !q || [p.name, p.tagline, p.ownerName, ...p.tech].join(' ').toLowerCase().includes(q))
      .sort(SORTS[sort]);
  }, [projects, debounced, category, status, savedOnly, sort, isFavorite]);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const list = (Array.isArray(parsed) ? parsed : parsed.projects ?? []).map(normalise).filter(Boolean);
      if (list.length === 0) return toast.error('No projects found in that file.');
      const result = await importProjects(list);
      toast.success(`Imported ${result.imported} ${result.imported === 1 ? 'project' : 'projects'}${result.skipped ? `, skipped ${result.skipped} invalid` : ''}.`);
      retry();
    } catch (err) {
      toast.error(err instanceof SyntaxError ? 'That file is not valid JSON.' : getErrorMessage(err));
    }
  };

  return (
    <>
      <header className="page-head page-head--row">
        <div>
          <h1>Project vault</h1>
          <p>Every project your organisation ships, with owners, stacks and links.</p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="btn btn--ghost" onClick={() => downloadJson('devdirectory-projects.json', projects ?? [])} disabled={!projects?.length}>
            <Download size={16} aria-hidden="true" /> Export
          </button>
          {isAuthenticated && (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
                <Upload size={16} aria-hidden="true" /> Import
              </button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
            </>
          )}
          <Link to="/add-project" className="btn btn--primary"><Plus size={16} aria-hidden="true" /> New project</Link>
        </div>
      </header>

      <div className="toolbar">
        <label className="field-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, owner or technology" aria-label="Search projects" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">Any status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects">
          <option value="recent">Recently updated</option>
          <option value="name">Name</option>
          <option value="owner">Owner</option>
        </select>
        <button type="button" className={`btn btn--toggle ${savedOnly ? 'is-on' : ''}`} onClick={() => setSavedOnly((s) => !s)} aria-pressed={savedOnly}>
          <Star size={16} aria-hidden="true" /> Saved
        </button>
      </div>

      <div className="filter-chips" role="group" aria-label="Category">
        {['all', ...CATEGORIES].map((c) => (
          <button key={c} type="button" className={category === c ? 'is-on' : ''} onClick={() => setCategory(c)} aria-pressed={category === c}>
            {c === 'all' ? 'All categories' : c}
          </button>
        ))}
      </div>

      {error && <AlertBanner title="Could not load projects" message={getErrorMessage(error)} onRetry={retry} />}
      {loading && <SkeletonLoader variant="cards" count={6} />}

      {projects && (
        <>
          <p className="result-count" aria-live="polite">{pluralize(visible.length, 'project')}</p>
          {visible.length > 0 ? (
            <div className="grid">
              {visible.map((p) => (
                <ProjectCard key={p.id} project={p} isFavorite={isFavorite('project', p.id)} onToggleFavorite={(id) => toggle('project', id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title={projects.length === 0 ? 'The vault is empty' : 'No projects match'}
              message={projects.length === 0 ? 'Add your first project to start the collection.' : 'Change the filters or search for something else.'}
              action={<Link to="/add-project" className="btn btn--primary">Add a project</Link>}
            />
          )}
        </>
      )}
    </>
  );
}
