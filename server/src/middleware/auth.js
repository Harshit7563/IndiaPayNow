import jwt from 'jsonwebtoken';
import { fail } from '../utils/helpers.js';
import db from '../db/database.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 'Authentication required', 401);
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(decoded.userId);
    if (!user) return fail(res, 'User not found or inactive', 401);
    req.user = user;
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, 'Insufficient permissions', 403);
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    } catch {
      /* ignore */
    }
  }
  next();
};
