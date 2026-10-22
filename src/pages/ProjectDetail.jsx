import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, GitBranch, Pencil, Trash2, Star, Eye, FolderOpen, Link2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { deleteProject, getProjectById } from '../services/projectService';
import { getErrorMessage, isNotFound } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../utils/formatters';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const { data: project, loading, error, retry } = useFetch(() => getProjectById(id), [id]);
  usePageTitle(project?.name ?? 'Project');

  const back = <Link to="/projects" className="text-link back"><ArrowLeft size={16} aria-hidden="true" /> All projects</Link>;

  if (loading) return <>{back}<SkeletonLoader variant="text" count={5} /></>;

  if (error && isNotFound(error)) {
    return (
      <>
        {back}
        <EmptyState icon={FolderOpen} title="Project not found" message="It may have been deleted or the link is wrong." action={<Link to="/projects" className="btn btn--primary">Open the vault</Link>} />
      </>
    );
  }
  if (error) return <>{back}<AlertBanner title="Could not load this project" message={getErrorMessage(error)} onRetry={retry} /></>;

  const saved = isFavorite('project', project.id);

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteProject(project.id);
      toast.success(`${project.name} was deleted`);
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy(false);
      setConfirming(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {
      toast.error('Copy is blocked in this browser.');
    }
  };

  return (
    <>
      {back}
      <header className="detail-head">
        <div>
          <div className="detail-head__tags">
            <span className="project-card__category">{project.category}</span>
            <span className={`status status--${project.status.toLowerCase().replace(/\s+/g, '-')}`}>{project.status}</span>
            {project.featured && <span className="status status--featured">Featured</span>}
          </div>
          <h1>{project.name}</h1>
          <p className="lead">{project.tagline}</p>
        </div>

        <div className="detail-head__actions">
          <button type="button" className={`btn btn--toggle ${saved ? 'is-on' : ''}`} onClick={() => toggle('project', project.id)} aria-pressed={saved}>
            <Star size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" /> {saved ? 'Saved' : 'Save'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={copyLink}><Link2 size={16} aria-hidden="true" /> Copy link</button>
          {isAuthenticated ? (
            <>
              <Link to={`/projects/${project.id}/edit`} className="btn btn--ghost"><Pencil size={16} aria-hidden="true" /> Edit</Link>
              <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirming(true)}><Trash2 size={16} aria-hidden="true" /> Delete</button>
            </>
          ) : (
            <Link to="/login" state={{ from: { pathname: `/projects/${project.id}/edit` } }} className="btn btn--ghost">Sign in to edit</Link>
          )}
        </div>
      </header>

      <div className="split split--detail">
        <div className="stack stack--lg">
          <section className="panel">
            <h2>About this project</h2>
            <p className="prose">{project.description}</p>
          </section>

          <section className="panel">
            <h2>Technology</h2>
            <ul className="chips">{project.tech.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
          </section>

          {preview && project.liveUrl && (
            <section className="panel">
              <h2>Live preview</h2>
              <iframe title={`${project.name} live preview`} src={project.liveUrl} className="preview-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="lazy" />
              <p className="muted small">If the frame stays blank, the site blocks embedding. Use Open live site instead.</p>
            </section>
          )}
        </div>

        <aside className="stack stack--lg">
          <section className="panel">
            <h2>Links</h2>
            <div className="stack">
              {project.liveUrl && (
                <>
                  <a className="btn btn--primary btn--block" href={project.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" /> Open live site</a>
                  <button type="button" className="btn btn--ghost btn--block" onClick={() => setPreview((p) => !p)} aria-pressed={preview}><Eye size={16} aria-hidden="true" /> {preview ? 'Hide preview' : 'Preview here'}</button>
                </>
              )}
              {project.repoUrl && (
                <a className="btn btn--ghost btn--block" href={project.repoUrl} target="_blank" rel="noopener noreferrer"><GitBranch size={16} aria-hidden="true" /> View repository</a>
              )}
              {!project.liveUrl && !project.repoUrl && (
                <p className="muted">No links yet. {isAuthenticated ? <Link to={`/projects/${project.id}/edit`} className="text-link">Add them</Link> : 'Sign in to add them.'}</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2>Details</h2>
            <dl className="facts">
              <div><dt>Owner</dt><dd><Link to={`/users/${project.ownerId}`}>{project.ownerName}</Link></dd></div>
              <div><dt>Added</dt><dd>{formatDate(project.createdAt)}</dd></div>
              <div><dt>Updated</dt><dd>{formatDate(project.updatedAt)}</dd></div>
            </dl>
          </section>
        </aside>
      </div>

      {confirming && (
        <ConfirmDialog
          title={`Delete ${project.name}?`}
          message="This removes the project from the vault. It cannot be undone."
          confirmLabel="Delete project"
          busy={busy}
          onConfirm={onDelete}
          onCancel={() => !busy && setConfirming(false)}
        />
      )}
    </>
  );
}
