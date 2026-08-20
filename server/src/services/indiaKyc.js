const PAN_TYPES = {
  A: 'Association of Persons',
  B: 'Body of Individuals',
  C: 'Company',
  F: 'Firm / Partnership',
  G: 'Government',
  H: 'HUF',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  P: 'Individual',
  T: 'Trust',
};

const GST_STATES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
};

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const verifyPan = (raw, { intent } = {}) => {
  const pan = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return { valid: false, message: 'Enter a valid 10-character PAN (e.g. ABCDE1234F)' };
  }
  const typeCode = pan[3];
  const holderType = PAN_TYPES[typeCode] || 'Unknown';
  const isIndividual = typeCode === 'P' || typeCode === 'H';
  if (intent === 'personal' && !isIndividual) {
    return {
      valid: false,
      pan,
      holderType,
      typeCode,
      message: `This PAN is for ${holderType}. Use an Individual PAN for personal accounts.`,
    };
  }
  if (intent === 'business' && typeCode === 'P') {
    return {
      valid: true,
      pan,
      holderType,
      typeCode,
      warning: 'This looks like an Individual PAN. Business accounts usually use Company / Firm PAN.',
      source: 'Income Tax PAN structure (free)',
    };
  }
  return {
    valid: true,
    pan,
    holderType,
    typeCode,
    source: 'Income Tax PAN structure (free)',
  };
};

export const verifyAadhaar = (raw) => {
  const aadhaar = String(raw || '').replace(/\D/g, '');
  if (!/^[2-9]\d{11}$/.test(aadhaar)) {
    return { valid: false, message: 'Enter a valid 12-digit Aadhaar number' };
  }
  let c = 0;
  const inverted = aadhaar.split('').reverse().map(Number);
  for (let i = 0; i < inverted.length; i += 1) {
    c = verhoeffD[c][verhoeffP[i % 8][inverted[i]]];
  }
  if (c !== 0) {
    return { valid: false, message: 'Aadhaar checksum failed. Check the number and try again.' };
  }
  return {
    valid: true,
    last4: aadhaar.slice(-4),
    source: 'UIDAI Verhoeff checksum (free). Live OTP auth needs a licensed AUA.',
  };
};

export const verifyGstin = (raw) => {
  const gstin = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!gstin) return { valid: true, empty: true };
  if (gstin.length !== 15) {
    return { valid: false, message: 'GSTIN must be 15 characters' };
  }
  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);
  const panCheck = verifyPan(pan);
  if (!GST_STATES[stateCode]) {
    return { valid: false, message: 'Invalid GSTIN state code' };
  }
  if (!panCheck.valid) {
    return { valid: false, message: 'GSTIN contains an invalid PAN' };
  }
  if (gstin[13] !== 'Z') {
    return { valid: false, message: 'Invalid GSTIN format (14th character must be Z)' };
  }

  let factor = 1;
  let total = 0;
  for (let i = 0; i < 14; i += 1) {
    const codePoint = GSTIN_CHARS.indexOf(gstin[i]);
    if (codePoint < 0) return { valid: false, message: 'Invalid GSTIN character' };
    let product = factor * codePoint;
    factor = factor === 1 ? 2 : 1;
    product = Math.floor(product / 36) + (product % 36);
    total += product;
  }
  const check = GSTIN_CHARS[(36 - (total % 36)) % 36];
  if (check !== gstin[14]) {
    return { valid: false, message: 'GSTIN checksum failed. Check the number and try again.' };
  }

  return {
    valid: true,
    gstin,
    stateCode,
    state: GST_STATES[stateCode],
    pan,
    holderType: panCheck.holderType,
    source: 'GSTN checksum + embedded PAN (free)',
  };
};

export const lookupPincode = async (raw) => {
  const pin = String(raw || '').replace(/\D/g, '');
  if (!/^[1-9]\d{5}$/.test(pin)) {
    return { valid: false, message: 'Enter a valid 6-digit Indian PIN code' };
  }
  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('PIN lookup failed');
  const data = await response.json();
  const result = Array.isArray(data) ? data[0] : null;
  const offices = result?.PostOffice || [];
  if (result?.Status !== 'Success' || !offices.length) {
    return { valid: false, pincode: pin, message: 'PIN code not found in India Post records' };
  }
  const office = offices[0];
  return {
    valid: true,
    live: true,
    pincode: pin,
    postOffice: office.Name,
    district: office.District,
    state: office.State,
    block: office.Block,
    source: 'India Post (api.postalpincode.in)',
    offices: offices.slice(0, 8).map((item) => ({
      name: item.Name,
      district: item.District,
      state: item.State,
    })),
  };
};

export const lookupIfsc = async (raw) => {
  const ifsc = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    return { valid: false, message: 'Enter a valid 11-character IFSC' };
  }
  const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404) return { valid: false, message: 'IFSC not found' };
  if (!response.ok) throw new Error('IFSC lookup failed');
  const bank = await response.json();
  return {
    valid: true,
    live: true,
    ifsc,
    bank: bank.BANK,
    branch: bank.BRANCH,
    city: bank.CITY,
    state: bank.STATE,
    address: bank.ADDRESS,
    source: 'RBI IFSC directory (free)',
  };
};
