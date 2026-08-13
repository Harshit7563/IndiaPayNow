import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import db from '../db/database.js';
import { generateId, generateUpiId, success, fail } from '../utils/helpers.js';
import { createNotification } from '../middleware/audit.js';

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
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Enter a valid 15-character GSTIN'),
];

export const loginValidators = [
  body('identifier').notEmpty().withMessage('Email or mobile is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const issueRegisterOtp = (mobile) => {
  const otpId = generateId('otp');
  const code = process.env.OTP_DEMO_CODE || '123456';
  db.prepare(
    `INSERT INTO otp_codes (id, identifier, code, purpose, expires_at)
     VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))`
  ).run(otpId, mobile, code, 'register');
  return code;
};

export const register = (req, res) => {
  const {
    fullName,
    email,
    mobile,
    password,
    role = 'user',
    businessName,
    businessType,
    gstin,
    city,
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
    db.prepare(
      `UPDATE users SET full_name = ?, password_hash = ?, role = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(fullName, passwordHash, allowedRole, existing.id);

    if (allowedRole === 'merchant') {
      const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(existing.id);
      if (!merchant) {
        const merchantId = generateId('mrc');
        const name = String(businessName || '').trim() || `${fullName}'s Business`;
        const type = String(businessType || '').trim() || 'Retail';
        const gst = String(gstin || '').trim().toUpperCase() || null;
        const locationNote = city ? `City: ${String(city).trim()}` : null;
        db.prepare(
          `INSERT INTO merchants (id, user_id, business_name, business_type, gstin, available_settlement)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(merchantId, existing.id, name, locationNote ? `${type} · ${locationNote}` : type, gst, 0);
      }
    }

    const code = issueRegisterOtp(mobile);
    return success(
      res,
      {
        userId: existing.id,
        otpRequired: true,
        demoOtp: code,
        resumed: true,
        message: 'OTP sent to your mobile (demo mode)',
      },
      'Please verify OTP to continue.',
      200
    );
  }

  if (existing) return fail(res, 'Email or mobile already registered', 409);

  const id = generateId('usr');
  const passwordHash = bcrypt.hashSync(password, 10);
  const upiId = generateUpiId(fullName, {
    isTaken: (candidate) => !!db.prepare('SELECT id FROM users WHERE upi_id = ?').get(candidate),
  });
  const allowedRole = ['user', 'merchant'].includes(role) ? role : 'user';

  db.prepare(
    `INSERT INTO users (id, full_name, email, mobile, password_hash, role, upi_id, wallet_balance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, fullName, emailNorm, mobile, passwordHash, allowedRole, upiId, 1000);

  if (allowedRole === 'merchant') {
    const merchantId = generateId('mrc');
    const name = String(businessName || '').trim() || `${fullName}'s Business`;
    const type = String(businessType || '').trim() || 'Retail';
    const gst = String(gstin || '').trim().toUpperCase() || null;
    const locationNote = city ? `City: ${String(city).trim()}` : null;
    db.prepare(
      `INSERT INTO merchants (id, user_id, business_name, business_type, gstin, available_settlement)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(merchantId, id, name, locationNote ? `${type} · ${locationNote}` : type, gst, 0);
  }

  const code = issueRegisterOtp(mobile);

  createNotification(id, 'security', 'Welcome to India Pay Now', 'Your account has been created successfully.');

  return success(
    res,
    {
      userId: id,
      otpRequired: true,
      demoOtp: code,
      message: 'OTP sent to your mobile (demo mode)',
    },
    'Registration successful. Please verify OTP.',
    201
  );
};

export const verifyOtp = (req, res) => {
  const { identifier, code, purpose = 'register' } = req.body;
  if (!identifier || !code) return fail(res, 'Identifier and OTP are required');

  const otp = db
    .prepare(
      `SELECT * FROM otp_codes WHERE identifier = ? AND purpose = ? AND used = 0
       AND datetime(expires_at) > datetime('now') ORDER BY created_at DESC LIMIT 1`
    )
    .get(identifier, purpose);

  if (!otp || otp.code !== code) return fail(res, 'Invalid or expired OTP', 400);

  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otp.id);

  const user = db
    .prepare('SELECT * FROM users WHERE mobile = ? OR email = ?')
    .get(identifier, identifier.toLowerCase?.() || identifier);

  if (!user) return fail(res, 'User not found', 404);

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

export const login = (req, res) => {
  const { identifier, password, rememberMe } = req.body;
  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(identifier.toLowerCase(), identifier);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return fail(res, 'Invalid credentials', 401);
  }

  if (!user.is_active) return fail(res, 'Account is deactivated', 403);

  const otpId = generateId('otp');
  const code = process.env.OTP_DEMO_CODE || '123456';

  if (user.two_fa_enabled) {
    db.prepare(
      `INSERT INTO otp_codes (id, identifier, code, purpose, expires_at)
       VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))`
    ).run(otpId, user.mobile, code, 'login');
    return success(res, {
      otpRequired: true,
      identifier: user.mobile,
      demoOtp: code,
    }, 'OTP required for login');
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

export const requestOtpLogin = (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return fail(res, 'Mobile or email required');

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(identifier.toLowerCase(), identifier);
  if (!user) return fail(res, 'User not found', 404);

  const code = process.env.OTP_DEMO_CODE || '123456';
  db.prepare(
    `INSERT INTO otp_codes (id, identifier, code, purpose, expires_at)
     VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))`
  ).run(generateId('otp'), user.mobile, code, 'login');

  return success(res, { identifier: user.mobile, demoOtp: code }, 'OTP sent (demo mode)');
};

export const resendOtp = (req, res) => {
  const { identifier, purpose = 'register' } = req.body;
  if (!identifier) return fail(res, 'Mobile or email required');

  const allowed = ['register', 'login'];
  if (!allowed.includes(purpose)) return fail(res, 'Invalid OTP purpose');

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? OR mobile = ?')
    .get(String(identifier).toLowerCase(), identifier);
  if (!user) return fail(res, 'User not found', 404);

  const code = process.env.OTP_DEMO_CODE || '123456';
  db.prepare(
    `INSERT INTO otp_codes (id, identifier, code, purpose, expires_at)
     VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))`
  ).run(generateId('otp'), user.mobile, code, purpose);

  return success(
    res,
    { identifier: user.mobile, demoOtp: code, purpose },
    'OTP resent (demo mode)'
  );
};

export const me = (req, res) => success(res, sanitizeUser(req.user));

export { sanitizeUser, signToken };
