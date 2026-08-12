import { generateId } from '../utils/helpers.js';
import db from '../db/database.js';

export const auditLog = (action, resource = null) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      if (body?.success !== false) {
        db.prepare(
          `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          generateId('aud'),
          req.user?.id || null,
          action,
          resource,
          req.params?.id || null,
          req.ip,
          req.get('user-agent') || null,
          JSON.stringify({ method: req.method, path: req.originalUrl })
        );
      }
    } catch {
      /* non-blocking */
    }
    return originalJson(body);
  };
  next();
};

export const createNotification = (userId, type, title, message, metadata = {}) => {
  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(generateId('ntf'), userId, type, title, message, JSON.stringify(metadata));
};
