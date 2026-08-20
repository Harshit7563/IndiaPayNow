import {
  BadgeCheck,
  BatteryCharging,
  Bolt,
  Building2,
  Bus,
  Car,
  CirclePlay,
  Clapperboard,
  Coins,
  CreditCard,
  Droplets,
  FileWarning,
  Flame,
  Flower2,
  GraduationCap,
  HeartHandshake,
  Home,
  Hotel,
  Landmark,
  LineChart,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Smartphone,
  Ticket,
  TrainFront,
  TrendingUp,
  Tv,
  Users,
  Wifi,
} from 'lucide-react';

export const serviceCatalog = [
  {
    id: 'recharges',
    title: 'Recharges',
    items: [
      ['mobile-recharge', 'Mobile Recharge', Smartphone, 'Mobile number'],
      ['fastag', 'FASTag Recharge', Car, 'Vehicle number'],
      ['dth-recharge', 'DTH Recharge', Tv, 'Subscriber ID'],
      ['ncmc-recharge', 'NCMC Recharge', CreditCard, 'Card number'],
      ['prepaid-meter', 'Prepaid Meter', Bolt, 'Meter number'],
      ['ev-recharge', 'EV Recharge', BatteryCharging, 'Vehicle / charger ID'],
      ['metro-recharge', 'Metro Recharge', TrainFront, 'Metro card number'],
      ['google-play-recharge', 'Google Play Recharge', CirclePlay, 'Email / Play account'],
      ['toll-tag-recharge', 'Toll Tag Recharge', Bus, 'Tag / vehicle number'],
    ],
  },
  {
    id: 'bills',
    title: 'Bill Payments',
    items: [
      ['electricity-bill', 'Electricity Bill', Bolt, 'Consumer number'],
      ['broadband', 'Broadband/ Landline', Wifi, 'Customer ID'],
      ['piped-gas', 'Piped Gas', Flame, 'Consumer number'],
      ['water-bill', 'Water Bill', Droplets, 'Consumer number'],
      ['loan', 'Loan EMI Payment', Landmark, 'Loan account number'],
      ['insurance', 'LIC / Insurance', ShieldCheck, 'Policy number'],
      ['cable-tv', 'Cable TV', Tv, 'Subscriber ID'],
      ['municipal-tax', 'Municipal Tax', Building2, 'Property / tax ID'],
    ],
  },
  {
    id: 'book',
    title: 'Book & Buy',
    items: [
      ['gas', 'Book Gas Cylinder', Flame, 'Consumer number'],
      ['movie-tickets', 'Movie Tickets', Clapperboard, 'City / movie'],
      ['imax-tickets', 'IMAX Tickets', Ticket, 'City / movie'],
      ['gold', 'Gold', Coins, 'Amount in ₹'],
      ['mutual-funds', 'Invest in Mutual Funds', TrendingUp, 'PAN / folio'],
      ['stocks', 'Invest in Stocks', LineChart, 'Demat / PAN'],
    ],
  },
  {
    id: 'other',
    title: 'Other Services',
    items: [
      ['traffic-challan', 'Traffic Challan', FileWarning, 'Challan / vehicle number'],
      ['nps', 'NPS Contribution', Landmark, 'PRAN'],
      ['apartments', 'Apartments', Building2, 'Society / flat ID'],
      ['education', 'Education Fees', GraduationCap, 'Student / admission ID'],
      ['club', 'Club & Associations', Users, 'Membership ID'],
      ['rentals', 'Rentals', Home, 'Landlord / property'],
      ['devotion', 'Devotion', Flower2, 'Temple / seva'],
      ['donation', 'Donation', HeartHandshake, 'Cause / NGO'],
      ['credit-score', 'Check Credit Score', BadgeCheck, 'PAN / mobile'],
      ['pnr-status', 'PNR Status', Search, 'PNR number'],
      ['live-train', 'Tracking (Live Train)', MapPin, 'Train number'],
    ],
  },
];

export const allServices = serviceCatalog.flatMap((group) => group.items);

export const serviceLabels = Object.fromEntries(
  allServices.map(([slug, title, , accountLabel]) => [slug, [title, accountLabel]])
);

Object.assign(serviceLabels, {
  'self-transfer': ['Self Account Transfer', 'Your other account / UPI'],
  postpaid: ['Mobile Postpaid', 'Mobile number'],
  flight: ['Flight Booking', 'From - To / PNR'],
  train: ['Train Booking', 'From - To / PNR'],
  bus: ['Bus Booking', 'From - To'],
  hotel: ['Hotel Booking', 'City / hotel'],
  'personal-loan': ['Personal / Business Loan', 'PAN / mobile'],
  'fixed-deposit': ['Fixed Deposit', 'Amount / tenure'],
  'credit-score': ['Credit Score', 'PAN / mobile'],
});

const extraServices = [
  ['flight', 'Flight Booking', Plane, 'From - To / PNR', 'travel'],
  ['train', 'Train Booking', TrainFront, 'From - To / PNR', 'travel'],
  ['bus', 'Bus Booking', Bus, 'From - To', 'travel'],
  ['hotel', 'Hotel Booking', Hotel, 'City / hotel', 'travel'],
];

const ticketSlugs = new Set([
  'flight',
  'train',
  'bus',
  'hotel',
  'movie-tickets',
  'imax-tickets',
  'pnr-status',
  'live-train',
]);

export function catalogServicePath(slug) {
  return `/services/${slug}`;
}

export const catalogToAppService = {
  'mobile-recharge': 'mobile',
  'dth-recharge': 'dth',
  fastag: 'fastag',
  'electricity-bill': 'electricity',
  broadband: 'broadband',
  'piped-gas': 'piped-gas',
  'water-bill': 'water',
  loan: 'loan',
  insurance: 'insurance',
  gas: 'cylinder',
  'traffic-challan': 'challan',
  flight: 'flight',
  train: 'train',
  bus: 'bus',
  hotel: 'hotel',
  'personal-loan': 'loan',
  postpaid: 'mobile',
};

export const appServiceToCatalog = {
  mobile: 'mobile-recharge',
  dth: 'dth-recharge',
  fastag: 'fastag',
  electricity: 'electricity-bill',
  broadband: 'broadband',
  'piped-gas': 'piped-gas',
  water: 'water-bill',
  loan: 'loan',
  insurance: 'insurance',
  cylinder: 'gas',
  challan: 'traffic-challan',
  flight: 'flight',
  train: 'train',
  bus: 'bus',
  hotel: 'hotel',
};

export function appServiceFromCatalog(slug) {
  return catalogToAppService[slug] || slug;
}

export function catalogPathForAppService(id) {
  return catalogServicePath(appServiceToCatalog[id] || id);
}

export function payServicePath(slug) {
  if (['flight', 'train', 'bus', 'hotel'].includes(slug)) return `/app?service=${slug}`;
  if (slug === 'credit-score') return '/verification/services/credit-score';
  return `/app/bills/${slug}`;
}

export function findCatalogService(slug) {
  for (const group of serviceCatalog) {
    const row = group.items.find((item) => item[0] === slug);
    if (row) {
      const [id, label, icon, accountLabel] = row;
      return {
        id,
        label,
        icon,
        accountLabel,
        groupId: group.id,
        groupTitle: group.title,
        ...navMeta(group.id, id),
      };
    }
  }
  const extra = extraServices.find((item) => item[0] === slug);
  if (extra) {
    const [id, label, icon, accountLabel] = extra;
    return {
      id,
      label,
      icon,
      accountLabel,
      groupId: 'travel',
      groupTitle: 'Travel',
      ...navMeta('travel', id),
    };
  }
  return null;
}

export function relatedCatalogServices(slug, limit = 4) {
  const current = findCatalogService(slug);
  if (!current) return [];
  const pool =
    current.groupId === 'travel'
      ? extraServices.map(([id, label, icon, accountLabel]) => ({
          id,
          label,
          icon,
          accountLabel,
          groupId: 'travel',
        }))
      : (serviceCatalog.find((g) => g.id === current.groupId)?.items || []).map(([id, label, icon, accountLabel]) => ({
          id,
          label,
          icon,
          accountLabel,
          groupId: current.groupId,
        }));
  return pool.filter((item) => item.id !== slug).slice(0, limit);
}

function navMeta(groupId, slug) {
  if (ticketSlugs.has(slug) || groupId === 'travel') {
    return { nav: 'Ticket Booking', column: 'Travel & Movies' };
  }
  if (groupId === 'recharges') return { nav: 'Recharge & Bills', column: 'Recharges' };
  if (groupId === 'bills') return { nav: 'Recharge & Bills', column: 'Bill Payments' };
  if (['gold', 'mutual-funds', 'stocks', 'gas'].includes(slug)) {
    return { nav: 'Payments & Services', column: 'Invest & Pay' };
  }
  return { nav: 'Payments & Services', column: 'More Services' };
}

export function getCatalogServiceStory(service) {
  const need = service.accountLabel.toLowerCase();
  return {
    description: `${service.label} on India Pay Now — enter your ${need}, confirm the amount, and pay from wallet or UPI.`,
    steps: [
      { n: '01', title: 'Enter details', text: `Add your ${need} so we can fetch the right biller or booking.` },
      { n: '02', title: 'Confirm amount', text: 'See the operator, plan, or bill amount clearly before you pay.' },
      { n: '03', title: 'Pay securely', text: 'Wallet or UPI. PIN is only for sending money — never asked on a call.' },
    ],
    uses: [
      `Pay ${service.label} without switching apps`,
      'Saved numbers and IDs for the next time',
      'Receipt and status in Transactions',
      '24×7 support if a payment is delayed',
    ],
  };
}
