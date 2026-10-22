import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PORT, CLIENT_ORIGIN } from './src/config.js';
import { loadDb, db } from './src/db.js';
import authRoutes from './src/routes/auth.js';
import projectRoutes from './src/routes/projects.js';

loadDb();

const app = express();
app.use(helmet());
app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:4173'] }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 200, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/api/stats', (_req, res) => {
  const count = (key) => db.projects.reduce((acc, p) => ({ ...acc, [p[key]]: (acc[p[key]] || 0) + 1 }), {});
  res.json({
    projects: db.projects.length,
    featured: db.projects.filter((p) => p.featured).length,
    byCategory: count('category'),
    byStatus: count('status'),
  });
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 50, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`DevDirectory API ready on http://localhost:${PORT}/api`);
  console.log('Demo login: admin@devdirectory.in / Admin@123');
});
