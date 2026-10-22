import axios from 'axios';

// 1) Required client: every call to the public JSONPlaceholder API goes through this instance.
const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2) Second client for our own Express backend (projects vault + auth).
//    In dev it defaults to localhost:5000. In production set VITE_BACKEND_URL, or leave it empty
//    and the app runs in offline mode using localStorage.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? 'http://localhost:5000/api' : '');
export const backendEnabled = Boolean(BACKEND_URL);

export const SESSION_KEY = 'dd_session';

export const backendClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

backendClient.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session?.token && session.mode === 'server') config.headers.Authorization = `Bearer ${session.token}`;
  } catch { /* no stored session */ }
  return config;
});

backendClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(SESSION_KEY)) {
      window.dispatchEvent(new Event('dd:unauthorized'));
    }
    return Promise.reject(err);
  },
);

// Turns any Axios failure into a sentence a person can act on.
export function getErrorMessage(err) {
  if (err?.response) {
    const { status, data } = err.response;
    if (data?.message) return data.message;
    if (status === 404) return 'We could not find what you asked for (404).';
    if (status >= 500) return `The server had a problem (${status}). Try again in a moment.`;
    return `The request was rejected (${status}).`;
  }
  if (err?.code === 'ECONNABORTED') return 'The request took too long. Check your connection and retry.';
  return 'Could not reach the server. Check your connection and retry.';
}

export const isNotFound = (err) => err?.response?.status === 404;

export default apiClient;
