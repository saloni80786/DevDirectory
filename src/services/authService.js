import { backendClient, backendEnabled } from './api';

const mockSession = ({ name, email }) => ({
  id: `local-${email}`,
  name: name || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  email,
  role: 'member',
  token: `mock-${Date.now().toString(36)}`,
  mode: 'mock',
});

async function viaServer(path, body, fallback) {
  if (!backendEnabled) return fallback();
  try {
    const { data } = await backendClient.post(path, body);
    return { ...data.user, token: data.token, mode: 'server' };
  } catch (err) {
    if (err.response) throw err; // wrong password etc. must be shown, not bypassed
    return fallback(); // backend not running: simulate the session as the lab brief allows
  }
}

export const loginRequest = ({ email, password }) =>
  viaServer('/auth/login', { email, password }, () => mockSession({ email }));

export const registerRequest = ({ name, email, password }) =>
  viaServer('/auth/register', { name, email, password }, () => mockSession({ name, email }));
