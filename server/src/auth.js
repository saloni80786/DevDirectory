import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_TTL } from './config.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Your session expired. Sign in again.' });
  }
}
