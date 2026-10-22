import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { getUsers } from '../services/userService';
import { CATEGORIES, STATUSES, createProject, getProjectById, updateProject } from '../services/projectService';
import { getErrorMessage, isNotFound } from '../services/api';
import { useToast } from '../context/ToastContext';
import AlertBanner from '../components/AlertBanner';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { isHttpUrl } from '../utils/formatters';

const EMPTY = {
  name: '', tagline: '', description: '', category: 'Web App', status: 'In progress',
  tech: [], techInput: '', repoUrl: '', liveUrl: '', ownerId: '', featured: false,
};

// One-click starting points for the kinds of small projects people usually add first.
const TEMPLATES = {
  'News frontend': {
    name: 'NewsLens', tagline: 'A fast news reader with category tabs, search and bookmarks.',
    description: 'Frontend news application that pulls headlines from a public news API. Includes category tabs, instant search, a bookmarks list and a reading mode.',
    category: 'Web App', status: 'Live', tech: ['React', 'Axios', 'REST API'],
  },
  'Todo app': {
    name: 'TaskFlow', tagline: 'Todo manager with filters, priorities and saved state.',
    description: 'A todo application with add, edit, complete and delete actions, filters for all, active and done, and persistence in localStorage.',
    category: 'Tool', status: 'Live', tech: ['React', 'Context API', 'localStorage'],
  },
};

const toForm = (p) => ({ ...EMPTY, ...p, tech: [...p.tech], ownerId: String(p.ownerId), techInput: '' });

// Mirrors the server rules so people see problems before the request is sent.
function validate(f) {
  const e = {};
  const len = (s) => s.trim().length;
  if (len(f.name) < 3 || len(f.name) > 60) e.name = 'Name must be 3 to 60 characters.';
  if (len(f.tagline) < 10 || len(f.tagline) > 120) e.tagline = 'Tagline must be 10 to 120 characters.';
  if (len(f.description) < 30 || len(f.description) > 1000) e.description = `Description must be 30 to 1000 characters (${len(f.description)} now).`;
  if (f.tech.length === 0) e.tech = 'Add at least one technology.';
  if (!f.ownerId) e.ownerId = 'Choose an owner.';
  if (f.repoUrl.trim() && !isHttpUrl(f.repoUrl.trim())) e.repoUrl = 'Use a full link starting with http:// or https://';
  if (f.liveUrl.trim() && !isHttpUrl(f.liveUrl.trim())) e.liveUrl = 'Use a full link starting with http:// or https://';
  return e;
}

// Defined at module level so inputs keep focus between keystrokes.
function Field({ name, label, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}

export default function AddProject() {
  const { id } = useParams();
  const editing = Boolean(id);
  usePageTitle(editing ? 'Edit project' : 'Add project');

  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [busy, setBusy] = useState(false);

  const users = useFetch(getUsers);
  const existing = useFetch(() => (editing ? getProjectById(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (existing.data) setForm(toForm(existing.data));
  }, [existing.data]);

  const errors = { ...validate(form), ...serverErrors };
  const show = (field) => (touched[field] || touched.all) && errors[field];

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setServerErrors((s) => ({ ...s, [field]: undefined }));
  };
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const addTech = () => {
    const parts = form.techInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!parts.length) return;
    setForm((f) => ({ ...f, tech: [...new Set([...f.tech, ...parts])].slice(0, 12), techInput: '' }));
  };
  const removeTech = (t) => setForm((f) => ({ ...f, tech: f.tech.filter((x) => x !== t) }));

  const applyTemplate = (key) => setForm((f) => ({ ...f, ...TEMPLATES[key], techInput: '' }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ all: true });
    setSubmitError(null);
    if (Object.values(validate(form)).some(Boolean)) return;

    const owner = users.data?.find((u) => String(u.id) === String(form.ownerId));
    const payload = {
      name: form.name.trim(), tagline: form.tagline.trim(), description: form.description.trim(),
      category: form.category, status: form.status, tech: form.tech,
      repoUrl: form.repoUrl.trim(), liveUrl: form.liveUrl.trim(),
      ownerId: Number(form.ownerId), ownerName: owner?.name ?? '', featured: form.featured,
    };

    setBusy(true);
    try {
      const saved = editing ? await updateProject(id, payload) : await createProject(payload);
      toast.success(editing ? 'Project updated' : 'Project added to the vault');
      navigate(`/projects/${saved.id}`);
    } catch (err) {
      if (err.response?.data?.errors) setServerErrors(err.response.data.errors);
      setSubmitError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const back = <Link to={editing ? `/projects/${id}` : '/projects'} className="text-link back"><ArrowLeft size={16} aria-hidden="true" /> Back</Link>;

  if (editing && existing.loading) return <>{back}<SkeletonLoader variant="text" count={6} /></>;
  if (editing && existing.error) {
    return (
      <>
        {back}
        {isNotFound(existing.error)
          ? <EmptyState title="Project not found" message="There is nothing to edit here." action={<Link to="/projects" className="btn btn--primary">Open the vault</Link>} />
          : <AlertBanner title="Could not load the project" message={getErrorMessage(existing.error)} onRetry={existing.retry} />}
      </>
    );
  }

  const err = (name) => (show(name) ? errors[name] : undefined);

  return (
    <>
      {back}
      <header className="page-head">
        <h1>{editing ? `Edit ${existing.data?.name ?? 'project'}` : 'Add a project'}</h1>
        <p>{editing ? 'Update the details and save.' : 'Store a project with its stack, owner and links so the whole organisation can find it.'}</p>
      </header>

      {!editing && (
        <div className="templates">
          <span>Start from</span>
          {Object.keys(TEMPLATES).map((k) => (
            <button key={k} type="button" className="btn btn--ghost btn--small" onClick={() => applyTemplate(k)}>{k}</button>
          ))}
        </div>
      )}

      {submitError && <AlertBanner title="Could not save the project" message={submitError} onDismiss={() => setSubmitError(null)} />}
      {users.error && <AlertBanner title="Could not load owners" message={getErrorMessage(users.error)} onRetry={users.retry} />}

      <form className="panel form form--wide" onSubmit={onSubmit} noValidate>
        <div className="form__grid">
          <Field name="name" error={err('name')} label="Project name">
            <input id="name" value={form.name} onChange={set('name')} onBlur={blur('name')} aria-invalid={Boolean(show('name'))} />
          </Field>
          <Field name="ownerId" error={err('ownerId')} label="Owner">
            <select id="ownerId" value={form.ownerId} onChange={set('ownerId')} onBlur={blur('ownerId')} disabled={users.loading || !users.data} aria-invalid={Boolean(show('ownerId'))}>
              <option value="">{users.loading ? 'Loading developers...' : 'Select an owner'}</option>
              {users.data?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
        </div>

        <Field name="tagline" error={err('tagline')} label="Tagline" hint="One sentence that says what it does.">
          <input id="tagline" value={form.tagline} onChange={set('tagline')} onBlur={blur('tagline')} aria-invalid={Boolean(show('tagline'))} />
        </Field>

        <Field name="description" error={err('description')} label="Description">
          <textarea id="description" rows={6} value={form.description} onChange={set('description')} onBlur={blur('description')} aria-invalid={Boolean(show('description'))} />
        </Field>

        <div className="form__grid">
          <Field name="category" error={err('category')} label="Category">
            <select id="category" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field name="status" error={err('status')} label="Status">
            <select id="status" value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        </div>

        <Field name="tech" error={err('tech')} label="Technologies" hint="Type a name and press Enter. Commas add several at once.">
          <div className="tag-input">
            {form.tech.map((t) => (
              <span key={t} className="chip chip--removable">
                {t}
                <button type="button" onClick={() => removeTech(t)} aria-label={`Remove ${t}`}><X size={12} /></button>
              </span>
            ))}
            <input
              id="tech" value={form.techInput} placeholder={form.tech.length ? '' : 'React, Express, MongoDB'}
              onChange={set('techInput')} onBlur={() => { blur('tech')(); addTech(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech(); } }}
            />
            <button type="button" className="icon-btn" onClick={addTech} aria-label="Add technology"><Plus size={16} /></button>
          </div>
        </Field>

        <div className="form__grid">
          <Field name="repoUrl" error={err('repoUrl')} label="Repository link" hint="Optional">
            <input id="repoUrl" type="url" value={form.repoUrl} onChange={set('repoUrl')} onBlur={blur('repoUrl')} placeholder="https://github.com/you/project" aria-invalid={Boolean(show('repoUrl'))} />
          </Field>
          <Field name="liveUrl" error={err('liveUrl')} label="Live site link" hint="Optional">
            <input id="liveUrl" type="url" value={form.liveUrl} onChange={set('liveUrl')} onBlur={blur('liveUrl')} placeholder="https://your-project.netlify.app" aria-invalid={Boolean(show('liveUrl'))} />
          </Field>
        </div>

        <label className="check">
          <input type="checkbox" checked={form.featured} onChange={set('featured')} />
          <span>Feature this project</span>
        </label>

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add to vault'}</button>
          <Link to={editing ? `/projects/${id}` : '/projects'} className="btn btn--ghost">Cancel</Link>
        </div>
      </form>
    </>
  );
}
