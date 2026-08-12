import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateId, success, fail } from '../utils/helpers.js';

const getMerchant = (userId) => db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(userId);

export const listApiKeys = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const keys = db
    .prepare(
      `SELECT id, name, key_prefix, secret_hint, mode, is_active, last_used_at, created_at
       FROM api_keys WHERE merchant_id = ? ORDER BY created_at DESC`
    )
    .all(merchant.id);
  return success(res, keys);
};

export const createApiKey = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);

  const mode = req.body.mode === 'live' ? 'live' : 'test';
  const rawKey = `ipn_${mode}_${crypto.randomBytes(24).toString('hex')}`;
  const rawSecret = crypto.randomBytes(32).toString('hex');
  const id = generateId('key');
  const prefix = rawKey.slice(0, 16);
  const keyHash = bcrypt.hashSync(rawKey, 10);

  db.prepare(
    `INSERT INTO api_keys (id, merchant_id, name, key_prefix, key_hash, secret_hint, mode)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, merchant.id, req.body.name || 'Default Key', prefix, keyHash, `****${rawSecret.slice(-4)}`, mode);

  // Secret shown only once
  return success(
    res,
    {
      id,
      key: rawKey,
      secret: rawSecret,
      mode,
      warning: 'Store the secret securely. It will not be shown again.',
    },
    'API key created',
    201
  );
};

export const revokeApiKey = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  db.prepare(`UPDATE api_keys SET is_active = 0 WHERE id = ? AND merchant_id = ?`).run(
    req.params.id,
    merchant.id
  );
  return success(res, null, 'API key revoked');
};

export const regenerateSecret = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const key = db
    .prepare('SELECT * FROM api_keys WHERE id = ? AND merchant_id = ? AND is_active = 1')
    .get(req.params.id, merchant.id);
  if (!key) return fail(res, 'API key not found', 404);

  const rawSecret = crypto.randomBytes(32).toString('hex');
  db.prepare(`UPDATE api_keys SET secret_hint = ? WHERE id = ?`).run(`****${rawSecret.slice(-4)}`, key.id);

  return success(res, {
    id: key.id,
    secret: rawSecret,
    warning: 'Store the secret securely. It will not be shown again.',
  }, 'Secret regenerated');
};

export const listWebhooks = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const hooks = db.prepare('SELECT * FROM webhooks WHERE merchant_id = ?').all(merchant.id);
  return success(res, hooks);
};

export const createWebhook = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  if (!req.body.url) return fail(res, 'Webhook URL required');

  const id = generateId('wh');
  const secret = crypto.randomBytes(16).toString('hex');
  db.prepare(
    `INSERT INTO webhooks (id, merchant_id, url, events, secret_hint)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    id,
    merchant.id,
    req.body.url,
    JSON.stringify(req.body.events || ['payment.success', 'payment.failed', 'refund.completed']),
    `****${secret.slice(-4)}`
  );

  return success(res, { id, secret, warning: 'Secret shown only once' }, 'Webhook created', 201);
};

export const getApiLogs = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const logs = db
    .prepare('SELECT * FROM api_logs WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(merchant.id);
  return success(res, logs);
};

export const getDocs = (_req, res) =>
  success(res, {
    baseUrl: '/api',
    auth: 'Bearer token or X-API-Key header',
    endpoints: [
      { method: 'POST', path: '/api/payments/create', description: 'Create a payment' },
      { method: 'GET', path: '/api/payments/:id', description: 'Get payment status' },
      { method: 'POST', path: '/api/payments/:id/refund', description: 'Refund a payment' },
      { method: 'GET', path: '/api/transactions', description: 'List transactions' },
      { method: 'POST', path: '/api/payment-links', description: 'Create payment link' },
    ],
    sdks: [
      { name: 'Node.js', install: 'npm install @indiapaynow/node' },
      { name: 'Python', install: 'pip install indiapaynow' },
      { name: 'PHP', install: 'composer require indiapaynow/sdk' },
    ],
  });
