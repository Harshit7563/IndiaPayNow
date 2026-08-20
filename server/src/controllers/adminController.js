import db from '../db/database.js';
import { success, fail } from '../utils/helpers.js';

export const getDashboard = (_req, res) => {
  const users = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'user'`).get().c;
  const merchants = db.prepare(`SELECT COUNT(*) as c FROM merchants`).get().c;
  const today = db
    .prepare(
      `SELECT
        COUNT(*) as todayTransactions,
        COALESCE(SUM(CASE WHEN status='success' THEN amount ELSE 0 END),0) as todayVolume,
        SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending
       FROM transactions WHERE date(created_at) = date('now')`
    )
    .get();
  const settlements = db
    .prepare(`SELECT COALESCE(SUM(amount),0) as total FROM settlements`)
    .get().total;

  return success(res, {
    totalUsers: users,
    activeMerchants: merchants,
    todayTransactions: today.todayTransactions,
    todayVolume: today.todayVolume,
    successfulTransactions: today.successful,
    failedTransactions: today.failed,
    pendingTransactions: today.pending,
    totalSettlements: settlements,
  });
};

export const getUsers = (_req, res) => {
  const users = db
    .prepare(
      `SELECT id, full_name, email, mobile, role, kyc_status, is_active, wallet_balance, created_at
       FROM users ORDER BY created_at DESC`
    )
    .all();
  return success(res, users);
};

export const getMerchants = (_req, res) => {
  const merchants = db
    .prepare(
      `SELECT m.*, u.full_name, u.email, u.mobile, u.kyc_status
       FROM merchants m JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC`
    )
    .all();
  return success(res, merchants);
};

export const getAllTransactions = (req, res) => {
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  query += ' ORDER BY created_at DESC LIMIT 200';
  return success(res, db.prepare(query).all(...params));
};

export const getAllRefunds = (_req, res) => {
  const refunds = db.prepare('SELECT * FROM refunds ORDER BY created_at DESC LIMIT 200').all();
  return success(res, refunds);
};

export const getAllSettlements = (_req, res) => {
  const settlements = db.prepare('SELECT * FROM settlements ORDER BY created_at DESC LIMIT 200').all();
  return success(res, settlements);
};

export const getKyc = (_req, res) => {
  const list = db
    .prepare(
      `SELECT id, full_name, email, mobile, role, kyc_status, created_at FROM users ORDER BY created_at DESC`
    )
    .all();
  return success(res, list);
};

export const updateKyc = (req, res) => {
  const { status } = req.body;
  if (!['pending', 'verified', 'rejected'].includes(status)) return fail(res, 'Invalid KYC status');
  db.prepare(`UPDATE users SET kyc_status = ?, updated_at = datetime('now') WHERE id = ?`).run(
    status,
    req.params.id
  );
  return success(res, null, 'KYC updated');
};

export const getComplaints = (_req, res) => {
  const complaints = db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all();
  return success(res, complaints);
};

export const getApiLogs = (_req, res) => {
  const logs = db.prepare('SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 200').all();
  return success(res, logs);
};

export const getSettings = (_req, res) =>
  success(res, {
    maintenanceMode: false,
    testModeDefault: true,
    maxTransferLimit: 100000,
    settlementCycle: 'T+1',
    supportEmail: 'connect@indiapaynow.in',
  });

export const toggleUser = (req, res) => {
  const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'User not found', 404);
  db.prepare(`UPDATE users SET is_active = ? WHERE id = ?`).run(user.is_active ? 0 : 1, req.params.id);
  return success(res, null, 'User status updated');
};
