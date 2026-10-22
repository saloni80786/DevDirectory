import { useState } from 'react';
import { Send } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useLocalStorage from '../hooks/useLocalStorage';
import usePageTitle from '../hooks/usePageTitle';
import { getUsers } from '../services/userService';
import { createPost } from '../services/postService';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import AlertBanner from '../components/AlertBanner';
import Avatar from '../components/Avatar';

const LIMITS = { title: { min: 5, max: 80 }, body: { min: 20, max: 500 } };
const EMPTY = { userId: '', title: '', body: '' };

function validate({ userId, title, body }) {
  const errors = {};
  const t = title.trim().length;
  const b = body.trim().length;
  if (!userId) errors.userId = 'Choose the author of this bulletin.';
  if (t < LIMITS.title.min) errors.title = `Title needs at least ${LIMITS.title.min} characters (${t} so far).`;
  else if (t > LIMITS.title.max) errors.title = `Title can be at most ${LIMITS.title.max} characters (${t} now).`;
  if (b < LIMITS.body.min) errors.body = `Content needs at least ${LIMITS.body.min} characters (${b} so far).`;
  else if (b > LIMITS.body.max) errors.body = `Content can be at most ${LIMITS.body.max} characters (${b} now).`;
  return errors;
}

export default function AddPost() {
  usePageTitle('Publish a bulletin');
  const toast = useToast();
  const { data: users, loading: usersLoading, error: usersError, retry: retryUsers } = useFetch(getUsers);

  // Controlled form. The draft survives accidental refreshes.
  const [form, setForm, clearDraft] = useLocalStorage('dd_post_draft', EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [published, setPublished] = useState([]);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;
  const author = users?.find((u) => String(u.id) === String(form.userId));

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const showError = (field) => touched[field] && errors[field];

  const submit = async () => {
    setTouched({ userId: true, title: true, body: true });
    if (!isValid) return;

    setSubmitting(true);
    setBanner(null);
    try {
      const res = await createPost({ title: form.title.trim(), body: form.body.trim(), userId: Number(form.userId) });
      if (res.status === 201) {
        setBanner({ type: 'success', title: 'Bulletin published', message: `"${form.title.trim()}" is now visible to the engineering organisation.` });
        toast.success('Bulletin published');
        setPublished((list) => [{ ...res.data, authorName: author?.name }, ...list]);
        clearDraft();
        setTouched({});
      } else {
        setBanner({ type: 'error', title: 'Unexpected response', message: `The server answered ${res.status} instead of 201 Created.` });
      }
    } catch (err) {
      setBanner({ type: 'error', title: 'Could not publish the bulletin', message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const counter = (field) => {
    const len = form[field].trim().length;
    const { min, max } = LIMITS[field];
    return <span className={`counter ${len < min || len > max ? 'counter--bad' : ''}`}>{len}/{max}</span>;
  };

  return (
    <>
      <header className="page-head">
        <h1>Publish a bulletin</h1>
        <p>Share documentation, release notes or lessons learned with every team.</p>
      </header>

      {banner && <AlertBanner {...banner} onRetry={banner.type === 'error' && isValid ? submit : undefined} onDismiss={() => setBanner(null)} />}
      {usersError && <AlertBanner title="Could not load authors" message={getErrorMessage(usersError)} onRetry={retryUsers} />}

      <div className="split">
        <form className="panel form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="author">Author</label>
            <select id="author" value={form.userId} onChange={update('userId')} onBlur={blur('userId')} disabled={usersLoading || !users} aria-invalid={Boolean(showError('userId'))}>
              <option value="">{usersLoading ? 'Loading developers...' : 'Select an author'}</option>
              {users?.map((u) => <option key={u.id} value={u.id}>{u.name}, {u.company}</option>)}
            </select>
            {showError('userId') && <p className="field__error">{errors.userId}</p>}
          </div>

          <div className="field">
            <div className="field__row"><label htmlFor="title">Title</label>{counter('title')}</div>
            <input id="title" value={form.title} onChange={update('title')} onBlur={blur('title')} placeholder="Release checklist for the payments service" aria-invalid={Boolean(showError('title'))} />
            {showError('title') && <p className="field__error">{errors.title}</p>}
          </div>

          <div className="field">
            <div className="field__row"><label htmlFor="body">Content</label>{counter('body')}</div>
            <textarea id="body" rows={8} value={form.body} onChange={update('body')} onBlur={blur('body')} placeholder="What changed, why it matters, and what readers should do next." aria-invalid={Boolean(showError('body'))} />
            {showError('body') && <p className="field__error">{errors.body}</p>}
          </div>

          <div className="form__actions">
            <button type="submit" className="btn btn--primary" disabled={submitting || !isValid}>
              <Send size={16} aria-hidden="true" /> {submitting ? 'Publishing...' : 'Publish bulletin'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => { clearDraft(); setTouched({}); }}>Clear draft</button>
          </div>
        </form>

        <aside className="stack stack--lg">
          <div className="panel">
            <h2>Preview</h2>
            <div className="preview">
              <div className="preview__author">
                <Avatar name={author?.name ?? '?'} size="sm" />
                <span>{author?.name ?? 'Choose an author'}</span>
              </div>
              <h3>{form.title.trim() || 'Your title appears here'}</h3>
              <p>{form.body.trim() || 'Your content appears here as you type.'}</p>
            </div>
          </div>

          {published.length > 0 && (
            <div className="panel">
              <h2>Published this session</h2>
              <ul className="session-posts">
                {published.map((p) => (
                  <li key={p.id}>
                    <strong>{p.title}</strong>
                    <span>{p.authorName} &middot; id {p.id}</span>
                  </li>
                ))}
              </ul>
              <p className="muted small">JSONPlaceholder accepts the request and returns 201 but does not store it, so these live only in this session.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
