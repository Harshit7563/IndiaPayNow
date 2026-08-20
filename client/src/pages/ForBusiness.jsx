import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Code2,
  FileSpreadsheet,
  Globe2,
  Landmark,
  Layers,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { CONTACT_EMAIL } from '../data/siteConfig';

function PageLink({ to, children, className, ...props }) {
  const sameTab = String(to).startsWith('/login');
  return (
    <Link
      to={to}
      className={className}
      {...(sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
    </Link>
  );
}

const MERCHANT_QR_VALUE =
  'upi://pay?pa=store@indiapaynow&pn=India%20Pay%20Now&cu=INR&tn=Merchant%20collect';

function MerchantQrHero() {
  return (
    <div className="relative mx-auto w-full max-w-[400px] lg:mx-0 lg:ml-auto">
      <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#00baf2]/22 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#0070ba]/16 blur-3xl" />

      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-1.5">
        <span className="merchant-lockup-retail inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-[#001c64] shadow-sm">
          <Store className="h-3.5 w-3.5 text-[#0070ba]" /> Retail
        </span>
        <span className="merchant-plus text-sm font-extrabold text-[#00baf2]">+</span>
        <span className="merchant-lockup-qr inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-[#001c64] shadow-sm">
          <QrCode className="h-3.5 w-3.5 text-[#0070ba]" /> QR
        </span>
        <span className="merchant-plus text-sm font-extrabold text-[#00baf2]">+</span>
        <span className="merchant-lockup-ipn inline-flex items-center gap-1.5 rounded-full bg-[#001c64] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          India Pay Now
        </span>
      </div>

      <div className="merchant-qr-float relative">
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(0,28,100,0.16)]">
          <div className="flex items-center justify-between bg-[#001c64] px-4 py-2.5">
            <p className="font-display text-sm font-extrabold text-white">India Pay Now</p>
            <img src="/logos/upi-on-dark.svg" alt="UPI" className="h-5 w-auto object-contain" />
          </div>

          <div
            className="relative h-[13px] bg-[#0070ba]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg,#0070ba 0 18px,#00baf2 18px 22px,#0070ba 22px 40px)',
            }}
          />
          <div className="flex justify-between px-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-2.5 w-7 rounded-b-full bg-[#00baf2]" />
            ))}
          </div>

          <div className="relative bg-[linear-gradient(180deg,#eef6fb_0%,#f7f8fa_55%,#e8eef5_100%)] px-4 pb-3 pt-3">
            <p className="text-center font-display text-sm font-extrabold tracking-wide text-[#001c64]">
              PRIYA RETAIL
            </p>
            <p className="text-center text-[10px] font-semibold text-[#0070ba]">Collect with India Pay Now</p>

            <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
              <div>
                <div className="mb-2 grid grid-cols-4 gap-1.5">
                  {['#001c64', '#0070ba', '#00baf2', '#f58220', '#0070ba', '#001c64', '#00baf2', '#0070ba'].map(
                    (color, i) => (
                      <span
                        key={i}
                        className="h-7 rounded-md shadow-sm"
                        style={{ backgroundColor: color, opacity: 0.85 }}
                      />
                    )
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex flex-col items-center">
                    <span className="h-7 w-7 rounded-full bg-[#f4c7a1] ring-2 ring-white" />
                    <span className="h-10 w-9 rounded-t-2xl bg-[#001c64]" />
                  </div>
                  <p className="mb-2 text-[10px] font-bold leading-tight text-slate-500">
                    Counter
                    <br />
                    open
                  </p>
                </div>
              </div>

              <div className="merchant-qr-frame relative rounded-2xl bg-white p-2 shadow-[0_8px_24px_rgba(0,28,100,0.12)]">
                <div className="relative overflow-hidden rounded-xl bg-white">
                  <QRCodeSVG
                    value={MERCHANT_QR_VALUE}
                    size={108}
                    level="M"
                    fgColor="#001c64"
                    bgColor="#ffffff"
                  />
                  <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-[#0070ba]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="merchant-qr-scan pointer-events-none absolute left-1 right-1 h-0.5 rounded-full bg-[#00baf2] shadow-[0_0_12px_3px_rgba(0,186,242,0.7)]" />
                </div>
                <p className="mt-1.5 text-center text-[9px] font-bold text-[#001c64]">Scan &amp; pay</p>
              </div>
            </div>

            <div className="relative mt-2 h-3 rounded-sm bg-[#6b4423] shadow-inner" />
            <div className="h-2 rounded-b-md bg-[#4a2e16]" />
          </div>
        </div>

        <div className="merchant-qr-phone absolute -right-2 bottom-10 w-[78px] sm:-right-6">
          <div className="rounded-[1.05rem] border-[3px] border-[#111] bg-[#111] p-1 shadow-[0_16px_32px_rgba(0,0,0,0.28)]">
            <div className="relative overflow-hidden rounded-[0.75rem] bg-[#001c64] px-1 pb-1.5 pt-2.5">
              <span className="absolute left-1/2 top-0.5 h-1 w-7 -translate-x-1/2 rounded-full bg-white/25" />
              <div className="mx-auto mt-1 flex h-11 w-11 items-center justify-center rounded-md border border-white/30 bg-white/10">
                <QrCode className="h-6 w-6 text-white/90" strokeWidth={1.4} />
              </div>
              <p className="mt-1 text-center text-[7px] font-bold text-white/80">India Pay Now</p>
            </div>
          </div>
        </div>

        <div className="merchant-rupee absolute right-16 top-28 flex h-8 w-8 items-center justify-center rounded-full bg-[#00baf2] font-display text-sm font-extrabold text-[#001c64] shadow-lg">
          ₹
        </div>

        <div className="merchant-qr-paid absolute left-3 top-[4.4rem] inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
          <Check className="h-3.5 w-3.5" strokeWidth={3} /> Paid on India Pay Now
        </div>
      </div>
    </div>
  );
}

const heroStats = [
  ['Instant', 'Typical bank settle'],
  ['UPI + QR', 'In-store collect'],
  ['GSTIN + PAN', 'Before go-live'],
  ['24×7', 'Status on dashboard'],
];

const pillars = [
  {
    kicker: '01',
    title: 'One interoperable platform',
    text: 'Keep Tally, Excel, or your own app. Payment links, QR, invoices, refunds, and settlements still land in one India Pay Now dashboard — no extra gateway hopping.',
    points: [
      'UPI collect, payment links, and export checkout on the same merchant ID',
      'Webhooks and CSV so accounting stays in sync',
      'Sandbox first, then live keys after KYC',
    ],
    visual: 'interop',
  },
  {
    kicker: '02',
    title: 'Verified businesses only',
    text: 'GSTIN, PAN, and bank match before QR or payouts go live. You transact with KYC’d counterparties instead of starting background checks from scratch.',
    points: [
      'Business KYC typically under 24 hours for complete packs',
      'Settlement account name-matched before the first credit',
      'Masked IDs on receipts — last-4 only',
    ],
    visual: 'verified',
  },
  {
    kicker: '03',
    title: 'Credit from real collections',
    text: 'Buyer-approved invoices and settlement history sit on the same rails. Financiers can underwrite using on-platform payment behaviour, not a folder of PDFs.',
    points: [
      'Invoice-tagged receipts for working-capital conversations',
      'Clear paid / pending / failed states for every link',
      'Export history ready for your CA or lender',
    ],
    visual: 'credit',
  },
];

function PillarVisual({ kind }) {
  if (kind === 'interop') {
    return (
      <div className="rounded-[1.75rem] bg-[#001c64] p-5 text-white shadow-[0_20px_50px_rgba(0,28,100,0.18)] md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/55">India Pay Now dashboard</p>
          <span className="rounded-full bg-[#00baf2]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#00baf2]">Live</span>
        </div>
        <div className="mt-4 space-y-2">
          {[
            ['Payment link', 'Paid'],
            ['Merchant QR', '₹8,400'],
            ['Export collect', 'Settling'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-white/8 px-3.5 py-2.5 ring-1 ring-white/10">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs font-bold text-[#00baf2]">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Tally', 'Excel', 'Your app'].map((src) => (
            <span key={src} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/80">
              {src}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (kind === 'verified') {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-6">
        <p className="text-xs font-semibold text-[#0070ba]">Business KYC</p>
        <div className="mt-4 space-y-3">
          {[
            ['GSTIN', '29AAAAA0000A1Z5'],
            ['PAN', 'AAAAA0000A'],
            ['Bank match', 'HDFC ···· 4281'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-[#f7f8fa] px-3.5 py-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-bold text-[#111]">{value}</p>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#001c64] px-3 py-1.5 text-[11px] font-bold text-white">
          <BadgeCheck className="h-3.5 w-3.5 text-[#00baf2]" /> Verified merchant
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] bg-[#f0f7ff] p-5 md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#0070ba]">Collection history</p>
        <span className="text-[11px] font-bold text-[#001c64]">Credit ready</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full w-[78%] rounded-full bg-[#00baf2]" />
      </div>
      <div className="mt-4 space-y-2">
        {[
          ['INV-1042', 'Paid', 'text-emerald-600'],
          ['INV-1041', 'Pending', 'text-amber-600'],
          ['INV-1038', 'Failed', 'text-rose-500'],
        ].map(([id, status, color]) => (
          <div key={id} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
            <span className="text-sm font-bold text-[#111]">{id}</span>
            <span className={`text-xs font-bold ${color}`}>{status}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] font-semibold text-slate-500">Underwrite from on-platform behaviour — not PDFs.</p>
    </div>
  );
}

const lifecycle = [
  {
    icon: Building2,
    title: 'Onboarding',
    text: 'Register with GSTIN + PAN. Add a settlement bank. Collect the same day KYC clears.',
    detail: ['Business name and GSTIN checksum', 'PAN holder type for companies', 'IFSC + account match'],
    to: '/for-business/open-account',
  },
  {
    icon: FileSpreadsheet,
    title: 'Invoicing',
    text: 'Turn an invoice into a payment link. Share on WhatsApp or email. Status updates as the buyer pays.',
    detail: ['Fixed or open amount', 'Expiry on the link', 'Customer name and mobile on the receipt'],
    to: '/for-business/payment-links',
  },
  {
    icon: Wallet,
    title: 'Financing',
    text: 'Use approved invoices and collection history when you raise merchant credit or export working capital.',
    detail: ['Paid invoice trail', 'Settlement UTRs', 'Buyer repeat behaviour'],
    to: '/for-business/exports',
  },
  {
    icon: QrCode,
    title: 'Collections',
    text: 'Counter QR, amount QR, and bulk links. Buyers pay many invoices in one go. You see it live.',
    detail: ['Print-ready static QR', 'Dynamic QR with bill amount', 'UPI intent on phones'],
    to: '/for-business/merchant-qr',
  },
  {
    icon: RefreshCw,
    title: 'Settlement',
    text: 'Invoice-tagged receipts, an AR-style dashboard, and T+1 credit to your business bank.',
    detail: ['Available vs processing', 'UTR on every settle', 'CSV for month-end'],
    to: '/for-business/settlements',
  },
];

const audiences = [
  {
    icon: Store,
    title: 'Retail & counters',
    text: 'Print a QR, collect UPI at the till, and see the day’s take before you close the shutter.',
  },
  {
    icon: Globe2,
    title: 'Exporters & freelancers',
    text: 'Share a checkout with overseas buyers. FX is shown clearly. Rupees settle to your Indian bank.',
  },
  {
    icon: Users,
    title: 'B2B suppliers',
    text: 'Send invoice links in bulk. Remind unpaid buyers. Reconcile without chasing screenshots.',
  },
  {
    icon: Code2,
    title: 'Platforms & apps',
    text: 'Same collect APIs for wallets, marketplaces, and SaaS. Webhooks for success, fail, and refund.',
  },
];

const products = [
  {
    kicker: 'Collect',
    title: 'Payment Links',
    text: 'Create a link in seconds — amount, note, expiry. Share anywhere. Track paid vs pending without a spreadsheet.',
    to: '/for-business/payment-links',
    stats: [
      ['Share', 'WhatsApp & email'],
      ['Track', 'Paid / pending'],
      ['Pay-in', 'UPI, cards, netbanking'],
    ],
  },
  {
    kicker: 'In-store',
    title: 'Merchant QR',
    text: 'A branded QR that turns footfall into UPI. Static for the counter, dynamic when the bill amount must be exact.',
    to: '/for-business/merchant-qr',
    stats: [
      ['Static', 'Print ready'],
      ['Dynamic', 'Amount QR'],
      ['Reports', 'Daily close'],
    ],
  },
  {
    kicker: 'Global',
    title: 'Exports',
    text: 'Get paid from overseas. Settle straight to India. Built for invoices, retainers, and export orders — not a maze of gateways.',
    to: '/for-business/exports',
    stats: [
      ['One link', 'Share worldwide'],
      ['FX', 'USD → INR shown'],
      ['Bank', 'Next business day'],
    ],
  },
  {
    kicker: 'Money out',
    title: 'Settlements',
    text: 'Know what is available, processing, and already in the bank. Request a settle and follow the UTR.',
    to: '/for-business/settlements',
    stats: [
      ['Cycle', 'Instant'],
      ['Proof', 'UTR tracked'],
      ['Books', 'CSV export'],
    ],
  },
  {
    kicker: 'Build',
    title: 'Developer APIs',
    text: 'Create payments, refunds, and webhooks with test keys. Rotate live keys when KYC is done.',
    to: '/for-business/developer-apis',
    stats: [
      ['Sandbox', 'Test mode'],
      ['Events', 'Realtime hooks'],
      ['Keys', 'Rotate safely'],
    ],
  },
];

const benefits = [
  {
    icon: Layers,
    title: 'Simplified payments and reconciliation',
    text: 'Invoice-wise receipts, customer name, and method on every collect. Month-end matching takes minutes, not a war-room.',
  },
  {
    icon: ShieldCheck,
    title: 'Unified dashboard and communication',
    text: 'Links, QR, refunds, and settlements in one login. Status stays in sync so dues are not missed in a WhatsApp thread.',
  },
  {
    icon: Landmark,
    title: 'Efficient transaction management',
    text: 'Bulk links, saved buyers, and digital proofs. Fewer “I already paid” disputes because the receipt is in the system.',
  },
  {
    icon: BadgeCheck,
    title: 'Enhanced financing',
    text: 'Raise working capital against on-platform history — paid invoices, settle UTRs, and repeat buyers — not a ZIP of scans.',
  },
];

const steps = [
  {
    title: 'Create a business account',
    text: 'GSTIN, PAN, and a settlement bank. Same KYC used for QR, links, and APIs — no recertify per product.',
    extra: 'Typical review under 24 hours when the pack is complete.',
  },
  {
    title: 'Turn on collect',
    text: 'Print QR or share a payment link the same day KYC is verified. Add exports or API keys when you need them.',
    extra: 'Sandbox OTPs and test keys before you go live.',
  },
  {
    title: 'Settle and report',
    text: 'Watch T+1 credits, download CSV, and send the file to your CA. Refunds and failed pays stay on the same ledger.',
    extra: 'Support on failed collects at ' + CONTACT_EMAIL + '.',
  },
];

const faqs = [
  {
    q: 'Who can open a business account?',
    a: 'Sole props, partnerships, and companies with a GSTIN and PAN. Settlement must be to a bank account in the business name.',
  },
  {
    q: 'When do QR and payment links go live?',
    a: 'After KYC is marked verified. Incomplete GSTIN or a name mismatch on the bank account holds the first settlement.',
  },
  {
    q: 'How fast do I get money in the bank?',
    a: 'Typical cycle is T+1 for UPI collect. Export collects show FX and a next-business-day settle to your Indian account.',
  },
  {
    q: 'Do I need a developer to start?',
    a: 'No. QR and payment links work from the dashboard. APIs are optional when you want checkout inside your own app.',
  },
  {
    q: 'Is UPI PIN ever asked for merchant KYC?',
    a: 'Never. PIN is only to send money. Business KYC uses GSTIN, PAN, and bank match — not your personal UPI PIN.',
  },
];

export default function ForBusiness() {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'For Business — India Pay Now';
    return () => {
      document.title = 'India Pay Now';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#f7f8fa]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(0,186,242,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0070ba]">For Business · B2B</p>
              <h1 className="mt-5 max-w-xl font-display text-[2.4rem] font-extrabold leading-[1.08] tracking-tight text-[#001c64] sm:text-5xl md:text-[3.15rem]">
                Connecting India’s businesses on a single platform
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Invoicing, payments, collections, and settlements — UPI, QR, payment links, and export collect in
                one India Pay Now merchant account. Verified GSTIN before the first rupee moves.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PageLink
                  to="/for-business/open-account"
                  className="inline-flex items-center gap-2 rounded-full bg-[#001c64] px-7 py-3 text-sm font-bold text-white"
                >
                  Open business account <ArrowRight className="h-4 w-4" />
                </PageLink>
                <Link
                  to="/login?type=business"
                  className="inline-flex rounded-full border border-[#001c64]/20 bg-white px-7 py-3 text-sm font-bold text-[#001c64]"
                >
                  Business login
                </Link>
              </div>
            </div>
            <MerchantQrHero />
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <dt className="font-display text-lg font-bold text-[#001c64]">{value}</dt>
                <dd className="mt-1 text-xs text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        {pillars.map((item, i) => (
          <article key={item.title} className={i % 2 === 1 ? 'bg-[#f7f8fa]' : 'bg-white'}>
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-14 md:py-24">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <p className="font-display text-5xl font-extrabold leading-none text-[#00baf2]/35 md:text-6xl">
                  {item.kicker}
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-[2.5rem]">
                  {item.title}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">{item.text}</p>
                <ul className="mt-6 space-y-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#00baf2]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <PillarVisual kind={item.visual} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-[#f7f8fa] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#0070ba]">Who it is for</p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-[2.6rem]">
            Counters, exporters, suppliers, and product teams
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {audiences.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <Icon className="h-6 w-6 text-[#0070ba]" strokeWidth={1.6} />
                  <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="text-sm font-semibold text-[#0070ba]">Lifecycle</p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-[2.6rem]">
          Unlock value across invoicing, collect, and settlement
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Same merchant ID from KYC to the bank credit. No recertify when you add QR, links, or APIs later.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {lifecycle.map((item, i) => {
            const Icon = item.icon;
            return (
              <PageLink
                key={item.title}
                to={item.to}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#00baf2]/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001c64] text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <p className="mt-5 text-xs font-bold text-[#00baf2]">0{i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#111]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  {item.detail.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
                <span className="mt-4 text-sm font-bold text-[#111]">Learn more →</span>
              </PageLink>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#f7f8fa] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#0070ba]">Products</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
            Everything on the same business ID
          </h2>
          <div className="mt-10 space-y-4">
            {products.map((item) => (
              <article
                key={item.title}
                className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0070ba]">{item.kicker}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-[#111]">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{item.text}</p>
                  <dl className="mt-5 flex flex-wrap gap-6">
                    {item.stats.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-slate-400">{label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-[#111]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <PageLink
                  to={item.to}
                  className="inline-flex h-fit items-center gap-2 rounded-full bg-[#001c64] px-5 py-2.5 text-sm font-bold text-white"
                >
                  View {item.title} <ArrowRight className="h-4 w-4" />
                </PageLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="text-sm font-semibold text-[#0070ba]">Benefits for businesses</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
          More bandwidth for smoother operations
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border-t border-[#001c64]/10 pt-6">
                <Icon className="h-6 w-6 text-[#0070ba]" strokeWidth={1.6} />
                <h3 className="mt-4 font-display text-xl font-bold text-[#111]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#f7f8fa] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
            How to get started
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00baf2] font-display text-lg font-extrabold text-[#001c64]">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                <p className="mt-3 text-xs text-slate-400">{step.extra}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">FAQs</h2>
        <div className="mt-8">
          {faqs.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className="border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg font-bold md:text-xl">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#0070ba] transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? <p className="pb-5 pr-10 text-sm leading-relaxed text-slate-600">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#001c64] px-4 py-16 text-white md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#00baf2]">Talk to us</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Start collecting on India Pay Now
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/65">
              KYC with PAN and GSTIN, then QR and payment links go live.{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#00baf2] hover:text-white">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PageLink
              to="/for-business/open-account"
              className="inline-flex rounded-full bg-[#00baf2] px-7 py-3 text-sm font-bold text-[#001c64]"
            >
              Open business account
            </PageLink>
            <Link
              to="/login?type=business"
              className="inline-flex rounded-full border border-white/30 px-7 py-3 text-sm font-bold text-white"
            >
              Business login
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
