import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Car,
  Check,
  FileWarning,
  Flame,
  Home,
  Landmark,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { AppDownloadOffers, GiftOfferCard } from '../components/AppDownloadOffers';
import { serviceCatalog, catalogServicePath } from '../data/services';
import { mobilePlans } from '../data/recharge';
import { GIFT_OFFER } from '../data/appDownload';

const telecomBrands = [
  { name: 'Jio', src: '/logos/jio.svg', accent: '#0A2885' },
  { name: 'Airtel', src: '/logos/airtel.svg', accent: '#ED1D24' },
  { name: 'Vi', src: '/logos/vi.svg', accent: '#EE2737' },
  { name: 'BSNL', src: '/logos/bsnl.svg', accent: '#003399' },
];

const featurePills = ['Send money', 'Bill pay', 'Recharges', 'Business'];

const featureCards = [
  {
    tone: 'dark',
    title: 'Split & settle',
    text: 'No more awkward reminders — just seamless sharing with friends and family.',
  },
  {
    tone: 'photo',
    title: 'Instant payments',
    text: 'Need to pay someone back? Send money in a few taps.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
  },
  {
    tone: 'soft',
    title: GIFT_OFFER.title,
    text: GIFT_OFFER.text,
    amount: GIFT_OFFER.amount,
  },
];

const serviceRows = [
  {
    label: 'Recharges',
    catalogId: 'recharges',
    items: [
      [Smartphone, 'Mobile', 'bg-[#e8f4ff] text-[#0070ba]', 'mobile-recharge'],
      [Car, 'FASTag', 'bg-[#fff1e6] text-[#d97706]', 'fastag'],
      [Tv, 'DTH', 'bg-[#f3e8ff] text-[#7c3aed]', 'dth-recharge'],
      [Zap, 'Meter', 'bg-[#ecfdf5] text-[#059669]', 'prepaid-meter'],
    ],
  },
  {
    label: 'Bills',
    catalogId: 'bills',
    items: [
      [Zap, 'Electricity', 'bg-[#fef9c3] text-[#ca8a04]', 'electricity-bill'],
      [Wifi, 'Broadband', 'bg-[#e0f2fe] text-[#0284c7]', 'broadband'],
      [Flame, 'Gas', 'bg-[#ffe4e6] text-[#e11d48]', 'piped-gas'],
      [Landmark, 'Loan EMI', 'bg-[#eef2ff] text-[#4f46e5]', 'loan'],
    ],
  },
  {
    label: 'Everyday',
    catalogId: 'other',
    items: [
      [Smartphone, 'UPI Pay', 'bg-[#dcfce7] text-[#16a34a]', 'mobile-recharge'],
      [Building2, 'Bank', 'bg-[#e8f4ff] text-[#0070ba]', 'loan'],
      [FileWarning, 'Challan', 'bg-[#ffedd5] text-[#ea580c]', 'traffic-challan'],
      [Home, 'Rent', 'bg-[#f1f5f9] text-[#475569]', 'rentals'],
    ],
  },
];

const iconTones = [
  'bg-[#e8f4ff] text-[#0070ba]',
  'bg-[#fff1e6] text-[#d97706]',
  'bg-[#f3e8ff] text-[#7c3aed]',
  'bg-[#ecfdf5] text-[#059669]',
  'bg-[#fef9c3] text-[#ca8a04]',
  'bg-[#e0f2fe] text-[#0284c7]',
  'bg-[#ffe4e6] text-[#e11d48]',
  'bg-[#eef2ff] text-[#4f46e5]',
  'bg-[#dcfce7] text-[#16a34a]',
  'bg-[#ffedd5] text-[#ea580c]',
  'bg-[#f1f5f9] text-[#475569]',
];

function getPopupServices(catalogId) {
  const group = serviceCatalog.find((g) => g.id === catalogId);
  if (!group) return [];
  if (catalogId === 'other') {
    const extras = serviceCatalog.find((g) => g.id === 'book')?.items || [];
    return [...group.items, ...extras.filter((i) => ['gas', 'gold'].includes(i[0]))];
  }
  return group.items;
}

function FloatBrandTile({ src, alt, logoScale = 1, size = 'sm' }) {
  const box = size === 'lg' ? 'h-[118px] w-[118px] rounded-[1.6rem]' : 'h-[72px] w-[72px] rounded-[1.15rem]';
  const logo = size === 'lg' ? 'h-[46%] w-[72%]' : 'h-[44%] w-[70%]';

  return (
    <div
      className={`flex items-center justify-center border border-white bg-white shadow-[0_18px_46px_rgba(15,23,42,0.12)] ring-1 ring-[#0070ba]/15 ${box}`}
    >
      <img
        src={src}
        alt={alt}
        className={`${logo} object-contain`}
        style={{ transform: `scale(${logoScale})` }}
      />
    </div>
  );
}

export default function Landing() {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [activeServices, setActiveServices] = useState(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeOperator, setRechargeOperator] = useState('Jio');
  const [rechargeMobile, setRechargeMobile] = useState('');

  const popupItems = activeServices ? getPopupServices(activeServices.catalogId) : [];
  const openRecharge = (operator = 'Jio') => {
    setRechargeOperator(operator);
    setRechargeOpen(true);
  };

  return (
    <div className="min-h-dvh min-h-screen overflow-x-hidden bg-[#f7f8fa] text-[#111111]">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 md:pb-16 md:pt-16">
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-stretch md:gap-10 lg:gap-14">
          <div className="fade-up flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0070ba] shadow-sm ring-1 ring-slate-200/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
              </span>
              Live in 28+ cities across India
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.25rem]">
              We&apos;re here to help you take control of your money and turn{' '}
              <span className="text-slate-400">your dreams into reality.</span>
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0070ba]" /> Bank-grade security
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#0070ba]" /> Instant UPI
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#0070ba]" /> 24/7 support
              </span>
            </div>
          </div>

          <div className="fade-up flex flex-col gap-4" style={{ animationDelay: '80ms' }}>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.1)] sm:rounded-[2rem]">
              <div className="relative overflow-hidden bg-[linear-gradient(145deg,#0070ba_0%,#003087_55%,#001c64_100%)] px-5 pb-5 pt-5 text-white sm:px-6 sm:pb-6 sm:pt-6">
                <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-[#5ba3d9]/30 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-extrabold tracking-tight">India Pay Now</p>
                    <p className="mt-1.5 text-xs font-medium text-white/65">UPI linked</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="flex h-6 w-[3.5rem] items-center justify-center sm:h-7 sm:w-16">
                      <img
                        src="/logos/upi-on-dark.svg"
                        alt="UPI"
                        title="Unified Payments Interface"
                        className="max-h-full max-w-full object-contain"
                      />
                    </span>
                    <span className="flex h-8 w-[4.75rem] items-center justify-center sm:h-9 sm:w-[5.25rem]">
                      <img
                        src="/logos/bbps-on-dark.svg"
                        alt="Bharat BillPay"
                        title="Bharat BillPay (BBPS)"
                        className="max-h-full max-w-full object-contain"
                      />
                    </span>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-3 gap-2">
                  {[
                    [ArrowUpRight, 'Send', '/register'],
                    [ArrowDownLeft, 'Request', '/register'],
                    [QrCode, 'Scan', '/register'],
                    [Smartphone, 'Mobile', '/register'],
                    [Zap, 'Electricity', '/register'],
                    [Car, 'FASTag', '/register'],
                  ].map(([Icon, label, to]) => (
                    <Link
                      key={label}
                      to={to}
                      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/12 py-3 text-center ring-1 ring-white/15 transition hover:bg-white/20"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#003087]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-bold text-white">{label}</span>
                    </Link>
                  ))}
                </div>

                <Link
                  to="/register"
                  className="relative mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-white py-2.5 text-sm font-bold text-[#003087] transition hover:bg-slate-100"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm leading-relaxed text-slate-500 md:text-[15px]">
                India Pay Now makes sending money, paying bills, and running your business feel effortless —
                secure, fast, and built for everyday India.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {featurePills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    {pill}
                  </span>
                ))}
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
                  <Plus className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fade-up relative mt-10 overflow-hidden rounded-[2rem] md:mt-12 md:rounded-[2.5rem]"
          style={{ animationDelay: '140ms' }}
        >
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80"
            alt="People sharing a payment moment"
            className="h-[280px] w-full object-cover sm:h-[360px] md:h-[440px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <p className="text-sm font-semibold text-white/80">India Pay Now</p>
              <p className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">Payments Made Simple</p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#111] transition hover:bg-slate-100"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global payments — Skydo-style hero */}
      <section id="exports" className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(180deg,#f7fafc_0%,#eef4ff_42%,#f8fbff_100%)]" />
        <div className="pointer-events-none absolute left-[6%] top-[16%] h-56 w-56 rounded-full bg-[#0070ba]/12 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[20%] h-64 w-64 rounded-full bg-[#00baf2]/16 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8 flex items-center justify-center gap-5 md:hidden">
            <FloatBrandTile src="/logos/upi.svg" alt="UPI" logoScale={0.82} />
            <FloatBrandTile src="/logos/bbps.svg" alt="Bharat BillPay" />
          </div>

          <div className="pointer-events-none absolute -left-1 top-6 hidden -rotate-[10deg] md:-left-8 md:block lg:-left-14">
            <div className="float-soft">
              <FloatBrandTile src="/logos/upi.svg" alt="UPI" logoScale={0.82} size="lg" />
            </div>
          </div>
          <div className="pointer-events-none absolute -right-1 top-10 hidden rotate-[9deg] md:-right-8 md:block lg:-right-14">
            <div className="float-soft-alt">
              <FloatBrandTile src="/logos/bbps.svg" alt="Bharat BillPay" size="lg" />
            </div>
          </div>

          <h2 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-[#001c64] sm:text-4xl md:text-[2.85rem]">
            Send and receive{' '}
            <span className="text-[#f58220]">across countries</span>
            <br className="hidden sm:block" />
            <span className="sm:ml-1">at zero hidden fees</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-600 md:text-[1.05rem]">
            <span className="font-semibold text-emerald-600">3× cheaper</span> than traditional wire
            transfers. <span className="font-semibold text-emerald-600">Instant</span> UPI settlement
            and <span className="font-semibold text-emerald-600">dedicated</span> India support.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#001c64] px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,28,100,0.28)] transition hover:bg-[#003087]"
          >
            Start sending now
          </Link>

          <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-slate-200/80 pt-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-5 w-5 text-[#0070ba]" />
              Bank-grade secure
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Landmark className="h-5 w-5 text-[#0070ba]" />
              Partner banks
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Building2 className="h-5 w-5 text-[#0070ba]" />
              ISO 27001
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live FX rates
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="personal" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#5ba3d9]">Our Features</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Made for You:{' '}
            <span className="text-slate-400">Easy, Fast, and Smart Payments</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          <div className="rounded-[1.75rem] bg-[#111] p-6 text-white md:min-h-[280px] md:rounded-[2rem] md:p-7">
            <div className="flex -space-x-2">
              {telecomBrands.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  title={`${brand.name} recharge`}
                  onClick={() => openRecharge(brand.name)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#111] bg-white transition hover:z-10 hover:scale-110"
                >
                  <img src={brand.src} alt={brand.name} className="h-full w-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                title="Open recharge"
                onClick={() => openRecharge('Jio')}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111] bg-white text-[#111] transition hover:z-10 hover:scale-110 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-10 font-display text-xl font-bold leading-snug md:mt-16">
              Recharge any number in seconds — Jio, Airtel, Vi &amp; BSNL.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] md:min-h-[280px] md:rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
              alt="Paying on mobile"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/10" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-between p-6 md:min-h-[280px] md:p-7">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                India Pay Now
              </div>
              <p className="font-display text-xl font-bold text-white">Pay anyone. Anytime.</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#dcebff] p-6 md:min-h-[280px] md:rounded-[2rem] md:p-7">
            <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0070ba] text-sm font-bold text-white">
                  C
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Payment received</p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#0070ba]">Well done! You got ₹2,500 🌟</p>
            </div>
            <p className="mt-8 font-display text-xl font-bold leading-snug text-slate-800 md:mt-12">
              Celebrate every successful transfer with clarity and confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Feature carousel */}
      <section className="mx-auto max-w-6xl px-4 pb-10 md:pb-12">
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {featureCards.map((card, i) => {
            const active = i === featureIndex;
            if (card.tone === 'soft') {
              return (
                <GiftOfferCard key={card.title} active={active} onSelect={() => setFeatureIndex(i)} />
              );
            }
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setFeatureIndex(i)}
                className={`overflow-hidden rounded-[1.75rem] text-left transition md:rounded-[2rem] ${
                  active ? 'ring-2 ring-[#111]/20' : 'opacity-95 hover:opacity-100'
                } ${card.tone === 'dark' ? 'bg-[#111] text-white' : ''} ${
                  card.tone === 'photo' ? 'relative min-h-[260px] text-white' : 'p-6 md:min-h-[260px] md:p-7'
                }`}
              >
                {card.tone === 'photo' && (
                  <>
                    <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative flex h-full min-h-[260px] flex-col justify-end p-6 md:p-7">
                      <h3 className="font-display text-2xl font-bold">{card.title}</h3>
                      <p className="mt-2 text-sm text-white/85">{card.text}</p>
                    </div>
                  </>
                )}
                {card.tone === 'dark' && (
                  <>
                    <div className="mb-8 h-px w-12 bg-white/30" />
                    <h3 className="mt-auto font-display text-2xl font-bold">{card.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{card.text}</p>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {featureCards.map((card, i) => (
            <button
              key={card.title}
              type="button"
              aria-label={`Show feature ${i + 1}`}
              onClick={() => setFeatureIndex(i)}
              className={`h-2 rounded-full transition ${i === featureIndex ? 'w-6 bg-[#111]' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </section>

      {/* Services anywhere */}
      <section id="payments" className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#eef1f4] px-4 py-12 sm:px-6 md:rounded-[2.5rem] md:px-10 md:py-16">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#5ba3d9]">Everyday payments</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Pay Anything, Anytime
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:rounded-[1.75rem]">
            {serviceRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 items-center gap-4 px-5 py-6 sm:grid-cols-[140px_1fr_auto] sm:gap-6 sm:px-8 sm:py-7 ${
                  idx < serviceRows.length - 1 ? 'border-b border-[#eef1f4]' : ''
                }`}
              >
                <p className="text-[15px] font-semibold tracking-tight text-[#111]">{row.label}</p>
                <div className="flex min-w-0 flex-wrap gap-2.5">
                  {row.items.map(([Icon, label, tone, slug]) => (
                    <Link
                      key={label}
                      to={catalogServicePath(slug)}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-[#1f2937] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveServices(row)}
                  className="justify-self-start text-sm font-medium text-slate-500 transition hover:text-[#111] sm:justify-self-end"
                >
                  Show all +
                </button>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-500 md:text-[15px]">
            Paying bills and recharging is as easy as sending money to a friend. Whether it&apos;s mobile, FASTag,
            electricity, or rent — India Pay Now keeps every payment fast and secure.
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              to="/register"
              className="inline-flex rounded-full bg-[#111] px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:bg-black"
            >
              Start paying
            </Link>
          </div>
        </div>
      </section>

      <AppDownloadOffers />

      {/* Dark CTA */}
      <section id="developer" className="bg-[#0a0a0a] px-4 py-20 text-center text-white md:py-28">
        <p className="text-sm font-semibold text-[#8ec4ef]">Unlock the future of payments</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
          Start sending money, saving smart, and{' '}
          <span className="text-slate-500">taking control of your finances.</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold text-[#111] transition hover:bg-slate-100"
          >
            Learn more
          </Link>
          <Link
            to="/login"
            className="inline-flex rounded-full border border-white/30 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Get the app
          </Link>
        </div>
      </section>

      <SiteFooter />

      {rechargeOpen && (
        <div className="popup-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[6px]"
            aria-label="Close recharge"
            onClick={() => setRechargeOpen(false)}
          />

          <div className="popup-panel relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] ring-1 ring-slate-200/80 sm:max-w-lg sm:rounded-[2rem]">
            <div className="relative border-b border-slate-100 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f7f8fa] px-5 pb-5 pt-6 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0070ba] shadow-sm ring-1 ring-slate-200/80">
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile recharge
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                    Recharge in seconds
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">Pick operator, enter number, choose a plan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRechargeOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex gap-2">
                {telecomBrands.map((brand) => {
                  const selected = rechargeOperator === brand.name;
                  return (
                    <button
                      key={brand.name}
                      type="button"
                      onClick={() => setRechargeOperator(brand.name)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 transition ${
                        selected
                          ? 'border-[#0070ba] bg-[#e8f4ff] ring-2 ring-[#0070ba]/15'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
                        <img src={brand.src} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="text-[11px] font-bold text-[#111]">{brand.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#f7f8fa] px-5 py-5 sm:px-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#111]">Mobile number</span>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={rechargeMobile}
                    onChange={(e) => setRechargeMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-[#111] outline-none transition focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/15"
                  />
                </div>
              </label>

              <p className="mb-2 mt-5 text-sm font-semibold text-[#111]">Popular plans · {rechargeOperator}</p>
              <div className="space-y-2.5">
                {mobilePlans
                  .filter((p) => p.type === 'Popular')
                  .map((plan) => (
                    <Link
                      key={`${plan.price}-${plan.data}`}
                      to="/services/mobile-recharge"
                      onClick={() => setRechargeOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200/70 bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition hover:border-[#0070ba]/25 hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111]">{plan.data}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {plan.validity} · {plan.desc}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#111] px-3.5 py-2 text-sm font-bold text-white">
                        ₹{plan.price}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
              <Link
                to="/services/mobile-recharge"
                onClick={() => setRechargeOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0070ba] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,112,186,0.28)] transition hover:bg-[#005ea6]"
              >
                Continue to recharge <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeServices && (
        <div className="popup-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[6px]"
            aria-label="Close services"
            onClick={() => setActiveServices(null)}
          />

          <div className="popup-panel relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] ring-1 ring-slate-200/80 sm:max-w-3xl sm:rounded-[2rem]">
            {/* Light header */}
            <div className="relative border-b border-slate-100 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f7f8fa] px-6 pb-6 pt-6 sm:px-8 sm:pt-7">
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0070ba] shadow-sm ring-1 ring-slate-200/80">
                    <Sparkles className="h-3.5 w-3.5" />
                    {popupItems.length} services
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
                    {activeServices.label}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Pick any service and continue in seconds — fast, secure, and made for India.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveServices(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
                {activeServices.items.map(([Icon, label, tone]) => (
                  <span
                    key={label}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-[#111] shadow-sm"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${tone}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Services grid */}
            <div className="flex-1 overflow-y-auto bg-[#f7f8fa] px-5 py-5 sm:px-7 sm:py-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {popupItems.map(([slug, label, Icon], i) => (
                  <Link
                    key={slug}
                    to={catalogServicePath(slug)}
                    onClick={() => setActiveServices(null)}
                    style={{ animationDelay: `${60 + i * 35}ms` }}
                    className="popup-item group relative flex items-center gap-3.5 overflow-hidden rounded-[1.25rem] border border-slate-200/70 bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#0070ba]/20 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconTones[i % iconTones.length]} transition group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[#111]">{label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">Instant • Secure • Easy</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-black transition group-hover:bg-[#0070ba] group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
              <p className="hidden text-sm text-slate-500 sm:block">New here? Create your free account.</p>
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveServices(null)}
                  className="flex-1 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                >
                  Close
                </button>
                <Link
                  to="/register"
                  onClick={() => setActiveServices(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0070ba] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,112,186,0.25)] transition hover:bg-[#005ea6] sm:flex-none"
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
