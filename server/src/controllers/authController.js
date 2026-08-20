import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import db from '../db/database.js';
import { generateId, generateUpiId, success, fail } from '../utils/helpers.js';
import { createNotification } from '../middleware/audit.js';
import { verifyPan, verifyAadhaar, verifyGstin } from '../services/indiaKyc.js';
import { issueAndSendOtp, normalizeMobile } from '../services/smsOtp.js';

const signToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => {
  const { password_hash, ...safe } = user;
  return {
    id: safe.id,
    fullName: safe.full_name,
    email: safe.email,
    mobile: safe.mobile,
    role: safe.role,
    upiId: safe.upi_id,
    walletBalance: safe.wallet_balance,
    avatarUrl: safe.avatar_url,
    twoFaEnabled: !!safe.two_fa_enabled,
    kycStatus: safe.kyc_status,
    emailNotifications: !!safe.email_notifications,
    smsNotifications: !!safe.sms_notifications,
    paymentNotifications: !!safe.payment_notifications,
    createdAt: safe.created_at,
  };
};

export const registerValidators = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((v, { req }) => {
    if (v !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('businessName').custom((v, { req }) => {
    if (req.body.role === 'merchant' && !String(v || '').trim()) {
      throw new Error('Business name is required');
    }
    return true;
  }),
  body('businessType').custom((v, { req }) => {
    if (req.body.role === 'merchant' && !String(v || '').trim()) {
      throw new Error('Business type is required');
    }
    return true;
  }),
  body('city').custom((v, { req }) => {
    if (req.body.role === 'merchant' && !String(v || '').trim()) {
      throw new Error('City is required for business accounts');
    }
    return true;
  }),
  body('gstin')
    .optional({ values: 'falsy' })
    .custom((value) => {
      const result = verifyGstin(value);
      if (!result.valid) throw new Error(result.message || 'Enter a valid 15-character GSTIN');
      return true;
    }),
];

const kycStatusFromBody = (body, role) => {
  const pan = String(body?.pan || '').trim();
  const aadhaar = String(body?.aadhaar || '').trim();
  if (!pan || !aadhaar) return 'pending';
  const panCheck = verifyPan(pan, { intent: role === 'merchant' ? 'business' : 'personal' });
  const aadhaarCheck = verifyAadhaar(aadhaar);
  return panCheck.valid && aadhaarCheck.valid ? 'verified' : 'pending';
};

export const loginValidators = [
  body('identifier').notEmpty().withMessage('Email or mobile is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const issueRegisterOtp = (mobile) => issueAndSendOtp(mobile, 'register');

const saveSettlementBank = (userId, body) => {
  const accountHolder = String(body?.accountHolder || '').trim();
  const accountNumber = String(body?.accountNumber || '').trim();
  const ifsc = String(body?.ifsc || '').trim().toUpperCase();
  const bankName = String(body?.bankName || '').trim();
  if (!accountHolder || !accountNumber || !ifsc || !bankName) return;
  const existing = db.prepare('SELECT id FROM bank_accounts WHERE user_id = ?').get(userId);
  if (existing) {
    db.prepare(
      `UPDATE bank_accounts
       SET account_holder = ?, account_number = ?, ifsc = ?, bank_name = ?, is_default = 1
       WHERE user_id = ?`
    ).run(accountHolder, accountNumber, ifsc, bankName, userId);
    return;
  }
  db.prepare(
    `INSERT INTO bank_accounts (id, user_id, account_holder, account_number, ifsc, bank_name, is_default)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  ).run(generateId('bnk'), userId, accountHolder, accountNumber, ifsc, bankName);
};

const merchantTypeLabel = (body) => {
  const type = String(body?.businessType || '').trim() || 'Retail';
  const entity = String(body?.legalEntity || '').trim();
  return entity ? `${type} · ${entity}` : type;
};

const upsertMerchant = (userId, fullName, body) => {
  const name = String(body?.businessName || '').trim() || `${fullName}'s Business`;
  const type = merchantTypeLabel(body);
  const gst = String(body?.gstin || '').trim().toUpperCase() || null;
  const cycle = String(body?.settlementCycle || '').trim() || 'Instant';
  const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(userId);
  if (!merchant) {
    db.prepare(
      `INSERT INTO merchants (id, user_id, business_name, business_type, gstin, settlement_cycle, available_settlement)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).run(generateId('mrc'), userId, name, type, gst, cycle);
  } else {
    db.prepare(
      `UPDATE merchants
       SET business_name = ?, business_type = ?, gstin = ?, settlement_cycle = ?, updated_at = datetime('now')
       WHERE user_id = ?`
    ).run(name, type, gst, cycle, userId);
  }
  saveSettlementBank(userId, body);
};

export const register = async (req, res) => {
  const {
    fullName,
    email,
    mobile,
    password,
    role = 'user',
  } = req.body;

  const emailNorm = email.toLowerCase();
  const existing = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(emailNorm, mobile);

  // Same email+mobile and never completed OTP/login: resume signup
  if (existing && existing.email === emailNorm && existing.mobile === mobile) {
    const completed = db
      .prepare('SELECT id FROM login_history WHERE user_id = ? LIMIT 1')
      .get(existing.id);
    if (completed) return fail(res, 'Email or mobile already registered', 409);

    const passwordHash = bcrypt.hashSync(password, 10);
    const allowedRole = ['user', 'merchant'].includes(role) ? role : 'user';
    const kycStatus = kycStatusFromBody(req.body, allowedRole);
    db.prepare(
      `UPDATE users SET full_name = ?, password_hash = ?, role = ?, kyc_status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(fullName, passwordHash, allowedRole, kycStatus, existing.id);

    if (allowedRole === 'merchant') {
      upsertMerchant(existing.id, fullName, req.body);
    }

    try {
      const sent = await issueRegisterOtp(mobile);
      return success(
        res,
        {
          userId: existing.id,
          otpRequired: true,
          resumed: true,
          identifier: sent.mobile,
          mobileMasked: sent.mobileMasked,
          message: `OTP sent to ${sent.mobileMasked}`,
        },
        'Please verify OTP to continue.',
        200
      );
    } catch (error) {
      return fail(res, error.message || 'Account saved. Could not send OTP — tap resend.', error.status || 502);
    }
  }

  if (existing) return fail(res, 'Email or mobile already registered', 409);

  const id = generateId('usr');
  const passwordHash = bcrypt.hashSync(password, 10);
  const upiId = generateUpiId(fullName, {
    isTaken: (candidate) => !!db.prepare('SELECT id FROM users WHERE upi_id = ?').get(candidate),
  });
  const allowedRole = ['user', 'merchant'].includes(role) ? role : 'user';
  const kycStatus = kycStatusFromBody(req.body, allowedRole);

  db.prepare(
    `INSERT INTO users (id, full_name, email, mobile, password_hash, role, upi_id, wallet_balance, kyc_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, fullName, emailNorm, mobile, passwordHash, allowedRole, upiId, 1000, kycStatus);

  if (allowedRole === 'merchant') {
    upsertMerchant(id, fullName, req.body);
  }

  createNotification(id, 'security', 'Welcome to India Pay Now', 'Your account has been created successfully.');

  try {
    const sent = await issueRegisterOtp(mobile);
    return success(
      res,
      {
        userId: id,
        otpRequired: true,
        identifier: sent.mobile,
        mobileMasked: sent.mobileMasked,
        message: `OTP sent to ${sent.mobileMasked}`,
      },
      'Registration successful. Please verify OTP.',
      201
    );
  } catch (error) {
    return fail(res, error.message || 'Account created. Could not send OTP — tap resend.', error.status || 502);
  }
};

export const verifyOtp = (req, res) => {
  const { identifier, code, purpose = 'register' } = req.body;
  if (!identifier || !code) return fail(res, 'Identifier and OTP are required');

  const user = db
    .prepare('SELECT * FROM users WHERE mobile = ? OR email = ?')
    .get(identifier, String(identifier).toLowerCase());
  if (!user) return fail(res, 'User not found', 404);

  const lookup = normalizeMobile(user.mobile || identifier);
  const otp = db
    .prepare(
      `SELECT * FROM otp_codes WHERE identifier = ? AND purpose = ? AND used = 0
       AND datetime(expires_at) > datetime('now') ORDER BY created_at DESC LIMIT 1`
    )
    .get(lookup, purpose);

  if (!otp || String(otp.code) !== String(code).trim()) return fail(res, 'Invalid or expired OTP', 400);

  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otp.id);

  if (purpose === 'login' || purpose === 'register' || purpose === 'transfer') {
    const token = signToken(user.id, user.role);
    db.prepare(
      `INSERT INTO login_history (id, user_id, ip_address, device, location)
       VALUES (?, ?, ?, ?, ?)`
    ).run(generateId('lgh'), user.id, req.ip, req.get('user-agent')?.slice(0, 120) || 'Unknown', 'India');

    return success(res, { token, user: sanitizeUser(user) }, 'OTP verified');
  }

  return success(res, { verified: true }, 'OTP verified');
};

export const login = async (req, res) => {
  const { identifier, password, rememberMe } = req.body;
  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(identifier.toLowerCase(), identifier);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return fail(res, 'Invalid credentials', 401);
  }

  if (!user.is_active) return fail(res, 'Account is deactivated', 403);

  if (user.two_fa_enabled) {
    try {
      const sent = await issueAndSendOtp(user.mobile, 'login');
      return success(
        res,
        {
          otpRequired: true,
          identifier: sent.mobile,
          mobileMasked: sent.mobileMasked,
        },
        `OTP sent to ${sent.mobileMasked}`
      );
    } catch (error) {
      return fail(res, error.message || 'Could not send OTP', error.status || 502);
    }
  }

  const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn });

  db.prepare(
    `INSERT INTO login_history (id, user_id, ip_address, device, location)
     VALUES (?, ?, ?, ?, ?)`
  ).run(generateId('lgh'), user.id, req.ip, req.get('user-agent')?.slice(0, 120) || 'Unknown', 'India');

  db.prepare(
    `INSERT INTO sessions (id, user_id, device, ip_address) VALUES (?, ?, ?, ?)`
  ).run(generateId('ses'), user.id, 'Web Browser', req.ip);

  return success(res, { token, user: sanitizeUser(user) }, 'Login successful');
};

export const requestOtpLogin = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return fail(res, 'Mobile or email required');

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(identifier.toLowerCase(), identifier);
  if (!user) return fail(res, 'User not found', 404);

  try {
    const sent = await issueAndSendOtp(user.mobile, 'login');
    return success(
      res,
      { identifier: sent.mobile, mobileMasked: sent.mobileMasked },
      `OTP sent to ${sent.mobileMasked}`
    );
  } catch (error) {
    return fail(res, error.message || 'Could not send OTP', error.status || 502);
  }
};

export const resendOtp = async (req, res) => {
  const { identifier, purpose = 'register' } = req.body;
  if (!identifier) return fail(res, 'Mobile or email required');

  const allowed = ['register', 'login'];
  if (!allowed.includes(purpose)) return fail(res, 'Invalid OTP purpose');

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(String(identifier).toLowerCase(), identifier);
  if (!user) return fail(res, 'User not found', 404);

  try {
    const sent = await issueAndSendOtp(user.mobile, purpose);
    return success(
      res,
      { identifier: sent.mobile, mobileMasked: sent.mobileMasked, purpose },
      `OTP resent to ${sent.mobileMasked}`
    );
  } catch (error) {
    return fail(res, error.message || 'Could not resend OTP', error.status || 502);
  }
};

export const me = (req, res) => success(res, sanitizeUser(req.user));

export { sanitizeUser, signToken };
