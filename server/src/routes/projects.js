import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { validateProject } from '../validators.js';

const router = Router();

// GET /api/projects?q=&category=&status=&ownerId=
router.get('/', (req, res) => {
  const { q = '', category, status, ownerId } = req.query;
  const needle = String(q).toLowerCase();

  const list = db.projects
    .filter((p) => !category || p.category === category)
    .filter((p) => !status || p.status === status)
    .filter((p) => !ownerId || String(p.ownerId) === String(ownerId))
    .filter((p) => !needle || [p.name, p.tagline, p.ownerName, ...p.tech].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  res.json(list);
});

router.get('/:id', (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  res.json(project);
});

router.post('/', requireAuth, (req, res) => {
  const { errors, value } = validateProject(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ message: 'Check the highlighted fields.', errors });

  const stamp = new Date().toISOString();
  const project = { id: crypto.randomUUID(), ...value, createdAt: stamp, updatedAt: stamp };
  db.projects.unshift(project);
  db.save();
  res.status(201).json(project);
});

router.post('/import', requireAuth, (req, res) => {
  const incoming = Array.isArray(req.body?.projects) ? req.body.projects : null;
  if (!incoming) return res.status(400).json({ message: 'Send { "projects": [...] }.' });

  const added = [];
  let skipped = 0;
  for (const item of incoming) {
    const { errors, value } = validateProject(item);
    if (Object.keys(errors).length) { skipped += 1; continue; }
    const stamp = new Date().toISOString();
    added.push({ id: crypto.randomUUID(), ...value, createdAt: stamp, updatedAt: stamp });
  }
  db.projects.unshift(...added);
  db.save();
  res.status(201).json({ imported: added.length, skipped });
});

router.put('/:id', requireAuth, (req, res) => {
  const index = db.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Project not found.' });

  const { errors, value } = validateProject(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ message: 'Check the highlighted fields.', errors });

  db.projects[index] = { ...db.projects[index], ...value, updatedAt: new Date().toISOString() };
  db.save();
  res.json(db.projects[index]);
});

router.delete('/:id', requireAuth, (req, res) => {
  const index = db.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Project not found.' });
  const [removed] = db.projects.splice(index, 1);
  db.save();
  res.json(removed);
});

export default router;
