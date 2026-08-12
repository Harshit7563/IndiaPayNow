import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import db, { initSchema } from './database.js';
import { generateId, generateTxnId } from '../utils/helpers.js';

dotenv.config();
initSchema();

const clear = () => {
  const tables = [
    'api_logs', 'complaints', 'otp_codes', 'sessions', 'login_history', 'audit_logs',
    'notifications', 'webhooks', 'api_keys', 'qr_codes', 'payment_links', 'settlements',
    'refunds', 'payments', 'transactions', 'bank_accounts', 'customers', 'contacts',
    'merchants', 'users',
  ];
  for (const t of tables) {
    try {
      db.prepare(`DELETE FROM ${t}`).run();
    } catch {
      /* ignore */
    }
  }
};

clear();

const hash = bcrypt.hashSync('Password@123', 10);

const adminId = generateId('usr');
const userId = generateId('usr');
const merchantUserId = generateId('usr');
const merchantId = generateId('mrc');

db.prepare(
  `INSERT INTO users (id, full_name, email, mobile, password_hash, role, upi_id, wallet_balance, kyc_status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run(adminId, 'Admin User', 'admin@indiapaynow.com', '9999999999', hash, 'admin', 'admin@indpaynow', 0, 'verified');

db.prepare(
  `INSERT INTO users (id, full_name, email, mobile, password_hash, role, upi_id, wallet_balance, kyc_status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run(userId, 'Harshit Sharma', 'harshit@indiapaynow.com', '9876543210', hash, 'user', 'harshit@indpaynow', 12580.5, 'verified');

db.prepare(
  `INSERT INTO users (id, full_name, email, mobile, password_hash, role, upi_id, wallet_balance, kyc_status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run(merchantUserId, 'Priya Merchants', 'merchant@indiapaynow.com', '9123456780', hash, 'merchant', 'priya@indpaynow', 4500, 'verified');

db.prepare(
  `INSERT INTO merchants (id, user_id, business_name, business_type, gstin, available_settlement, processing_settlement, settled_amount)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
).run(merchantId, merchantUserId, 'Priya Retail Store', 'Retail', '29AAAAA0000A1Z5', 45200, 12000, 285000);

db.prepare(
  `INSERT INTO bank_accounts (id, user_id, account_holder, account_number, ifsc, bank_name, is_default)
   VALUES (?, ?, ?, ?, ?, ?, 1)`
).run(generateId('bnk'), userId, 'Harshit Sharma', '123456789012', 'HDFC0001234', 'HDFC Bank');

db.prepare(
  `INSERT INTO bank_accounts (id, user_id, account_holder, account_number, ifsc, bank_name, is_default)
   VALUES (?, ?, ?, ?, ?, ?, 1)`
).run(generateId('bnk'), merchantUserId, 'Priya Merchants', '987654321098', 'ICIC0000456', 'ICICI Bank');

const contacts = [
  ['Rahul Verma', '9811111111', 'rahul@indpaynow'],
  ['Ananya Patel', '9822222222', 'ananya@okicici'],
  ['Vikram Singh', '9833333333', 'vikram@oksbi'],
];
for (const [name, mobile, upi] of contacts) {
  db.prepare(`INSERT INTO contacts (id, user_id, name, mobile, upi_id) VALUES (?, ?, ?, ?, ?)`).run(
    generateId('cnt'),
    userId,
    name,
    mobile,
    upi
  );
}

const txnTypes = [
  ['send_money', 500, 'success', 'rahul@indpaynow', 'Lunch'],
  ['send_money', 1200, 'success', 'ananya@okicici', 'Rent share'],
  ['add_money', 5000, 'success', null, 'Wallet top-up'],
  ['mobile_recharge', 299, 'success', '9876543210', 'Jio recharge'],
  ['electricity_bill', 1450, 'success', 'BESCOM-8821', 'Electricity'],
  ['send_money', 50, 'failed', 'unknown@upi', 'Test'],
];

for (const [type, amount, status, recipient, note] of txnTypes) {
  db.prepare(
    `INSERT INTO transactions (id, user_id, type, amount, fee, total_amount, payment_method, status, recipient, note, created_at)
     VALUES (?, ?, ?, ?, 0, ?, 'wallet', ?, ?, ?, datetime('now', ?))`
  ).run(
    generateTxnId(),
    userId,
    type,
    amount,
    amount,
    status,
    recipient,
    note,
    `-${Math.floor(Math.random() * 5)} days`
  );
}

const customers = [
  ['Amit Kumar', 'amit@email.com', '9900112233', 2500],
  ['Sneha Reddy', 'sneha@email.com', '9900223344', 1800],
  ['Rohan Das', 'rohan@email.com', '9900334455', 3200],
  ['Meera Iyer', 'meera@email.com', '9900445566', 950],
  ['Kabir Khan', 'kabir@email.com', '9900556677', 4100],
];

for (const [name, email, mobile, amount] of customers) {
  const status = Math.random() > 0.1 ? 'success' : 'failed';
  db.prepare(
    `INSERT INTO transactions
      (id, user_id, merchant_id, customer_name, customer_email, customer_mobile, type, amount, fee, total_amount, payment_method, status, settlement_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'payment', ?, 0, ?, ?, ?, ?, datetime('now', ?))`
  ).run(
    generateTxnId(),
    merchantUserId,
    merchantId,
    name,
    email,
    mobile,
    amount,
    amount,
    ['upi', 'card', 'netbanking', 'wallet'][Math.floor(Math.random() * 4)],
    status,
    status === 'success' ? 'unsettled' : null,
    `-${Math.floor(Math.random() * 10)} days`
  );
}

// More merchant volume for charts
for (let i = 0; i < 20; i++) {
  const amount = Math.round((Math.random() * 4000 + 200) * 100) / 100;
  db.prepare(
    `INSERT INTO transactions
      (id, merchant_id, customer_name, type, amount, fee, total_amount, payment_method, status, settlement_status, created_at)
     VALUES (?, ?, ?, 'payment', ?, 0, ?, ?, 'success', 'unsettled', datetime('now', ?))`
  ).run(
    generateTxnId(),
    merchantId,
    `Customer ${i + 1}`,
    amount,
    amount,
    ['upi', 'card', 'netbanking'][i % 3],
    `-${i % 7} days`
  );
}

db.prepare(
  `INSERT INTO payment_links (id, merchant_id, customer_name, customer_email, customer_mobile, amount, description, slug, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`
).run(
  generateId('plink'),
  merchantId,
  'Amit Kumar',
  'amit@email.com',
  '9900112233',
  1500,
  'Invoice #INV-204',
  'demo204'
);

db.prepare(
  `INSERT INTO settlements (id, merchant_id, amount, status, settlement_date, created_at)
   VALUES (?, ?, ?, 'settled', date('now', '-3 days'), datetime('now', '-3 days'))`
).run(generateId('stl'), merchantId, 85000);

db.prepare(
  `INSERT INTO settlements (id, merchant_id, amount, status, settlement_date, created_at)
   VALUES (?, ?, ?, 'processing', date('now', '+1 day'), datetime('now', '-1 day'))`
).run(generateId('stl'), merchantId, 12000);

db.prepare(
  `INSERT INTO refunds (id, transaction_id, merchant_id, amount, reason, type, status)
   VALUES (?, ?, ?, ?, ?, 'partial', 'completed')`
).run(
  generateId('rfnd'),
  db.prepare(`SELECT id FROM transactions WHERE merchant_id = ? AND status = 'success' LIMIT 1`).get(merchantId).id,
  merchantId,
  200,
  'Product return'
);

db.prepare(
  `INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)`
).run(generateId('ntf'), userId, 'money_received', 'Money Received', 'You received ₹500 from Rahul Verma');

db.prepare(
  `INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)`
).run(generateId('ntf'), userId, 'payment_success', 'Recharge Successful', 'Jio recharge of ₹299 was successful');

db.prepare(
  `INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)`
).run(generateId('ntf'), merchantUserId, 'settlement_completed', 'Settlement Completed', '₹85,000 settled to your bank account');

db.prepare(
  `INSERT INTO api_logs (id, merchant_id, method, path, status_code, duration_ms)
   VALUES (?, ?, 'POST', '/api/payments/create', 200, 42)`
).run(generateId('log'), merchantId);

db.prepare(
  `INSERT INTO api_logs (id, merchant_id, method, path, status_code, duration_ms)
   VALUES (?, ?, 'GET', '/api/transactions', 200, 18)`
).run(generateId('log'), merchantId);

db.prepare(
  `INSERT INTO complaints (id, user_id, subject, description, status)
   VALUES (?, ?, ?, ?, ?)`
).run(generateId('cmp'), userId, 'Delayed refund', 'Refund initiated 3 days ago still pending', 'open');

console.log('✅ Seed complete');
console.log('');
console.log('Demo accounts (password: Password@123)');
console.log('  User:     harshit@indiapaynow.com / 9876543210');
console.log('  Merchant: merchant@indiapaynow.com / 9123456780');
console.log('  Admin:    admin@indiapaynow.com / 9999999999');
console.log('  Demo OTP: 123456');
