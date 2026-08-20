import { Router } from 'express';
import {
  register,
  login,
  verifyOtp,
  requestOtpLogin,
  resendOtp,
  me,
  registerValidators,
  loginValidators,
} from '../controllers/authController.js';
import {
  getWallet,
  addMoney,
  transfer,
  getContacts,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  updatePreferences,
  requestTwoFaOtp,
  confirmTwoFa,
  changePassword,
  getBankAccounts,
  addBankAccount,
  removeBankAccount,
  getLoginHistory,
  getSessions,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/userController.js';
import {
  getOverview,
  getTransactions,
  getTransaction,
  createPayment,
  createRefund,
  getRefunds,
  getSettlements,
  requestSettlement,
  createPaymentLink,
  getPaymentLinks,
  disablePaymentLink,
  getPublicPaymentLink,
  payPublicLink,
  createMerchantQr,
  getMerchantQr,
  getCustomers,
  getReports,
} from '../controllers/merchantController.js';
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  regenerateSecret,
  listWebhooks,
  createWebhook,
  getApiLogs,
  getDocs,
} from '../controllers/developerController.js';
import {
  getDashboard,
  getUsers,
  getMerchants,
  getAllTransactions,
  getAllRefunds,
  getAllSettlements,
  getKyc,
  updateKyc,
  getComplaints,
  getApiLogs as getAdminApiLogs,
  getSettings,
  toggleUser,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import { uploadAvatarMiddleware } from '../middleware/upload.js';
import db from '../db/database.js';
import { generateId, success, fail } from '../utils/helpers.js';
import { signToken, sanitizeUser } from '../controllers/authController.js';
import { fetchPnrStatus } from '../services/pnrService.js';
import { getLiveFxRates } from '../services/fxService.js';
import {
  verifyPan,
  verifyAadhaar,
  verifyGstin,
  lookupPincode,
  lookupIfsc,
} from '../services/indiaKyc.js';

const router = Router();

// Auth
router.post('/auth/register', registerValidators, validate, auditLog('register', 'user'), register);
router.post('/auth/login', loginValidators, validate, auditLog('login', 'user'), login);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/otp-login', requestOtpLogin);
router.post('/auth/resend-otp', resendOtp);
router.get('/auth/me', authenticate, me);

// User
router.get('/user/profile', authenticate, me);
router.put('/user/profile', authenticate, updateProfile);
router.post('/user/avatar', authenticate, (req, res, next) => {
  uploadAvatarMiddleware(req, res, (err) => {
    if (err) return fail(res, err.message || 'Upload failed', 400);
    return uploadAvatar(req, res);
  });
});
router.delete('/user/avatar', authenticate, removeAvatar);
router.put('/user/preferences', authenticate, updatePreferences);
router.post('/user/2fa/request-otp', authenticate, requestTwoFaOtp);
router.post('/user/2fa/confirm', authenticate, confirmTwoFa);
router.put('/user/password', authenticate, changePassword);
router.get('/user/bank-accounts', authenticate, getBankAccounts);
router.post('/user/bank-accounts', authenticate, addBankAccount);
router.delete('/user/bank-accounts/:id', authenticate, removeBankAccount);
router.get('/user/login-history', authenticate, getLoginHistory);
router.get('/user/sessions', authenticate, getSessions);
router.get('/user/contacts', authenticate, getContacts);

// Wallet
router.get('/wallet', authenticate, getWallet);
router.post('/wallet/add-money', authenticate, auditLog('add_money', 'wallet'), addMoney);
router.post('/wallet/transfer', authenticate, auditLog('transfer', 'wallet'), transfer);

// Bills / recharge mock
router.post('/services/pay', authenticate, (req, res) => {
  const { service, amount, account } = req.body;
  const amt = Number(amount);
  if (!service || !amt) return res.status(400).json({ success: false, message: 'Invalid request' });
  if (req.user.wallet_balance < amt) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }
  const txnId = `IPN${Date.now().toString(36).toUpperCase()}`;
  db.prepare(
    `INSERT INTO transactions (id, user_id, type, amount, fee, total_amount, payment_method, status, recipient, note)
     VALUES (?, ?, ?, ?, 0, ?, 'wallet', 'success', ?, ?)`
  ).run(txnId, req.user.id, service, amt, amt, account || service, `${service} payment`);
  db.prepare(`UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?`).run(amt, req.user.id);
  return success(res, { transactionId: txnId, status: 'success' }, 'Payment successful');
});

// PNR status (RapidAPI freemium — RAPIDAPI_KEY in server/.env)
router.get('/services/pnr/:pnr', authenticate, async (req, res) => {
  try {
    const data = await fetchPnrStatus(req.params.pnr);
    return success(res, data, data.live ? 'PNR status fetched' : 'PNR status (demo mode)');
  } catch (error) {
    return fail(res, error.message || 'Could not fetch PNR status', error.status || 400);
  }
});

router.post('/services/pnr', authenticate, async (req, res) => {
  try {
    const data = await fetchPnrStatus(req.body?.pnr);
    return success(res, data, data.live ? 'PNR status fetched' : 'PNR status (demo mode)');
  } catch (error) {
    return fail(res, error.message || 'Could not fetch PNR status', error.status || 400);
  }
});

router.post('/merchant/activate', authenticate, (req, res) => {
  let merchant = db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(req.user.id);
  if (!merchant) {
    const id = generateId('mrc');
    db.prepare(
      `INSERT INTO merchants (id, user_id, business_name, business_type, available_settlement)
       VALUES (?, ?, ?, 'Retail', 0)`
    ).run(id, req.user.id, `${req.user.full_name}'s Business`);
    merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(id);
  }
  if (req.user.role === 'user') {
    db.prepare(`UPDATE users SET role = 'merchant', updated_at = datetime('now') WHERE id = ?`).run(req.user.id);
  }
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const token = signToken(updated.id, updated.role);
  return success(res, { merchantId: merchant.id, role: updated.role, token, user: sanitizeUser(updated) }, 'Business tools enabled');
});

router.get('/mandates', authenticate, (req, res) => {
  const rows = db.prepare('SELECT * FROM mandates WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return success(res, rows);
});

router.post('/mandates', authenticate, (req, res) => {
  const { biller, amount, frequency } = req.body;
  if (!biller || !Number(amount)) return res.status(400).json({ success: false, message: 'Biller and amount required' });
  const id = generateId('mdt');
  db.prepare(
    `INSERT INTO mandates (id, user_id, biller, amount, frequency, next_debit)
     VALUES (?, ?, ?, ?, ?, date('now', '+1 month'))`
  ).run(id, req.user.id, biller, Number(amount), frequency || 'monthly');
  return success(res, { id }, 'Autopay mandate created', 201);
});

router.delete('/mandates/:id', authenticate, (req, res) => {
  db.prepare(`UPDATE mandates SET status = 'cancelled' WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
  return success(res, null, 'Mandate cancelled');
});

router.get('/kyc/pincode/:pin', async (req, res) => {
  try {
    const data = await lookupPincode(req.params.pin);
    if (!data.valid) return fail(res, data.message, 400);
    return success(res, data, 'PIN verified with India Post');
  } catch {
    return fail(res, 'Could not verify PIN right now. Try again.', 502);
  }
});

router.post('/kyc/pan', (req, res) => {
  const data = verifyPan(req.body?.pan, { intent: req.body?.intent });
  if (!data.valid) return fail(res, data.message, 400);
  return success(res, data, `PAN verified · ${data.holderType}`);
});

router.post('/kyc/aadhaar', (req, res) => {
  const data = verifyAadhaar(req.body?.aadhaar);
  if (!data.valid) return fail(res, data.message, 400);
  return success(res, data, 'Aadhaar checksum verified');
});

router.post('/kyc/gstin', (req, res) => {
  const data = verifyGstin(req.body?.gstin);
  if (!data.valid) return fail(res, data.message, 400);
  if (data.empty) return success(res, data, 'GSTIN skipped');
  return success(res, data, `GSTIN verified · ${data.state}`);
});

router.get('/kyc/ifsc/:code', async (req, res) => {
  try {
    const data = await lookupIfsc(req.params.code);
    if (!data.valid) return fail(res, data.message, 400);
    return success(res, data, `${data.bank} · ${data.branch}`);
  } catch {
    return fail(res, 'Could not verify IFSC right now.', 502);
  }
});

router.post('/kyc', authenticate, (req, res) => {
  const pan = verifyPan(req.body?.pan, { intent: req.user.role === 'merchant' ? 'business' : 'personal' });
  const aadhaar = verifyAadhaar(req.body?.aadhaar);
  if (!pan.valid) return fail(res, pan.message, 400);
  if (!aadhaar.valid) return fail(res, aadhaar.message, 400);
  db.prepare(`UPDATE users SET kyc_status = 'verified', updated_at = datetime('now') WHERE id = ?`).run(req.user.id);
  return success(
    res,
    { kycStatus: 'verified', pan: pan.pan, holderType: pan.holderType, aadhaarLast4: aadhaar.last4 },
    'KYC verified',
  );
});

router.post('/support', authenticate, (req, res) => {
  const { subject, description } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: 'Subject required' });
  const id = generateId('cmp');
  db.prepare(`INSERT INTO complaints (id, user_id, subject, description, status) VALUES (?, ?, ?, ?, 'open')`).run(
    id,
    req.user.id,
    subject,
    description || '',
  );
  return success(res, { id }, 'Ticket created', 201);
});

router.get('/support', authenticate, (req, res) => {
  const rows = db.prepare('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return success(res, rows);
});

router.get('/rewards', authenticate, (req, res) => {
  let rows = db.prepare('SELECT * FROM rewards WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  if (!rows.length) {
    const seed = [
      ['cashback', 'Wallet cashback', '₹50'],
      ['coupon', 'Flat ₹100 off on recharge', '₹100'],
      ['points', 'Loyalty points', '420 pts'],
      ['offer', '1% extra on gold', '1%'],
    ];
    for (const [type, title, value] of seed) {
      db.prepare(`INSERT INTO rewards (id, user_id, type, title, value) VALUES (?, ?, ?, ?, ?)`).run(
        generateId('rwd'),
        req.user.id,
        type,
        title,
        value
      );
    }
    rows = db.prepare('SELECT * FROM rewards WHERE user_id = ?').all(req.user.id);
  }
  return success(res, rows);
});

// Payments
router.post('/payments/create', authenticate, authorize('merchant', 'admin'), createPayment);
router.get('/payments/:id', authenticate, getTransaction);
router.post('/payments/:id/refund', authenticate, authorize('merchant', 'admin'), createRefund);

// Transactions
router.get('/transactions', authenticate, getTransactions);
router.get('/transactions/:id', authenticate, getTransaction);

// Payment links
router.post('/payment-links', authenticate, authorize('merchant', 'admin'), createPaymentLink);
router.get('/payment-links', authenticate, authorize('merchant', 'admin'), getPaymentLinks);
router.delete('/payment-links/:id', authenticate, authorize('merchant', 'admin'), disablePaymentLink);
router.get('/public/pay/:slug', getPublicPaymentLink);
router.post('/public/pay/:slug', payPublicLink);

// Settlements & reports
router.get('/settlements', authenticate, authorize('merchant', 'admin'), getSettlements);
router.post('/settlements/request', authenticate, authorize('merchant', 'admin'), requestSettlement);
router.get('/reports', authenticate, authorize('merchant', 'admin'), getReports);
router.get('/refunds', authenticate, authorize('merchant', 'admin'), getRefunds);
router.get('/merchant/overview', authenticate, authorize('merchant', 'admin'), getOverview);
router.get('/merchant/customers', authenticate, authorize('merchant', 'admin'), getCustomers);
router.post('/merchant/qr', authenticate, authorize('merchant', 'admin'), createMerchantQr);
router.get('/merchant/qr', authenticate, authorize('merchant', 'admin'), getMerchantQr);

// Receive money QR for users
router.get('/user/qr', authenticate, (req, res) => {
  const payload = `upi://pay?pa=${req.user.upi_id}&pn=${encodeURIComponent(req.user.full_name)}&cu=INR`;
  return success(res, {
    upiId: req.user.upi_id,
    payload,
    name: req.user.full_name,
  });
});

// Developer
router.get('/developer/api-keys', authenticate, authorize('merchant', 'admin'), listApiKeys);
router.post('/developer/api-keys', authenticate, authorize('merchant', 'admin'), createApiKey);
router.delete('/developer/api-keys/:id', authenticate, authorize('merchant', 'admin'), revokeApiKey);
router.post('/developer/api-keys/:id/regenerate', authenticate, authorize('merchant', 'admin'), regenerateSecret);
router.get('/developer/webhooks', authenticate, authorize('merchant', 'admin'), listWebhooks);
router.post('/developer/webhooks', authenticate, authorize('merchant', 'admin'), createWebhook);
router.get('/developer/logs', authenticate, authorize('merchant', 'admin'), getApiLogs);
router.get('/developer/docs', authenticate, getDocs);

// Notifications
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/read-all', authenticate, markAllNotificationsRead);
router.put('/notifications/:id/read', authenticate, markNotificationRead);

// Admin
router.get('/admin/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/admin/users', authenticate, authorize('admin'), getUsers);
router.post('/admin/users/:id/toggle', authenticate, authorize('admin'), toggleUser);
router.get('/admin/merchants', authenticate, authorize('admin'), getMerchants);
router.get('/admin/transactions', authenticate, authorize('admin'), getAllTransactions);
router.get('/admin/refunds', authenticate, authorize('admin'), getAllRefunds);
router.get('/admin/settlements', authenticate, authorize('admin'), getAllSettlements);
router.get('/admin/kyc', authenticate, authorize('admin'), getKyc);
router.put('/admin/kyc/:id', authenticate, authorize('admin'), updateKyc);
router.get('/admin/complaints', authenticate, authorize('admin'), getComplaints);
router.get('/admin/api-logs', authenticate, authorize('admin'), getAdminApiLogs);
router.get('/admin/settings', authenticate, authorize('admin'), getSettings);

// Health
router.get('/health', (_req, res) => success(res, { status: 'ok', service: 'India Pay Now API' }));

router.get('/fx/rates', async (_req, res) => {
  try {
    const data = await getLiveFxRates();
    return success(res, data, data.live ? 'Live FX rates' : 'FX rates (cached / fallback)');
  } catch {
    return fail(res, 'Could not fetch live FX rates', 502);
  }
});

export default router;
