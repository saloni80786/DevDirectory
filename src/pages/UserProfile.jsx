import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, Star, ArrowLeft, Briefcase, UserX, FolderKanban } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { getUserById } from '../services/userService';
import { getPostsByUser } from '../services/postService';
import { getProjects } from '../services/projectService';
import { getErrorMessage, isNotFound } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import Avatar from '../components/Avatar';
import ProjectCard from '../components/ProjectCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import { pluralize } from '../utils/formatters';

export default function UserProfile() {
  const { id } = useParams();
  const { isFavorite, toggle } = useFavorites();
  const [postQuery, setPostQuery] = useState('');

  const { data, loading, error, retry } = useFetch(async ({ signal }) => {
    const [user, posts, projects] = await Promise.all([
      getUserById(id, { signal }),
      getPostsByUser(id, { signal }),
      getProjects().catch(() => []),
    ]);
    return { user, posts, projects: projects.filter((p) => String(p.ownerId) === String(user.id)) };
  }, [id]);

  usePageTitle(data?.user.name ?? 'Developer');

  const posts = useMemo(() => {
    const q = postQuery.trim().toLowerCase();
    return (data?.posts ?? []).filter((p) => !q || `${p.title} ${p.body}`.toLowerCase().includes(q));
  }, [data, postQuery]);

  const back = (
    <Link to="/users" className="text-link back"><ArrowLeft size={16} aria-hidden="true" /> All developers</Link>
  );

  if (loading) return <>{back}<SkeletonLoader variant="profile" /></>;

  if (error && isNotFound(error)) {
    return (
      <>
        {back}
        <EmptyState
          icon={UserX}
          title="That developer does not exist"
          message={`There is no developer with id "${id}". The link may be outdated.`}
          action={<Link to="/users" className="btn btn--primary">Browse the directory</Link>}
        />
      </>
    );
  }

  if (error) {
    return <>{back}<AlertBanner title="Could not load this profile" message={getErrorMessage(error)} onRetry={retry} /></>;
  }

  const { user } = data;
  const saved = isFavorite('user', user.id);

  return (
    <>
      {back}
      <div className="profile-layout">
        <aside className="panel profile-card">
          <Avatar name={user.name} size="xl" highlighted={saved} />
          <h1>{user.name}</h1>
          <p className="muted">{user.role}</p>

          <button type="button" className={`btn btn--toggle btn--block ${saved ? 'is-on' : ''}`} onClick={() => toggle('user', user.id)} aria-pressed={saved}>
            <Star size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" /> {saved ? 'Saved' : 'Save developer'}
          </button>

          <ul className="meta-list meta-list--stacked">
            <li><Building2 size={16} aria-hidden="true" /> {user.company}</li>
            <li><MapPin size={16} aria-hidden="true" /> {user.city}{user.state ? `, ${user.state}` : ''}</li>
            <li><Briefcase size={16} aria-hidden="true" /> {pluralize(user.experience, 'year')} of experience</li>
            <li><Mail size={16} aria-hidden="true" /> <a href={`mailto:${user.email}`}>{user.email}</a></li>
            <li><Phone size={16} aria-hidden="true" /> {user.phone}</li>
          </ul>
        </aside>

        <div className="stack stack--lg">
          <section className="panel">
            <h2>About</h2>
            <p>{user.bio || 'No biography added yet.'}</p>
            {user.skills.length > 0 && (
              <ul className="chips">{user.skills.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
            )}
          </section>

          <section>
            <div className="section-head">
              <h2>Bulletins ({data.posts.length})</h2>
              {data.posts.length > 3 && (
                <input type="search" className="inline-search" value={postQuery} onChange={(e) => setPostQuery(e.target.value)} placeholder="Filter bulletins" aria-label="Filter bulletins" />
              )}
            </div>
            {posts.length === 0 ? (
              <p className="muted">{data.posts.length === 0 ? `${user.name} has not published anything yet.` : 'No bulletin matches that filter.'}</p>
            ) : (
              <div className="stack">
                {posts.map((p) => (
                  <details key={p.id} className="post">
                    <summary>{p.title}</summary>
                    <p>{p.body}</p>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="section-head"><h2>Projects ({data.projects.length})</h2></div>
            {data.projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects in the vault"
                message={`Projects owned by ${user.name} will show up here.`}
                action={<Link to="/add-project" className="btn btn--ghost">Add a project</Link>}
              />
            ) : (
              <div className="grid grid--2">
                {data.projects.map((p) => (
                  <ProjectCard key={p.id} project={p} isFavorite={isFavorite('project', p.id)} onToggleFavorite={(pid) => toggle('project', pid)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
