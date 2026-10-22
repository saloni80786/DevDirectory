import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, FolderKanban, PenLine, ArrowRight } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { getUsers } from '../services/userService';
import { getPosts } from '../services/postService';
import { getProjects } from '../services/projectService';
import { getErrorMessage } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import BarList from '../components/BarList';
import ProjectCard from '../components/ProjectCard';
import { useFavorites } from '../context/FavoritesContext';

const loadOverview = async ({ signal }) => {
  const [users, posts, projects] = await Promise.all([
    getUsers(),
    getPosts({ signal }),
    getProjects().catch(() => []),
  ]);
  return { users, posts, projects };
};

export default function Home() {
  usePageTitle('');
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [query, setQuery] = useState('');
  const { data, loading, error, retry } = useFetch(loadOverview);

  const insights = useMemo(() => {
    if (!data) return null;
    const names = Object.fromEntries(data.users.map((u) => [u.id, u.name]));
    const perDev = {};
    data.posts.forEach((p) => { perDev[p.userId] = (perDev[p.userId] || 0) + 1; });
    const perCategory = {};
    data.projects.forEach((p) => { perCategory[p.category] = (perCategory[p.category] || 0) + 1; });

    return {
      names,
      teams: new Set(data.users.map((u) => u.company)).size,
      topAuthors: Object.entries(perDev)
        .map(([id, value]) => ({ label: names[id] ?? `Developer ${id}`, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      categories: Object.entries(perCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    };
  }, [data]);

  const stats = data && insights && [
    { label: 'Developers', value: data.users.length },
    { label: 'Teams', value: insights.teams },
    { label: 'Bulletins', value: data.posts.length },
    { label: 'Projects in the vault', value: data.projects.length },
  ];

  const onSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/users?q=${encodeURIComponent(query.trim())}` : '/users');
  };

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <h1>Know your engineers. Keep every project in one vault.</h1>
          <p>
            Search colleagues across teams, read what they publish, and store the projects your
            organisation ships, from a news frontend to a todo app.
          </p>
          <form className="hero__search" onSubmit={onSearch} role="search">
            <Search size={20} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or team" aria-label="Search developers" />
            <button type="submit" className="btn btn--primary">Search</button>
          </form>
          <div className="hero__links">
            <Link to="/projects" className="text-link">Browse the project vault <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/add-project" className="text-link">Add a project <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>

        <aside className="feed" aria-label="Latest bulletins">
          <h2>Latest bulletins</h2>
          {loading && <div className="stack" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton--block skeleton--short" />)}</div>}
          {data && (
            <ol>
              {data.posts.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link to={`/users/${p.userId}`}>{insights.names[p.userId]}</Link>
                  <p>{p.title}</p>
                </li>
              ))}
            </ol>
          )}
          {error && <p className="muted">Bulletins are unavailable right now.</p>}
        </aside>
      </section>

      {error && (
        <AlertBanner title="Could not load the overview" message={getErrorMessage(error)} onRetry={retry} />
      )}

      <section className="stats" aria-label="Platform statistics">
        {loading && [0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton--block skeleton--short" />)}
        {stats?.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      <section className="jump">
        <Link to="/users" className="jump__item">
          <Users size={22} aria-hidden="true" />
          <h3>Developer directory</h3>
          <p>Filter by team, sort by experience and save people you work with often.</p>
        </Link>
        <Link to="/projects" className="jump__item">
          <FolderKanban size={22} aria-hidden="true" />
          <h3>Project vault</h3>
          <p>Every project with its stack, owner, status and links, backed by a real API.</p>
        </Link>
        <Link to="/add-post" className="jump__item">
          <PenLine size={22} aria-hidden="true" />
          <h3>Publish a bulletin</h3>
          <p>Share internal documentation with the whole engineering organisation.</p>
        </Link>
      </section>

      {insights && (
        <section className="insights">
          <div className="panel">
            <h2>Bulletins per developer</h2>
            <BarList items={insights.topAuthors} />
          </div>
          <div className="panel">
            <h2>Projects by category</h2>
            <BarList items={insights.categories} emptyText="Add your first project to see this chart." />
          </div>
        </section>
      )}

      {data && data.projects.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Recently updated projects</h2>
            <Link to="/projects" className="text-link">See all <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="grid">
            {data.projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} isFavorite={isFavorite('project', p.id)} onToggleFavorite={(id) => toggle('project', id)} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
