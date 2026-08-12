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
  Landmark,
  LineChart,
  MapPin,
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
