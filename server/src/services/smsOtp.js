import db from '../db/database.js';
import { generateId } from '../utils/helpers.js';

const SMS_API_URL = () => process.env.SMS_OTP_URL || 'https://authsecure.anilaxsoftware.com/api/Sms_api/send';
const SMS_API_KEY = () => process.env.SMS_OTP_API_KEY || '';

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const normalizeMobile = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
};

export const maskMobile = (raw) => {
  const mobile = normalizeMobile(raw);
  if (mobile.length !== 10) return 'your mobile';
  return `+91 ${mobile.slice(0, 2)}••••${mobile.slice(-2)}`;
};

export const sendSmsOtp = async (number, otp) => {
  const apiKey = SMS_API_KEY();
  if (!apiKey) {
    const error = new Error('SMS OTP is not configured');
    error.status = 503;
    throw error;
  }

  const mobile = normalizeMobile(number);
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    const error = new Error('Enter a valid 10-digit Indian mobile number');
    error.status = 400;
    throw error;
  }

  const url = new URL(SMS_API_URL());
  url.searchParams.set('number', mobile);
  url.searchParams.set('otp', otp);
  url.searchParams.set('api_key', apiKey);

  let payload = null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
    });
    payload = await response.json().catch(() => null);
    if (!response.ok && !payload) {
      const error = new Error('Failed to send OTP. Please try again.');
      error.status = 502;
      throw error;
    }
  } catch (err) {
    if (err.status) throw err;
    const error = new Error('Failed to send OTP. Please try again.');
    error.status = 502;
    throw error;
  }

  if (!payload?.status) {
    const error = new Error(payload?.message || payload?.error || 'Failed to send OTP. Please try again.');
    error.status = 502;
    throw error;
  }

  return payload;
};

export const issueAndSendOtp = async (identifierMobile, purpose, { ttlMinutes = 10 } = {}) => {
  const mobile = normalizeMobile(identifierMobile);
  const code = generateOtp();

  await sendSmsOtp(mobile, code);

  db.prepare(
    `UPDATE otp_codes SET used = 1
     WHERE identifier = ? AND purpose = ? AND used = 0`
  ).run(mobile, purpose);

  db.prepare(
    `INSERT INTO otp_codes (id, identifier, code, purpose, expires_at)
     VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))`
  ).run(generateId('otp'), mobile, code, purpose);

  return {
    mobile,
    mobileMasked: maskMobile(mobile),
    expiresIn: ttlMinutes * 60,
  };
};
