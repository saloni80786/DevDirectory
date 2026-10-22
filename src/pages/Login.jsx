import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginRequest, registerRequest } from '../services/authService';
import { getErrorMessage } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import AlertBanner from '../components/AlertBanner';
import { Logo } from '../components/Navbar';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = { email: 'admin@devdirectory.in', password: 'Admin@123' };

export default function Login() {
  usePageTitle('Sign in');
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // Where the guest was heading before the guard intercepted them.
  const from = location.state?.from;
  const target = typeof from === 'string' ? from : from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : '/';

  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) return <Navigate to={target} replace />;

  const registering = mode === 'register';
  const errors = {};
  if (registering && form.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!emailRx.test(form.email)) errors.email = 'Enter a valid email address.';
  if (form.password.length < (registering ? 6 : 4)) errors.password = `Password needs at least ${registering ? 6 : 4} characters.`;
  const valid = Object.keys(errors).length === 0;

  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }));

  const submit = async (credentials) => {
    setBusy(true);
    setError(null);
    try {
      const session = registering && !credentials
        ? await registerRequest(form)
        : await loginRequest(credentials ?? form);
      login(session); // the Navigate above then returns the user to the page they originally asked for
      toast.success(`Welcome, ${session.name}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (valid) submit();
  };

  return (
    <div className="auth">
      <div className="panel auth__card">
        <Logo />
        <h1>{registering ? 'Create your account' : 'Sign in to DevDirectory'}</h1>
        <p className="muted">
          {from ? 'Sign in to continue. We will take you right back.' : 'Sign in to publish bulletins and manage projects.'}
        </p>

        {error && <AlertBanner title="Could not sign you in" message={error} onDismiss={() => setError(null)} />}

        <form className="form" onSubmit={onSubmit} noValidate>
          {registering && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" autoComplete="name" value={form.name} onChange={update('name')} onBlur={blur('name')} aria-invalid={Boolean(touched.name && errors.name)} />
              {touched.name && errors.name && <p className="field__error">{errors.name}</p>}
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} onBlur={blur('email')} aria-invalid={Boolean(touched.email && errors.email)} />
            {touched.email && errors.email && <p className="field__error">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} value={form.password} onChange={update('password')} onBlur={blur('password')} aria-invalid={Boolean(touched.password && errors.password)} />
            {touched.password && errors.password && <p className="field__error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {registering ? <UserPlus size={16} aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
            {busy ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {!registering && (
          <button type="button" className="btn btn--ghost btn--block" disabled={busy} onClick={() => submit(DEMO)}>
            Continue with the demo account
          </button>
        )}

        <p className="auth__switch">
          {registering ? 'Already registered?' : 'New here?'}{' '}
          <button type="button" className="text-btn" onClick={() => { setMode(registering ? 'signin' : 'register'); setError(null); setTouched({}); }}>
            {registering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}
