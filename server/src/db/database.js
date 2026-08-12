import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/indiapaynow.db');
const dbDir = path.dirname(path.resolve(dbPath));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','merchant','admin')),
      upi_id TEXT UNIQUE,
      wallet_balance REAL NOT NULL DEFAULT 0,
      avatar_url TEXT,
      two_fa_enabled INTEGER NOT NULL DEFAULT 0,
      kyc_status TEXT NOT NULL DEFAULT 'pending',
      is_active INTEGER NOT NULL DEFAULT 1,
      email_notifications INTEGER NOT NULL DEFAULT 1,
      sms_notifications INTEGER NOT NULL DEFAULT 1,
      payment_notifications INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      business_name TEXT NOT NULL,
      business_type TEXT,
      gstin TEXT,
      settlement_cycle TEXT DEFAULT 'T+1',
      available_settlement REAL NOT NULL DEFAULT 0,
      processing_settlement REAL NOT NULL DEFAULT 0,
      settled_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      name TEXT NOT NULL,
      email TEXT,
      mobile TEXT,
      total_spent REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_holder TEXT NOT NULL,
      account_number TEXT NOT NULL,
      ifsc TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      merchant_id TEXT REFERENCES merchants(id),
      customer_name TEXT,
      customer_email TEXT,
      customer_mobile TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      settlement_status TEXT DEFAULT 'unsettled',
      note TEXT,
      recipient TEXT,
      recipient_type TEXT,
      reference_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT REFERENCES transactions(id),
      provider_ref TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      payment_method TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id),
      merchant_id TEXT REFERENCES merchants(id),
      amount REAL NOT NULL,
      reason TEXT,
      type TEXT NOT NULL DEFAULT 'full',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'processing',
      bank_account_id TEXT REFERENCES bank_accounts(id),
      settlement_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payment_links (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      customer_name TEXT,
      customer_email TEXT,
      customer_mobile TEXT,
      amount REAL NOT NULL,
      description TEXT,
      expiry_date TEXT,
      slug TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      merchant_id TEXT REFERENCES merchants(id),
      type TEXT NOT NULL DEFAULT 'static',
      amount REAL,
      upi_payload TEXT NOT NULL,
      label TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      secret_hint TEXT,
      mode TEXT NOT NULL DEFAULT 'test',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      url TEXT NOT NULL,
      events TEXT NOT NULL,
      secret_hint TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      ip_address TEXT,
      device TEXT,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      device TEXT,
      ip_address TEXT,
      last_active TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      mobile TEXT,
      upi_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      subject TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mandates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      biller TEXT NOT NULL,
      amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      status TEXT NOT NULL DEFAULT 'active',
      next_debit TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      value TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_logs (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      method TEXT,
      path TEXT,
      status_code INTEGER,
      duration_ms INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_payment_links_slug ON payment_links(slug);
    CREATE INDEX IF NOT EXISTS idx_refunds_merchant ON refunds(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_settlements_merchant ON settlements(merchant_id);
  `);
}

export default db;
