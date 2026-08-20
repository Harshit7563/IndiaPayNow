export const shortcutServices = [
  { id: 'mobile', label: 'Mobile', slug: 'mobile-recharge', tone: '#0b5cff' },
  { id: 'fastag', label: 'FASTag', slug: 'fastag', tone: '#d97706' },
  { id: 'dth', label: 'DTH', slug: 'dth-recharge', tone: '#7c3aed' },
  { id: 'electricity', label: 'Electricity', slug: 'electricity-bill', tone: '#ca8a04' },
  { id: 'flight', label: 'Flights', slug: 'flight', tone: '#0070ba' },
  { id: 'train', label: 'Trains', slug: 'train', tone: '#059669' },
  { id: 'bus', label: 'Bus', slug: 'bus', tone: '#e11d48' },
  { id: 'loan', label: 'Loan EMI', slug: 'loan', tone: '#003087' },
  { id: 'insurance', label: 'Insurance', slug: 'insurance', tone: '#0f766e' },
  { id: 'water', label: 'Water', slug: 'water-bill', tone: '#0284c7' },
  { id: 'broadband', label: 'Broadband', slug: 'broadband', tone: '#4f46e5' },
  { id: 'more', label: 'More', slug: null, tone: '#64748b' },
];

export const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];

export const detectOperator = (mobile) => {
  if (!mobile || mobile.length < 2) return 'Jio';
  const n = Number(mobile[1]);
  if (n <= 2) return 'Jio';
  if (n <= 5) return 'Airtel';
  if (n <= 7) return 'Vi';
  return 'BSNL';
};

export const planCategories = ['Popular', 'Data Packs', 'Unlimited', 'Specials', 'OTT & Entertainment'];

export const mobilePlans = [
  { circle: 'All Circles', type: 'Popular', data: 'Unlimited 5G + 30GB', validity: '28 Days', desc: 'Unlimited calls + SMS. OTT apps included for 28 days.', price: 200 },
  { circle: 'All Circles', type: 'Popular', data: '2GB/day', validity: '28 Days', desc: 'Unlimited voice. Extra data rollover.', price: 299 },
  { circle: 'All Circles', type: 'Data Packs', data: '12GB', validity: '28 Days', desc: 'Add-on data pack. No voice.', price: 151 },
  { circle: 'All Circles', type: 'Unlimited', data: '2.5GB/day', validity: '56 Days', desc: 'Truly unlimited 5G with weekend extra data.', price: 579 },
  { circle: 'All Circles', type: 'Specials', data: '3GB/day', validity: '84 Days', desc: 'Long validity pack with complimentary OTT.', price: 799 },
  { circle: 'All Circles', type: 'OTT & Entertainment', data: '2GB/day', validity: '28 Days', desc: 'Includes popular OTT subscriptions.', price: 349 },
  { circle: 'All Circles', type: 'Popular', data: '1.5GB/day', validity: '24 Days', desc: 'Value pack for light users.', price: 189 },
];

export const billFields = {
  mobile: { title: 'Prepaid Mobile Recharge', account: 'Mobile Number', placeholder: '10-digit mobile number' },
  fastag: { title: 'FASTag Recharge', account: 'Vehicle number', placeholder: 'e.g. MH12AB1234' },
  dth: { title: 'DTH Recharge', account: 'Subscriber ID', placeholder: 'Subscriber / customer ID' },
  electricity: { title: 'Electricity Bill', account: 'Consumer number', placeholder: 'Consumer number' },
  loan: { title: 'Loan EMI', account: 'Loan account number', placeholder: 'Loan account number' },
  insurance: { title: 'Insurance / LIC Premium', account: 'Policy number', placeholder: 'Policy number' },
  'piped-gas': { title: 'Piped Gas Bill', account: 'Consumer number', placeholder: 'Consumer number' },
  cylinder: { title: 'Book a Cylinder', account: 'Consumer number', placeholder: 'LPG consumer number' },
  water: { title: 'Water Bill', account: 'Consumer number', placeholder: 'Consumer number' },
  broadband: { title: 'Broadband / Landline', account: 'Customer ID', placeholder: 'Customer ID' },
  challan: { title: 'Traffic Challan', account: 'Challan / vehicle number', placeholder: 'Challan or vehicle number' },
  flight: { title: 'Flight Booking', account: 'From - To', placeholder: 'Route' },
  train: { title: 'Train Booking', account: 'From - To', placeholder: 'Route' },
  bus: { title: 'Bus Booking', account: 'From - To', placeholder: 'Route' },
  hotel: { title: 'Hotel Booking', account: 'City', placeholder: 'City / hotel' },
};

export const relatedServices = {
  mobile: [
    ['dth', 'DTH Recharge'],
    ['fastag', 'FASTag Recharge'],
    ['broadband', 'Broadband/Landline'],
    ['electricity', 'Electricity Bill'],
    ['loan', 'Loan EMI'],
    ['insurance', 'Insurance / LIC'],
  ],
  fastag: [
    ['challan', 'Traffic Challan'],
    ['insurance', 'Car Insurance'],
    ['loan', 'Loan EMI'],
    ['mobile', 'Mobile Recharge'],
    ['cylinder', 'Book a Cylinder'],
  ],
  dth: [
    ['mobile', 'Mobile Recharge'],
    ['broadband', 'Broadband/Landline'],
    ['electricity', 'Electricity Bill'],
    ['piped-gas', 'Piped Gas'],
  ],
  electricity: [
    ['water', 'Water Bill'],
    ['piped-gas', 'Piped Gas Bill'],
    ['broadband', 'Broadband/Landline'],
    ['cylinder', 'Book a Cylinder'],
    ['loan', 'Loan EMI'],
  ],
  loan: [
    ['insurance', 'Insurance / LIC'],
    ['electricity', 'Electricity Bill'],
    ['broadband', 'Broadband/Landline'],
    ['water', 'Water Bill'],
    ['mobile', 'Mobile Recharge'],
  ],
  insurance: [
    ['loan', 'Loan EMI'],
    ['electricity', 'Electricity Bill'],
    ['fastag', 'FASTag Recharge'],
    ['water', 'Water Bill'],
    ['mobile', 'Mobile Recharge'],
  ],
  'piped-gas': [
    ['cylinder', 'Book a Cylinder'],
    ['electricity', 'Electricity Bill'],
    ['water', 'Water Bill'],
    ['broadband', 'Broadband/Landline'],
  ],
  cylinder: [
    ['piped-gas', 'Piped Gas Bill'],
    ['electricity', 'Electricity Bill'],
    ['water', 'Water Bill'],
    ['mobile', 'Mobile Recharge'],
  ],
  water: [
    ['electricity', 'Electricity Bill'],
    ['piped-gas', 'Piped Gas Bill'],
    ['broadband', 'Broadband/Landline'],
    ['cylinder', 'Book a Cylinder'],
  ],
  broadband: [
    ['dth', 'DTH Recharge'],
    ['mobile', 'Mobile Recharge'],
    ['electricity', 'Electricity Bill'],
    ['water', 'Water Bill'],
  ],
  challan: [
    ['fastag', 'FASTag Recharge'],
    ['insurance', 'Insurance / LIC'],
    ['loan', 'Loan EMI'],
    ['mobile', 'Mobile Recharge'],
  ],
  flight: [
    ['train', 'Train Booking'],
    ['bus', 'Bus Booking'],
    ['hotel', 'Hotel Booking'],
    ['fastag', 'FASTag Recharge'],
  ],
  train: [
    ['flight', 'Flight Booking'],
    ['bus', 'Bus Booking'],
    ['hotel', 'Hotel Booking'],
    ['mobile', 'Mobile Recharge'],
  ],
  bus: [
    ['flight', 'Flight Booking'],
    ['train', 'Train Booking'],
    ['hotel', 'Hotel Booking'],
    ['fastag', 'FASTag Recharge'],
  ],
  hotel: [
    ['flight', 'Flight Booking'],
    ['train', 'Train Booking'],
    ['bus', 'Bus Booking'],
    ['mobile', 'Mobile Recharge'],
  ],
};

export const quickLinks = [
  'Popular Recharge Plans',
  'Data Packs',
  'Unlimited Plans',
  'Special Recharge Plans',
  'OTT and Entertainment',
  'Long Validity Plans',
];
