import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Car,
  Check,
  ChevronDown,
  Droplets,
  Flame,
  Landmark,
  ShieldCheck,
  Sparkles,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';
import { formatINR } from '../utils/format';

const serviceConfig = {
  fastag: {
    title: 'FASTag Recharge',
    brand: 'India Pay Now Mobility',
    Icon: Car,
    accent: '#d97706',
    soft: '#fff1e6',
    accountLabel: 'Vehicle / FASTag ID',
    placeholder: 'e.g. MH12AB1234',
    cta: 'Recharge FASTag',
    tip: 'Keep balance topped up to sail through toll plazas without waiting.',
    providers: ['IDFC FASTag', 'Paytm FASTag', 'HDFC FASTag', 'SBI FASTag', 'ICICI FASTag', 'Axis FASTag'],
    quickAmounts: [100, 200, 500, 1000],
    sampleBills: [
      { label: 'Low balance alert', due: 'Top-up suggested', amount: 200, meta: 'MH12AB · ****1234' },
      { label: 'Monthly top-up', due: 'Recommended', amount: 500, meta: 'KA05CD · ****7788' },
    ],
  },
  dth: {
    title: 'DTH Recharge',
    brand: 'India Pay Now Entertainment',
    Icon: Tv,
    accent: '#7c3aed',
    soft: '#f3e8ff',
    accountLabel: 'Subscriber ID',
    placeholder: 'Subscriber / customer ID',
    cta: 'Recharge DTH',
    tip: 'Recharge before expiry to keep your favourite channels live.',
    providers: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'd2h', 'Sun Direct'],
    quickAmounts: [199, 299, 399, 599],
    sampleBills: [
      { label: 'Family Pack', due: 'Expires in 3 days', amount: 299, meta: 'Tata Play · ****5521' },
      { label: 'Sports Add-on', due: 'Expires in 8 days', amount: 199, meta: 'Airtel · ****9902' },
    ],
  },
  loan: {
    title: 'Loan EMI',
    brand: 'India Pay Now Loans',
    Icon: Landmark,
    accent: '#0070ba',
    soft: '#eef5ff',
    accountLabel: 'Loan account number',
    placeholder: 'e.g. HDFC123456789',
    cta: 'Pay EMI',
    tip: 'Pay EMIs before due date to avoid late fees and keep your credit score healthy.',
    providers: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Bajaj Finserv', 'Home Credit'],
    quickAmounts: [2500, 5000, 10000, 15000],
    sampleBills: [
      { label: 'Home Loan EMI', due: 'Due in 4 days', amount: 28450, meta: 'HDFC · ****4521' },
      { label: 'Personal Loan EMI', due: 'Due in 11 days', amount: 8750, meta: 'Bajaj · ****9082' },
    ],
  },
  insurance: {
    title: 'Insurance / LIC',
    brand: 'India Pay Now Protect',
    Icon: ShieldCheck,
    accent: '#059669',
    soft: '#ecfdf5',
    accountLabel: 'Policy number',
    placeholder: 'e.g. 123456789',
    cta: 'Pay Premium',
    tip: 'Keep policies active — missed premiums can lapse coverage.',
    providers: ['LIC', 'HDFC Life', 'SBI Life', 'Max Life', 'ICICI Pru', 'Care Health'],
    quickAmounts: [1500, 3000, 5500, 12000],
    sampleBills: [
      { label: 'LIC Premium', due: 'Due in 6 days', amount: 5421, meta: 'Policy · ****7812' },
      { label: 'Health Cover', due: 'Due in 18 days', amount: 8999, meta: 'Care · ****3301' },
    ],
  },
  water: {
    title: 'Water Bill',
    brand: 'India Pay Now Utilities',
    Icon: Droplets,
    accent: '#0284c7',
    soft: '#e0f2fe',
    accountLabel: 'Consumer number',
    placeholder: 'Consumer / connection ID',
    cta: 'Pay Water Bill',
    tip: 'Save your consumer number once — next payments take seconds.',
    providers: ['Delhi Jal Board', 'BWSSB', 'MCGM', 'HMWSSB', 'Chennai Metro Water', 'Pune Water'],
    quickAmounts: [350, 550, 800, 1200],
    sampleBills: [
      { label: 'Monthly Water Bill', due: 'Due in 3 days', amount: 642, meta: 'DJB · ****2145' },
      { label: 'Society Share', due: 'Due in 9 days', amount: 980, meta: 'BWSSB · ****6670' },
    ],
  },
  broadband: {
    title: 'Broadband / Landline',
    brand: 'India Pay Now Connect',
    Icon: Wifi,
    accent: '#4f46e5',
    soft: '#eef2ff',
    accountLabel: 'Customer ID / Account number',
    placeholder: 'Customer ID or landline number',
    cta: 'Pay Broadband',
    tip: 'Pay before due date to avoid service interruption.',
    providers: ['Airtel Xstream', 'JioFiber', 'ACT Fibernet', 'BSNL', 'Tata Play Fiber', 'Hathway'],
    quickAmounts: [599, 799, 999, 1499],
    sampleBills: [
      { label: 'Fiber 200 Mbps', due: 'Due in 5 days', amount: 799, meta: 'Airtel · ****5520' },
      { label: 'Landline + Broadband', due: 'Due in 12 days', amount: 999, meta: 'BSNL · ****1188' },
    ],
  },
  electricity: {
    title: 'Electricity Bill',
    brand: 'India Pay Now Utilities',
    Icon: Zap,
    accent: '#ca8a04',
    soft: '#fef9c3',
    accountLabel: 'Consumer number',
    placeholder: 'Consumer number',
    cta: 'Pay Electricity',
    tip: 'Fetch bill once and pay instantly from your wallet.',
    providers: ['BSES', 'Tata Power', 'MSEB', 'BESCOM', 'TSSPDCL', 'PSPCL'],
    quickAmounts: [500, 1000, 1500, 2500],
    sampleBills: [
      { label: 'Home Electricity', due: 'Due in 2 days', amount: 1840, meta: 'BSES · ****4412' },
      { label: 'Shop Connection', due: 'Due in 8 days', amount: 3260, meta: 'Tata Power · ****9021' },
    ],
  },
  'piped-gas': {
    title: 'Piped Gas Bill',
    brand: 'India Pay Now Utilities',
    Icon: Flame,
    accent: '#e11d48',
    soft: '#ffe4e6',
    accountLabel: 'Consumer number',
    placeholder: 'Consumer number',
    cta: 'Pay Gas Bill',
    tip: 'Track usage and clear dues before the cutoff date.',
    providers: ['IGL', 'Mahanagar Gas', 'Gujarat Gas', 'Adani Gas'],
    quickAmounts: [400, 700, 1100, 1500],
    sampleBills: [
      { label: 'Monthly PNG Bill', due: 'Due in 5 days', amount: 780, meta: 'IGL · ****3344' },
    ],
  },
  cylinder: {
    title: 'Book a Cylinder',
    brand: 'India Pay Now Utilities',
    Icon: Flame,
    accent: '#ea580c',
    soft: '#ffedd5',
    accountLabel: 'Consumer number',
    placeholder: 'LPG consumer number',
    cta: 'Book Cylinder',
    tip: 'Book refill and pay instantly — confirmation on SMS.',
    providers: ['Indane', 'HP Gas', 'Bharat Gas'],
    quickAmounts: [900, 950, 1100],
    sampleBills: [
      { label: '14.2kg Domestic', due: 'Available now', amount: 903, meta: 'Indane · ****7781' },
    ],
  },
  challan: {
    title: 'Traffic Challan',
    brand: 'India Pay Now Mobility',
    Icon: Building2,
    accent: '#d97706',
    soft: '#fff1e6',
    accountLabel: 'Challan / vehicle number',
    placeholder: 'Challan no. or MH12AB1234',
    cta: 'Pay Challan',
    tip: 'Clear pending challans early to avoid extra penalties.',
    providers: ['Delhi Traffic', 'Mumbai Traffic', 'Bengaluru Traffic', 'Hyderabad Traffic'],
    quickAmounts: [500, 1000, 2000, 5000],
    sampleBills: [
      { label: 'Signal Jump', due: 'Pending', amount: 1000, meta: 'DL · ****4521' },
    ],
  },
};

const defaultConfig = {
  title: 'Bill Payment',
  brand: 'India Pay Now Pay',
  Icon: Building2,
  accent: '#0070ba',
  soft: '#eef5ff',
  accountLabel: 'Account / customer number',
  placeholder: 'Enter details',
  cta: 'Proceed to Pay',
  tip: 'Pay securely from your India Pay Now wallet.',
  providers: ['Popular providers'],
  quickAmounts: [500, 1000, 2000],
  sampleBills: [],
};

export function BillPayBox({
  service = 'broadband',
  account,
  amount,
  onAccountChange,
  onAmountChange,
  onPay,
  loading = false,
}) {
  const config = serviceConfig[service] || { ...defaultConfig, title: service };
  const Icon = config.Icon;
  const [provider, setProvider] = useState(config.providers[0]);
  const [tab, setTab] = useState('bills');
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    setProvider(config.providers[0]);
    setTab('bills');
    setFetched(false);
  }, [service, config.providers]);

  const dueHint = useMemo(() => {
    if (!amount) return 'Enter amount or pick a pending bill';
    return `Ready to pay ${formatINR(amount)}`;
  }, [amount]);

  const fetchBill = () => {
    if (!account?.trim()) return;
    const bill = config.sampleBills[0];
    if (bill) onAmountChange?.(String(bill.amount));
    setFetched(true);
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
      <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{ background: `radial-gradient(ellipse at top right, ${config.soft}, transparent 55%)` }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ background: config.accent }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{config.brand}</p>
              <h2 className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-[#111]">{config.title}</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">{config.tip}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: config.soft, color: config.accent }}>
            <Sparkles className="h-3.5 w-3.5" /> Instant wallet pay
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(300px,400px)_1fr]">
        <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Provider</label>
            <div className="relative mt-1.5">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm font-semibold text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              >
                {config.providers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{config.accountLabel}</label>
            <div className="relative mt-1.5">
              <input
                value={account}
                onChange={(e) => onAccountChange?.(e.target.value)}
                placeholder={config.placeholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              />
              {account && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => onAccountChange?.('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBill}
            disabled={!account?.trim()}
            className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[#0070ba]/50 hover:bg-[#f8fbff] hover:text-[#0070ba] disabled:opacity-40"
          >
            {fetched ? 'Bill fetched ✓' : 'Fetch bill details'}
          </button>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Amount</label>
              <span className="text-[11px] font-semibold text-slate-400">{dueHint}</span>
            </div>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => onAmountChange?.(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-3 font-display text-lg font-extrabold text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {config.quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onAmountChange?.(String(q))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    String(amount) === String(q)
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={String(amount) === String(q) ? { background: config.accent } : undefined}
                >
                  {formatINR(q)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,112,186,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: config.accent }}
          >
            {loading ? 'Processing…' : amount ? `${config.cta} · ${formatINR(amount)}` : config.cta}
          </button>

          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Secure wallet
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Instant confirmation
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex gap-4 text-sm font-semibold">
              {[
                ['bills', 'Pending bills'],
                ['recents', 'Recents'],
                ['offers', 'Offers'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`pb-2 transition ${
                    tab === id ? 'border-b-2 text-[#111]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  style={tab === id ? { borderColor: config.accent, color: config.accent } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400">{provider}</span>
          </div>

          {tab === 'bills' && (
            <div className="mt-4 space-y-3">
              {(config.sampleBills.length ? config.sampleBills : [{ label: 'No pending bills', due: 'Add account to fetch', amount: 0, meta: '—' }]).map((bill) => (
                <button
                  key={bill.label + bill.meta}
                  type="button"
                  disabled={!bill.amount}
                  onClick={() => {
                    if (!bill.amount) return;
                    onAmountChange?.(String(bill.amount));
                    if (!account) onAccountChange?.(bill.meta.split('·')[1]?.trim().replace(/\*/g, '9') || '9876543210');
                    setFetched(true);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm disabled:cursor-default disabled:opacity-70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#111]">{bill.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{bill.meta}</p>
                    <p className="mt-1 text-[11px] font-semibold" style={{ color: config.accent }}>
                      {bill.due}
                    </p>
                  </div>
                  {bill.amount > 0 && (
                    <span
                      className="shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold text-white"
                      style={{ background: config.accent }}
                    >
                      {formatINR(bill.amount)}
                    </span>
                  )}
                </button>
              ))}
              <p className="pt-1 text-[11px] text-slate-400">Demo bills for prototype. Live BBPS / partner APIs can plug in later.</p>
            </div>
          )}

          {tab === 'recents' && (
            <div className="mt-8 text-center text-sm text-slate-500">
              Recent {config.title.toLowerCase()} payments will show here.
            </div>
          )}

          {tab === 'offers' && (
            <div className="mt-4 space-y-3">
              {[
                { title: 'Wallet cashback', text: 'Get up to ₹50 back on your next payment.' },
                { title: 'Autopay setup', text: 'Never miss a due date — enable autopay in one tap.' },
              ].map((offer) => (
                <div key={offer.title} className="rounded-2xl border border-slate-100 px-4 py-3.5" style={{ background: config.soft }}>
                  <p className="text-sm font-bold text-[#111]">{offer.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{offer.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const billPayServices = new Set(Object.keys(serviceConfig));
