import { v4 as uuid } from 'uuid';

export const generateId = (prefix = '') => {
  const id = uuid().replace(/-/g, '').slice(0, 16);
  return prefix ? `${prefix}_${id}` : id;
};

export const generateTxnId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `IPN${ts}${rand}`;
};

export const generateUpiId = (name) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  return `${base || 'user'}@indpaynow`;
};

export const generateSlug = () => Math.random().toString(36).slice(2, 10);

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

export const maskAccount = (accountNumber) => {
  const s = String(accountNumber);
  if (s.length <= 4) return s;
  return `${'*'.repeat(s.length - 4)}${s.slice(-4)}`;
};

export const success = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res, message = 'Something went wrong', status = 400, errors = null) =>
  res.status(status).json({ success: false, message, errors });
