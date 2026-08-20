import db from '../db/database.js';
import paymentService from '../services/paymentService.js';
import { generateId, generateTxnId, generateSlug, success, fail } from '../utils/helpers.js';
import { createNotification } from '../middleware/audit.js';

const getMerchant = (userId) => db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(userId);

export const getOverview = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant profile not found', 404);

  const stats = db
    .prepare(
      `SELECT
        COUNT(*) as totalTransactions,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as totalCollection,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successfulPayments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedPayments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingPayments,
        COALESCE(SUM(CASE WHEN date(created_at) = date('now') AND status = 'success' THEN amount ELSE 0 END), 0) as todayCollection
       FROM transactions WHERE merchant_id = ?`
    )
    .get(merchant.id);

  const recent = db
    .prepare(
      `SELECT * FROM transactions WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 8`
    )
    .all(merchant.id);

  const methodBreakdown = db
    .prepare(
      `SELECT payment_method as method, COUNT(*) as count, COALESCE(SUM(amount),0) as amount
       FROM transactions WHERE merchant_id = ? AND status = 'success'
       GROUP BY payment_method`
    )
    .all(merchant.id);

  const revenueChart = db
    .prepare(
      `SELECT date(created_at) as date, COALESCE(SUM(amount),0) as amount
       FROM transactions
       WHERE merchant_id = ? AND status = 'success' AND created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at) ORDER BY date`
    )
    .all(merchant.id);

  return success(res, {
    merchant: {
      id: merchant.id,
      businessName: merchant.business_name,
      availableSettlement: merchant.available_settlement,
      processingSettlement: merchant.processing_settlement,
      settledAmount: merchant.settled_amount,
    },
    stats,
    recent,
    methodBreakdown,
    revenueChart,
  });
};

export const getTransactions = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant && req.user.role !== 'admin') {
    // user transactions
    let query = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [req.user.id];
    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }
    if (req.query.paymentMethod) {
      query += ' AND payment_method = ?';
      params.push(req.query.paymentMethod);
    }
    if (req.query.q) {
      query += ' AND (id LIKE ? OR recipient LIKE ? OR customer_name LIKE ?)';
      const like = `%${req.query.q}%`;
      params.push(like, like, like);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    return success(res, db.prepare(query).all(...params));
  }

  if (!merchant) return fail(res, 'Merchant not found', 404);

  let query = `SELECT * FROM transactions WHERE merchant_id = ?`;
  const params = [merchant.id];
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.paymentMethod) {
    query += ' AND payment_method = ?';
    params.push(req.query.paymentMethod);
  }
  if (req.query.minAmount) {
    query += ' AND amount >= ?';
    params.push(Number(req.query.minAmount));
  }
  if (req.query.maxAmount) {
    query += ' AND amount <= ?';
    params.push(Number(req.query.maxAmount));
  }
  if (req.query.q) {
    query += ' AND (id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)';
    const like = `%${req.query.q}%`;
    params.push(like, like, like);
  }
  query += ' ORDER BY created_at DESC LIMIT 100';
  return success(res, db.prepare(query).all(...params));
};

export const getTransaction = (req, res) => {
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!txn) return fail(res, 'Transaction not found', 404);
  const refunds = db.prepare('SELECT * FROM refunds WHERE transaction_id = ?').all(txn.id);
  return success(res, { ...txn, refunds });
};

export const createPayment = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant profile required', 403);

  const amount = Number(req.body.amount);
  if (!amount || amount < 1) return fail(res, 'Valid amount required');

  const payment = paymentService.createPayment({
    amount,
    paymentMethod: req.body.paymentMethod || 'upi',
    metadata: req.body,
  });

  const txnId = generateTxnId();
  const status = payment.status === 'success' ? 'success' : 'failed';

  db.prepare(
    `INSERT INTO transactions
      (id, user_id, merchant_id, customer_name, customer_email, customer_mobile, type, amount, fee, total_amount, payment_method, status, settlement_status, note, reference_id)
     VALUES (?, ?, ?, ?, ?, ?, 'payment', ?, 0, ?, ?, ?, ?, ?, ?)`
  ).run(
    txnId,
    req.user.id,
    merchant.id,
    req.body.customerName || 'Guest',
    req.body.customerEmail || null,
    req.body.customerMobile || null,
    amount,
    amount,
    payment.paymentMethod,
    status,
    status === 'success' ? 'unsettled' : null,
    req.body.description || null,
    payment.id
  );

  if (status === 'success') {
    db.prepare(`UPDATE merchants SET available_settlement = available_settlement + ? WHERE id = ?`).run(
      amount,
      merchant.id
    );
  }

  return success(res, { transactionId: txnId, payment, status }, 'Payment processed');
};

export const createRefund = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant && req.user.role !== 'admin') return fail(res, 'Merchant access required', 403);

  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!txn) return fail(res, 'Transaction not found', 404);
  if (txn.status !== 'success' && txn.status !== 'refunded') {
    return fail(res, 'Only successful transactions can be refunded');
  }

  const amount = Number(req.body.amount ?? txn.amount);
  if (amount <= 0 || amount > txn.amount) return fail(res, 'Invalid refund amount');

  const existing = db
    .prepare(`SELECT COALESCE(SUM(amount),0) as total FROM refunds WHERE transaction_id = ? AND status != 'failed'`)
    .get(txn.id);
  if (existing.total + amount > txn.amount) return fail(res, 'Refund exceeds transaction amount');

  const refundId = generateId('rfnd');
  const type = amount >= txn.amount ? 'full' : 'partial';

  db.prepare(
    `INSERT INTO refunds (id, transaction_id, merchant_id, amount, reason, type, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  ).run(refundId, txn.id, merchant?.id || txn.merchant_id, amount, req.body.reason || 'Customer request', type);

  // Simulate async completion
  setTimeout(() => {
    try {
      db.prepare(`UPDATE refunds SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).run(refundId);
      db.prepare(`UPDATE transactions SET status = 'refunded', updated_at = datetime('now') WHERE id = ?`).run(txn.id);
      if (merchant) {
        db.prepare(
          `UPDATE merchants SET available_settlement = MAX(0, available_settlement - ?) WHERE id = ?`
        ).run(amount, merchant.id);
      }
      if (txn.user_id) {
        createNotification(
          txn.user_id,
          'refund_processed',
          'Refund Processed',
          `Refund of ₹${amount} has been completed`
        );
      }
    } catch {
      /* ignore */
    }
  }, 1500);

  return success(res, { refundId, amount, type, status: 'pending' }, 'Refund initiated');
};

export const getRefunds = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const refunds = db
    .prepare(
      `SELECT r.*, t.customer_name, t.id as transaction_ref
       FROM refunds r LEFT JOIN transactions t ON t.id = r.transaction_id
       WHERE r.merchant_id = ? ORDER BY r.created_at DESC`
    )
    .all(merchant.id);
  return success(res, refunds);
};

export const getSettlements = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const settlements = db
    .prepare('SELECT * FROM settlements WHERE merchant_id = ? ORDER BY created_at DESC')
    .all(merchant.id);
  return success(res, {
    available: merchant.available_settlement,
    processing: merchant.processing_settlement,
    settled: merchant.settled_amount,
    history: settlements,
  });
};

export const requestSettlement = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  if (merchant.available_settlement < 1) return fail(res, 'No available settlement balance');

  const amount = merchant.available_settlement;
  const id = generateId('stl');
  const bank = db
    .prepare('SELECT id FROM bank_accounts WHERE user_id = ? AND is_default = 1')
    .get(req.user.id);

  db.prepare(
    `INSERT INTO settlements (id, merchant_id, amount, status, bank_account_id, settlement_date)
     VALUES (?, ?, ?, 'processing', ?, date('now', '+1 day'))`
  ).run(id, merchant.id, amount, bank?.id || null);

  db.prepare(
    `UPDATE merchants SET available_settlement = 0, processing_settlement = processing_settlement + ? WHERE id = ?`
  ).run(amount, merchant.id);

  createNotification(
    req.user.id,
    'settlement_completed',
    'Settlement Initiated',
    `Settlement of ₹${amount.toLocaleString('en-IN')} is processing`
  );

  return success(res, { settlementId: id, amount, status: 'processing' }, 'Settlement requested');
};

export const createPaymentLink = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);

  const amount = Number(req.body.amount);
  if (!amount || amount < 1) return fail(res, 'Valid amount required');

  const id = generateId('plink');
  const slug = generateSlug();

  db.prepare(
    `INSERT INTO payment_links
      (id, merchant_id, customer_name, customer_email, customer_mobile, amount, description, expiry_date, slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    merchant.id,
    req.body.customerName || null,
    req.body.customerEmail || null,
    req.body.customerMobile || null,
    amount,
    req.body.description || null,
    req.body.expiryDate || null,
    slug
  );

  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/pay/${slug}`;
  return success(res, { id, slug, link, amount }, 'Payment link created', 201);
};

export const getPaymentLinks = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const links = db
    .prepare('SELECT * FROM payment_links WHERE merchant_id = ? ORDER BY created_at DESC')
    .all(merchant.id)
    .map((l) => ({
      ...l,
      link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pay/${l.slug}`,
    }));
  return success(res, links);
};

export const disablePaymentLink = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  db.prepare(`UPDATE payment_links SET status = 'disabled' WHERE id = ? AND merchant_id = ?`).run(
    req.params.id,
    merchant.id
  );
  return success(res, null, 'Payment link disabled');
};

export const getPublicPaymentLink = (req, res) => {
  const link = db.prepare(`SELECT * FROM payment_links WHERE slug = ?`).get(req.params.slug);
  if (!link) return fail(res, 'Payment link not found', 404);
  if (link.status !== 'active') return fail(res, 'Payment link is no longer active', 410);
  if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
    return fail(res, 'Payment link has expired', 410);
  }
  const merchant = db.prepare('SELECT business_name FROM merchants WHERE id = ?').get(link.merchant_id);
  return success(res, {
    ...link,
    businessName: merchant?.business_name,
  });
};

export const payPublicLink = (req, res) => {
  const link = db.prepare(`SELECT * FROM payment_links WHERE slug = ? AND status = 'active'`).get(req.params.slug);
  if (!link) return fail(res, 'Invalid payment link', 404);

  const payment = paymentService.createPayment({
    amount: link.amount,
    paymentMethod: req.body.paymentMethod || 'upi',
    metadata: { paymentLinkId: link.id },
  });

  const txnId = generateTxnId();
  const status = payment.status === 'success' ? 'success' : 'failed';

  db.prepare(
    `INSERT INTO transactions
      (id, merchant_id, customer_name, customer_email, customer_mobile, type, amount, fee, total_amount, payment_method, status, settlement_status, note, reference_id)
     VALUES (?, ?, ?, ?, ?, 'payment_link', ?, 0, ?, ?, ?, ?, ?, ?)`
  ).run(
    txnId,
    link.merchant_id,
    link.customer_name,
    link.customer_email,
    link.customer_mobile,
    link.amount,
    link.amount,
    payment.paymentMethod,
    status,
    status === 'success' ? 'unsettled' : null,
    link.description,
    payment.id
  );

  if (status === 'success') {
    db.prepare(
      `UPDATE payment_links SET status = 'paid', paid_at = datetime('now') WHERE id = ?`
    ).run(link.id);
    db.prepare(`UPDATE merchants SET available_settlement = available_settlement + ? WHERE id = ?`).run(
      link.amount,
      link.merchant_id
    );
  }

  return success(res, { transactionId: txnId, status, payment }, status === 'success' ? 'Payment successful' : 'Payment failed');
};

export const createMerchantQr = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);

  const user = req.user;
  const type = req.body.type || 'static';
  const amount = req.body.amount ? Number(req.body.amount) : null;
  const id = generateId('qr');
  const payload = amount
    ? `upi://pay?pa=${user.upi_id}&pn=${encodeURIComponent(merchant.business_name)}&am=${amount}&cu=INR`
    : `upi://pay?pa=${user.upi_id}&pn=${encodeURIComponent(merchant.business_name)}&cu=INR`;

  db.prepare(
    `INSERT INTO qr_codes (id, user_id, merchant_id, type, amount, upi_payload, label)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, merchant.id, type, amount, payload, req.body.label || merchant.business_name);

  return success(res, { id, type, amount, upiId: user.upi_id, payload }, 'QR created', 201);
};

export const getMerchantQr = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const codes = db
    .prepare('SELECT * FROM qr_codes WHERE merchant_id = ? ORDER BY created_at DESC')
    .all(merchant.id);
  return success(res, { upiId: req.user.upi_id, codes });
};

export const getCustomers = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);
  const customers = db
    .prepare(
      `SELECT customer_name as name, customer_email as email, customer_mobile as mobile,
              COUNT(*) as payments, SUM(amount) as total_spent, MAX(created_at) as last_payment
       FROM transactions
       WHERE merchant_id = ? AND customer_name IS NOT NULL
       GROUP BY customer_name, customer_email, customer_mobile
       ORDER BY last_payment DESC`
    )
    .all(merchant.id);
  return success(res, customers);
};

export const getReports = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant not found', 404);

  const daily = db
    .prepare(
      `SELECT date(created_at) as date,
              COUNT(*) as count,
              COALESCE(SUM(CASE WHEN status='success' THEN amount ELSE 0 END),0) as volume,
              SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success,
              SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed
       FROM transactions WHERE merchant_id = ?
       GROUP BY date(created_at) ORDER BY date DESC LIMIT 30`
    )
    .all(merchant.id);

  return success(res, { daily });
};

export const getMerchantProfile = (req, res) => {
  const merchant = getMerchant(req.user.id);
  if (!merchant) return fail(res, 'Merchant profile not found', 404);

  const bank = db
    .prepare(
      `SELECT account_holder, account_number, ifsc, bank_name
       FROM bank_accounts WHERE user_id = ? ORDER BY is_default DESC, created_at DESC LIMIT 1`
    )
    .get(req.user.id);

  return success(res, {
    id: merchant.id,
    merchantId: merchant.id,
    businessName: merchant.business_name,
    name: merchant.business_name,
    businessType: merchant.business_type,
    gstin: merchant.gstin,
    gstNumber: merchant.gstin,
    settlementCycle: merchant.settlement_cycle,
    email: req.user.email,
    mobile: req.user.mobile,
    phone: req.user.mobile,
    address: bank
      ? `${bank.bank_name} · ${bank.ifsc}`
      : null,
    bank: bank || null,
  });
};
