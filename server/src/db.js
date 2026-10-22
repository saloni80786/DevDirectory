import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { seedProjects } from './seed.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const file = path.join(dir, 'db.json');

let state;

const initial = () => ({
  users: [
    {
      id: 'u-demo',
      name: 'Demo Admin',
      email: 'admin@devdirectory.in',
      role: 'admin',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
    },
  ],
  projects: seedProjects,
});

function persist() {
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, file); // atomic swap so a crash never leaves half a file
}

export function loadDb() {
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    state = initial();
    persist();
  }
  return state;
}

export const db = {
  get users() { return state.users; },
  get projects() { return state.projects; },
  save: persist,
};
