import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import db from '../db/database.js';
import paymentService from '../services/paymentService.js';
import { generateId, generateTxnId, success, fail } from '../utils/helpers.js';
import { createNotification } from '../middleware/audit.js';
import { avatarsDir } from '../middleware/upload.js';
import { sanitizeUser } from './authController.js';
import { issueAndSendOtp } from '../services/smsOtp.js';

const removeLocalAvatar = (avatarUrl) => {
  if (!avatarUrl) return;
  const match = avatarUrl.match(/\/(?:api\/)?uploads\/avatars\/([^/?#]+)$/);
  if (!match) return;
  const filePath = path.join(avatarsDir, match[1]);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

export const getWallet = (req, res) => {
  const user = db.prepare('SELECT wallet_balance, upi_id FROM users WHERE id = ?').get(req.user.id);
  const recent = db
    .prepare(
      `SELECT id, type, amount, status, recipient, note, payment_method, created_at
       FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`
    )
    .all(req.user.id);

  return success(res, {
    balance: user.wallet_balance,
    upiId: user.upi_id,
    recentTransactions: recent,
  });
};

export const addMoney = (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount < 1 || amount > 100000) {
    return fail(res, 'Amount must be between ₹1 and ₹1,00,000');
  }

  const payment = paymentService.createPayment({
    amount,
    paymentMethod: req.body.paymentMethod || 'upi',
    metadata: { purpose: 'add_money', userId: req.user.id },
  });

  if (payment.status !== 'success') {
    return fail(res, 'Payment failed. Please try again.', 402);
  }

  const txnId = generateTxnId();
  const fee = 0;
  db.prepare(
    `INSERT INTO transactions (id, user_id, type, amount, fee, total_amount, payment_method, status, note, reference_id)
     VALUES (?, ?, 'add_money', ?, ?, ?, ?, 'success', ?, ?)`
  ).run(txnId, req.user.id, amount, fee, amount, payment.paymentMethod, 'Wallet top-up', payment.id);

  db.prepare(`UPDATE users SET wallet_balance = wallet_balance + ?, updated_at = datetime('now') WHERE id = ?`).run(
    amount,
    req.user.id
  );

  createNotification(
    req.user.id,
    'payment_success',
    'Money Added',
    `₹${amount.toLocaleString('en-IN')} added to your wallet`
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, {
    transactionId: txnId,
    balance: updated.wallet_balance,
    payment,
  }, 'Money added successfully');
};

export const transfer = (req, res) => {
  const { recipient, recipientType, amount, note, paymentMethod = 'wallet', otp } = req.body;
  const amt = Number(amount);

  if (!recipient || !amt || amt < 1) return fail(res, 'Valid recipient and amount required');

  const demoOtp = process.env.OTP_DEMO_CODE || '123456';
  if (otp !== demoOtp) return fail(res, 'Invalid OTP. Use demo OTP 123456', 400);

  if (paymentMethod === 'wallet' && req.user.wallet_balance < amt) {
    return fail(res, 'Insufficient wallet balance', 400);
  }

  const fee = amt > 10000 ? Math.round(amt * 0.001 * 100) / 100 : 0;
  const total = amt + fee;
  const txnId = generateTxnId();

  const payment = paymentService.createPayment({
    amount: total,
    paymentMethod,
    metadata: { purpose: 'transfer', recipient, recipientType },
  });

  if (payment.status !== 'success') {
    db.prepare(
      `INSERT INTO transactions (id, user_id, type, amount, fee, total_amount, payment_method, status, recipient, recipient_type, note, reference_id)
       VALUES (?, ?, 'send_money', ?, ?, ?, ?, 'failed', ?, ?, ?, ?)`
    ).run(txnId, req.user.id, amt, fee, total, paymentMethod, recipient, recipientType || 'upi', note || null, payment.id);
    createNotification(req.user.id, 'payment_failed', 'Transfer Failed', `Transfer of ₹${amt} failed`);
    return fail(res, 'Transfer failed', 402);
  }

  if (paymentMethod === 'wallet') {
    db.prepare(`UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?`).run(total, req.user.id);
  }

  // Credit recipient if they exist on platform
  let recipientUser = null;
  if (recipientType === 'mobile') {
    recipientUser = db.prepare('SELECT * FROM users WHERE mobile = ?').get(recipient);
  } else if (recipientType === 'upi') {
    recipientUser = db.prepare('SELECT * FROM users WHERE upi_id = ?').get(recipient.toLowerCase());
  }

  if (recipientUser) {
    db.prepare(`UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`).run(amt, recipientUser.id);
    createNotification(
      recipientUser.id,
      'money_received',
      'Money Received',
      `You received ₹${amt.toLocaleString('en-IN')} from ${req.user.full_name}`
    );
  }

  db.prepare(
    `INSERT INTO transactions (id, user_id, type, amount, fee, total_amount, payment_method, status, recipient, recipient_type, note, reference_id)
     VALUES (?, ?, 'send_money', ?, ?, ?, ?, 'success', ?, ?, ?, ?)`
  ).run(txnId, req.user.id, amt, fee, total, paymentMethod, recipient, recipientType || 'upi', note || null, payment.id);

  createNotification(
    req.user.id,
    'money_sent',
    'Money Sent',
    `₹${amt.toLocaleString('en-IN')} sent to ${recipient}`
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, {
    transactionId: txnId,
    amount: amt,
    fee,
    total,
    recipient,
    balance: updated.wallet_balance,
    status: 'success',
  }, 'Transfer successful');
};

export const getContacts = (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts WHERE user_id = ? ORDER BY name').all(req.user.id);
  return success(res, contacts);
};

export const updateProfile = (req, res) => {
  const { fullName, email, mobile, avatarUrl } = req.body;
  db.prepare(
    `UPDATE users SET
      full_name = COALESCE(?, full_name),
      email = COALESCE(?, email),
      mobile = COALESCE(?, mobile),
      avatar_url = COALESCE(?, avatar_url),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(fullName || null, email?.toLowerCase() || null, mobile || null, avatarUrl || null, req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, sanitizeUser(user), 'Profile updated');
};

export const uploadAvatar = (req, res) => {
  if (!req.file) return fail(res, 'Please choose a profile photo', 400);

  const avatarUrl = `/api/uploads/avatars/${req.file.filename}`;
  removeLocalAvatar(req.user.avatar_url);

  db.prepare(`UPDATE users SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?`).run(
    avatarUrl,
    req.user.id
  );

  createNotification(req.user.id, 'security', 'Profile photo updated', 'Your profile picture was changed.');

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, sanitizeUser(user), 'Profile photo updated');
};

export const removeAvatar = (req, res) => {
  removeLocalAvatar(req.user.avatar_url);
  db.prepare(`UPDATE users SET avatar_url = NULL, updated_at = datetime('now') WHERE id = ?`).run(req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, sanitizeUser(user), 'Profile photo removed');
};

export const updatePreferences = (req, res) => {
  const { emailNotifications, smsNotifications, paymentNotifications } = req.body;
  // twoFaEnabled requires OTP confirmation via /user/2fa/* endpoints
  db.prepare(
    `UPDATE users SET
      email_notifications = COALESCE(?, email_notifications),
      sms_notifications = COALESCE(?, sms_notifications),
      payment_notifications = COALESCE(?, payment_notifications),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    emailNotifications === undefined ? null : emailNotifications ? 1 : 0,
    smsNotifications === undefined ? null : smsNotifications ? 1 : 0,
    paymentNotifications === undefined ? null : paymentNotifications ? 1 : 0,
    req.user.id
  );
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(res, sanitizeUser(user), 'Preferences updated');
};

export const requestTwoFaOtp = async (req, res) => {
  const enable = !!req.body.enable;
  const currentlyEnabled = !!req.user.two_fa_enabled;

  if (enable === currentlyEnabled) {
    return fail(res, enable ? '2FA is already enabled' : '2FA is already disabled');
  }

  const mobile = req.user.mobile;
  if (!mobile) return fail(res, 'No mobile number on this account', 400);

  const purpose = enable ? 'enable_2fa' : 'disable_2fa';

  try {
    const sent = await issueAndSendOtp(mobile, purpose);
    createNotification(
      req.user.id,
      'security',
      enable ? '2FA enable OTP' : '2FA disable OTP',
      `OTP sent to ${sent.mobileMasked} to ${enable ? 'enable' : 'disable'} two-factor authentication.`
    );

    return success(
      res,
      {
        mobile: sent.mobile,
        mobileMasked: sent.mobileMasked,
        enable,
        expiresIn: sent.expiresIn,
      },
      `OTP sent to ${sent.mobileMasked}`
    );
  } catch (error) {
    return fail(res, error.message || 'Could not send OTP', error.status || 502);
  }
};

export const confirmTwoFa = (req, res) => {
  const enable = !!req.body.enable;
  const code = String(req.body.code || '').trim();
  const currentlyEnabled = !!req.user.two_fa_enabled;

  if (enable === currentlyEnabled) {
    return fail(res, enable ? '2FA is already enabled' : '2FA is already disabled');
  }
  if (!/^\d{6}$/.test(code)) return fail(res, 'Enter a valid 6-digit OTP', 400);

  const mobile = req.user.mobile;
  if (!mobile) return fail(res, 'No mobile number on this account', 400);

  const purpose = enable ? 'enable_2fa' : 'disable_2fa';
  const otp = db
    .prepare(
      `SELECT * FROM otp_codes WHERE identifier = ? AND purpose = ? AND used = 0
       AND datetime(expires_at) > datetime('now') ORDER BY created_at DESC LIMIT 1`
    )
    .get(mobile, purpose);

  if (!otp || otp.code !== code) return fail(res, 'Invalid or expired OTP', 400);

  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otp.id);
  db.prepare(
    `UPDATE users SET two_fa_enabled = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(enable ? 1 : 0, req.user.id);

  createNotification(
    req.user.id,
    'security',
    enable ? '2FA Enabled' : '2FA Disabled',
    enable
      ? 'Two-factor authentication is now on for your account.'
      : 'Two-factor authentication has been turned off.'
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return success(
    res,
    sanitizeUser(user),
    enable ? '2FA enabled successfully' : '2FA disabled successfully'
  );
};

export const changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return fail(res, 'Valid current and new password (min 6 chars) required');
  }
  if (!bcrypt.compareSync(currentPassword, req.user.password_hash)) {
    return fail(res, 'Current password is incorrect', 400);
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(
    hash,
    req.user.id
  );
  createNotification(req.user.id, 'security', 'Password Changed', 'Your password was updated successfully.');
  return success(res, null, 'Password updated');
};

export const getBankAccounts = (req, res) => {
  const accounts = db.prepare('SELECT * FROM bank_accounts WHERE user_id = ?').all(req.user.id);
  return success(
    res,
    accounts.map((a) => ({
      ...a,
      account_number: `****${String(a.account_number).slice(-4)}`,
    }))
  );
};

export const addBankAccount = (req, res) => {
  const { accountHolder, accountNumber, ifsc, bankName, isDefault } = req.body;
  if (!accountHolder || !accountNumber || !ifsc || !bankName) {
    return fail(res, 'All bank account fields are required');
  }
  const id = generateId('bnk');
  if (isDefault) {
    db.prepare('UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }
  db.prepare(
    `INSERT INTO bank_accounts (id, user_id, account_holder, account_number, ifsc, bank_name, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.id, accountHolder, accountNumber, ifsc.toUpperCase(), bankName, isDefault ? 1 : 0);
  return success(res, { id }, 'Bank account added', 201);
};

export const removeBankAccount = (req, res) => {
  db.prepare('DELETE FROM bank_accounts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return success(res, null, 'Bank account removed');
};

export const getLoginHistory = (req, res) => {
  const history = db
    .prepare('SELECT * FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.user.id);
  return success(res, history);
};

export const getSessions = (req, res) => {
  const sessions = db
    .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY last_active DESC')
    .all(req.user.id);
  return success(res, sessions);
};

export const getNotifications = (req, res) => {
  const list = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
    .all(req.user.id);
  return success(res, list);
};

export const markNotificationRead = (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(
    req.params.id,
    req.user.id
  );
  return success(res, null, 'Marked as read');
};

export const markAllNotificationsRead = (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  return success(res, null, 'All marked as read');
};
