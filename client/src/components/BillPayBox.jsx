import { useEffect, useState } from 'react';
import { Building2, Car, Check, ChevronDown, Droplets, Flame, Landmark, ShieldCheck, Sparkles, Tv, Wifi, Zap } from 'lucide-react';
import { formatINR } from '../utils/format';
import { ServiceTabsBar } from './ServiceTabsBar';

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
  fieldErrors = {},
  showAvailable = false,
  siblingTabs = null,
  brandLabel = null,
  onServiceChange,
}) {
  const config = serviceConfig[service] || { ...defaultConfig, title: service };
  const [provider, setProvider] = useState(config.providers[0]);

  useEffect(() => {
    setProvider(config.providers[0]);
  }, [service, config.providers]);

  const fetchBill = () => {
    if (!account?.trim()) return;
    const bill = config.sampleBills[0];
    if (bill) onAmountChange?.(String(bill.amount));
  };

  const popularItems =
    config.sampleBills?.length > 0
      ? config.sampleBills
      : config.quickAmounts.map((q) => ({
          label: `Pay ${formatINR(q)}`,
          due: 'Quick pay',
          amount: q,
          meta: provider || 'Popular',
        }));

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#0070ba]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#5ba3d9]/15 blur-3xl" />

      {siblingTabs?.length ? (
        <ServiceTabsBar
          tabs={siblingTabs}
          activeId={service}
          brand={brandLabel || 'Bills'}
          onChange={onServiceChange}
        />
      ) : null}

      <div className="relative space-y-4 p-4 sm:p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={fetchBill}
            disabled={!account?.trim()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0070ba] disabled:text-slate-400"
          >
            Fetch bill
          </button>
          <span className="text-sm text-slate-500">{config.tip}</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-stretch lg:gap-4">
          <div className="grid gap-px overflow-hidden rounded-2xl bg-slate-200/70 ring-1 ring-slate-200 sm:grid-cols-3">
            <SearchField label="Provider" chevron>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 w-full appearance-none bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none sm:text-[18px]"
              >
                {config.providers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </SearchField>

            <SearchField label={config.accountLabel} error={fieldErrors.account}>
              <input
                value={account}
                onChange={(e) => onAccountChange?.(e.target.value)}
                placeholder={config.placeholder}
                className="mt-1 w-full bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none placeholder:font-semibold placeholder:text-slate-300 sm:text-[18px]"
              />
            </SearchField>

            <SearchField label="Amount" error={fieldErrors.amount}>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`font-display text-[17px] font-extrabold sm:text-[18px] ${
                    fieldErrors.amount ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => onAmountChange?.(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none placeholder:text-slate-300 sm:text-[18px]"
                />
              </div>
            </SearchField>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="rounded-2xl bg-[#00baf2] px-8 py-4 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,186,242,0.35)] transition hover:bg-[#00a7d9] disabled:opacity-60 lg:min-w-[160px]"
          >
            {loading ? 'Processing…' : amount ? `Pay ${formatINR(amount)}` : config.cta.replace(/^(Pay |Recharge |Book )/, '') || 'Pay'}
          </button>
        </div>

        {!showAvailable ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-slate-500">Popular now</span>
            {config.quickAmounts.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onAmountChange?.(String(q))}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  String(amount) === String(q)
                    ? 'border-[#0070ba] bg-[#eef5ff] text-[#0070ba]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#0070ba]/40 hover:bg-[#eef5ff] hover:text-[#0070ba]'
                }`}
              >
                {formatINR(q)}
              </button>
            ))}
          </div>
        ) : (
          <div id="popular-plans" className="space-y-4 border-t border-slate-100 pt-4 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#111]">Popular options</p>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> {provider}
                </span>
              </div>
              <p className="text-xs text-slate-500">{account || 'Select below'}</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {config.quickAmounts.map((q) => {
                const active = String(amount) === String(q);
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onAmountChange?.(String(q))}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      active ? 'bg-[#0070ba] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formatINR(q)}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {popularItems.map((item) => {
                const selected = String(amount) === String(item.amount);
                return (
                  <button
                    key={item.label + item.meta}
                    type="button"
                    onClick={() => {
                      onAmountChange?.(String(item.amount));
                      if (!account && item.meta) {
                        const digits = String(item.meta).replace(/[^\d]/g, '').slice(-10);
                        if (digits) onAccountChange?.(digits);
                      }
                    }}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected
                        ? 'border-[#0070ba] bg-[#eef5ff] shadow-[0_0_0_1px_#0070ba]'
                        : 'border-slate-100 bg-slate-50/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-base font-extrabold text-[#111]">{item.label}</p>
                          {selected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0070ba] px-2 py-0.5 text-[10px] font-bold text-white">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{item.meta}</p>
                        <p className="mt-1 text-[11px] font-semibold text-[#0070ba]">{item.due}</p>
                      </div>
                      <span className="rounded-xl bg-[#00baf2] px-2.5 py-1.5 text-sm font-extrabold text-white">
                        {formatINR(item.amount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchField({ label, chevron, error, children }) {
  return (
    <label
      className={`group relative flex min-h-[88px] cursor-text flex-col items-start justify-center px-4 py-3 text-left transition sm:px-5 ${
        error ? 'bg-red-50 ring-2 ring-inset ring-red-400' : 'bg-white hover:bg-slate-50/80'
      }`}
    >
      <span
        className={`flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
          error ? 'text-red-600' : 'text-slate-400'
        }`}
      >
        {label}
        {error ? <span className="normal-case tracking-normal">· required</span> : null}
        {chevron ? (
          <ChevronDown className={`ml-auto h-3.5 w-3.5 ${error ? 'text-red-400' : 'text-slate-400'}`} />
        ) : null}
      </span>
      {children}
      {error ? <span className="mt-1 text-[11px] font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

export const billPayServices = new Set(Object.keys(serviceConfig));
