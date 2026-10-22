import { backendClient, backendEnabled } from './api';
import { makeId } from '../utils/formatters';

/* The vault talks to the Express backend. If it is unreachable (static hosting, server stopped),
   every call transparently falls back to localStorage so the app keeps working. */

const LOCAL_KEY = 'dd_projects';
const stamp = () => new Date().toISOString();

const SEEDS = [
  { id: 'seed-newslens', name: 'NewsLens', tagline: 'A fast news reader with category tabs, search and bookmarks.', description: 'Frontend news application that pulls headlines from a public news API. Includes category tabs, instant search, a bookmarks list and a distraction-free reading mode. Edit this entry to add your own repository and live links.', category: 'Web App', status: 'Live', tech: ['React', 'Axios', 'REST API', 'CSS'], repoUrl: '', liveUrl: '', ownerId: 1, ownerName: 'Aarav Sharma', featured: true },
  { id: 'seed-taskflow', name: 'TaskFlow', tagline: 'Todo manager with filters, priorities and saved state.', description: 'A todo application with add, edit, complete and delete actions, filters for all, active and done, and persistence in localStorage. Edit this entry to add your own repository and live links.', category: 'Tool', status: 'Live', tech: ['React', 'Context API', 'localStorage'], repoUrl: '', liveUrl: '', ownerId: 2, ownerName: 'Priya Iyer', featured: false },
  { id: 'seed-devdirectory', name: 'DevDirectory', tagline: 'The engineering portal you are looking at right now.', description: 'Directory of engineers, bulletin publishing and this project vault. React 18 with React Router 6 on the front, an Express API with JWT auth and file storage behind it, and the JSONPlaceholder API for developer data.', category: 'Web App', status: 'In progress', tech: ['React', 'React Router', 'Axios', 'Express', 'JWT'], repoUrl: '', liveUrl: '', ownerId: 5, ownerName: 'Vikram Singh Rathore', featured: true },
].map((p) => ({ ...p, createdAt: '2026-01-10T09:00:00.000Z', updatedAt: '2026-01-10T09:00:00.000Z' }));

/* ---- storage mode (online = Express, offline = localStorage) ---- */
let mode = backendEnabled ? 'checking' : 'offline';
const listeners = new Set();
const setMode = (next) => {
  if (next === mode) return;
  mode = next;
  listeners.forEach((l) => l());
};
export const subscribeMode = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getMode = () => mode;

export async function pingBackend() {
  if (!backendEnabled) return setMode('offline');
  try {
    await backendClient.get('/health');
    setMode('online');
  } catch {
    setMode('offline');
  }
}

/* ---- local store ---- */
const readLocal = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY));
    if (Array.isArray(raw)) return raw;
  } catch { /* fall through to seeds */ }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(SEEDS));
  return SEEDS;
};
const writeLocal = (list) => localStorage.setItem(LOCAL_KEY, JSON.stringify(list));

const notFound = () => Object.assign(new Error('Project not found.'), { response: { status: 404, data: { message: 'Project not found.' } } });

const local = {
  list: () => [...readLocal()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  get: (id) => {
    const found = readLocal().find((p) => p.id === id);
    if (!found) throw notFound();
    return found;
  },
  create: (payload) => {
    const project = { ...payload, id: makeId(), createdAt: stamp(), updatedAt: stamp() };
    writeLocal([project, ...readLocal()]);
    return project;
  },
  update: (id, payload) => {
    const all = readLocal();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) throw notFound();
    all[index] = { ...all[index], ...payload, id, updatedAt: stamp() };
    writeLocal(all);
    return all[index];
  },
  remove: (id) => {
    const all = readLocal();
    if (!all.some((p) => p.id === id)) throw notFound();
    writeLocal(all.filter((p) => p.id !== id));
    return { id };
  },
  import: (items) => {
    const fresh = items.map((p) => ({ ...p, id: makeId(), createdAt: stamp(), updatedAt: stamp() }));
    writeLocal([...fresh, ...readLocal()]);
    return { imported: fresh.length, skipped: 0 };
  },
};

async function run(remote, fallback) {
  if (!backendEnabled) return fallback();
  try {
    const res = await remote();
    setMode('online');
    return res.data;
  } catch (err) {
    if (err.response) throw err; // real HTTP answer (404, 422...) is shown to the user
    setMode('offline');
    return fallback();
  }
}

export const getProjects = () => run(() => backendClient.get('/projects'), local.list);
export const getProjectById = (id) => run(() => backendClient.get(`/projects/${id}`), () => local.get(id));
export const createProject = (payload) => run(() => backendClient.post('/projects', payload), () => local.create(payload));
export const updateProject = (id, payload) => run(() => backendClient.put(`/projects/${id}`, payload), () => local.update(id, payload));
export const deleteProject = (id) => run(() => backendClient.delete(`/projects/${id}`), () => local.remove(id));
export const importProjects = (projects) => run(() => backendClient.post('/projects/import', { projects }), () => local.import(projects));

export const CATEGORIES = ['Web App', 'Mobile', 'API', 'Tool', 'Data', 'Design', 'Other'];
export const STATUSES = ['Live', 'In progress', 'Prototype', 'Archived'];
