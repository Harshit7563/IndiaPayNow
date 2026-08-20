import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, ChevronDown, ChevronRight, Clock, Mail, Search, X } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { categoryGroups, listingCount, servicePath } from '../data/verificationCategories';
import { CONTACT_EMAIL } from '../data/siteConfig';

const emptyInquire = {
  name: '',
  email: '',
  mobile: '',
  company: '',
  interest: categoryGroups[0].label,
  message: '',
};

const audiences = [
  {
    id: 'customers',
    label: 'Customers',
    kicker: 'For Customers',
    headline: 'Verify once across 12+ identity checks. Unlock higher limits without extra paperwork.',
    cta: { label: 'Get started', to: '/app/kyc' },
    secondary: { label: 'Create account', to: '/register' },
    stats: [
      ['< 5 min', 'Typical full KYC'],
      ['12+', 'Identity checks in one suite'],
      ['24×7', 'Status on your profile'],
    ],
  },
  {
    id: 'merchants',
    label: 'Merchants',
    kicker: 'For Merchants',
    headline: 'Collect with a verified business. KYC before QR, payment links, and settlements go live.',
    cta: { label: 'Verify business', to: '/app/kyc' },
    secondary: { label: 'Merchant hub', to: '/app/merchant' },
    stats: [
      ['< 24 hrs', 'KYC review for merchants'],
      ['PAN + GST', 'Business identity pack'],
      ['Bank match', 'Before the first settlement'],
    ],
  },
  {
    id: 'business',
    label: 'Business',
    kicker: 'For Business',
    headline: 'Confirm every beneficiary. PAN, bank, and Aadhaar checks before bulk payouts leave.',
    cta: { label: 'Start KYC', to: '/app/kyc' },
    secondary: { label: 'Business login', to: '/login?type=business' },
    stats: [
      ['IFSC', 'Looked up from the RBI directory'],
      ['Name match', 'On account and PAN'],
      ['Masked IDs', 'Last-4 only on receipts'],
    ],
  },
  {
    id: 'developers',
    label: 'Developers',
    kicker: 'For Developers',
    headline: 'Create custom KYC flows. Same identity stack for wallets, merchants, and payouts.',
    cta: { label: 'View catalog', to: '#catalog' },
    secondary: { label: 'Open console', to: '/business/developers' },
    stats: [
      ['One session', 'No recertify per product'],
      ['Sandbox OTPs', 'Test before you go live'],
      ['24×7', 'Support on failed checks'],
    ],
  },
];

const news = [
  {
    title: 'Face Match',
    text: 'Liveness plus selfie-to-ID compare for high-value actions. Captured only inside the signed-in app.',
  },
  {
    title: 'DigiLocker import',
    text: 'Pull issued Aadhaar, PAN, DL, and RC instead of uploading scans — source-verified documents.',
  },
];

const benefits = [
  ['Instant status', 'Number checks typically finish under 30 seconds.'],
  ['12+ identity documents', 'Aadhaar, PAN, DL, voter ID, passport, RC, and more.'],
  ['Convenient for customers', 'Start from the app or website after login. No extra registration.'],
  ['End-to-end encryption', 'PIN, OTP, and ID data never leave a secure path.'],
  ['RBI-ready flow', 'Designed around Indian identity and UPI habits.'],
  ['Always on', '24×7 checks with live status on your profile.'],
  ['OCR + DigiLocker', 'Type a number, snap a card, or import an issued file.'],
  ['No PIN to verify', 'UPI PIN is only to send money — never for KYC.'],
];

const forBlocks = [
  {
    kicker: 'For Customers',
    headline: 'Complete KYC across 12+ documents. Raise a support ticket if a check fails.',
    cta: { label: 'Get started', to: '/app/kyc' },
    secondary: { label: 'Safety guide', to: '/trust-and-safety' },
  },
  {
    kicker: 'For Merchants',
    headline: 'Collect after a verified KYC. QR, links, and settlements stay locked until identity clears.',
    stats: [
      ['< 24 hrs', 'Merchant KYC review'],
      ['PAN + bank', 'Required before payouts'],
      ['Face match', 'On device change'],
      ['Dashboard', 'See verification status in Profile / KYC'],
    ],
  },
  {
    kicker: 'For Business',
    headline: 'Confirm beneficiaries before money moves. PAN, IFSC, and Aadhaar in one suite.',
    stats: [
      ['Name match', 'On PAN and bank account'],
      ['Masked Aadhaar', 'Last 4 on statements only'],
      ['CKYC search', 'Reuse an existing KYC pack where allowed'],
      ['Credit score', 'Before lending products'],
    ],
  },
  {
    kicker: 'For Developers',
    headline: 'Create custom solutions. Same checks for wallets, merchants, and payouts — no recertification per product.',
    stats: [
      ['Unlock', 'Higher limits after KYC'],
      ['One stack', 'Aadhaar through DigiLocker'],
      ['Test OTPs', 'Sandbox-style confirms'],
      ['Specs', 'Flows documented in KYC and Profile'],
    ],
  },
];

const checks = [
  ['Aadhaar Verification', 'Checksum, then OTP on the Aadhaar-linked mobile. Number is masked after success.'],
  ['PAN Verification', '10-character format, holder type, name match, optional PAN–Aadhaar link.'],
  ['Voter ID Verification', 'EPIC number and name as a second government photo ID.'],
  ['Driving License Verification', 'DL number, validity, and name for real-time identity checks.'],
  ['Passport ID Verification', 'Passport number and personal details for NRI and travel KYC.'],
  ['Photo ID OCR', 'Extract name, number, and DOB from any photo ID — no typing.'],
  ['Vehicle RC Verification', 'Registration number, owner, and vehicle class before FASTag or payouts.'],
  ['Aadhaar Masking', 'Last 4 digits only on receipts, tickets, and support screens.'],
  ['DigiLocker', 'Import issued Aadhaar, PAN, DL, or RC with user consent.'],
  ['Bank Account Verify', 'Account + IFSC from the RBI directory before settlements.'],
  ['Face Match', 'Liveness and selfie compared with the ID photo.'],
  ['Credit Score', 'PAN-based credit band before loans or merchant credit.'],
];

const howTo = [
  'Log in to India Pay Now on the website or the app.',
  'Open Verification Suite, or go to KYC from Profile.',
  'Choose the document — or start full KYC (PAN + Aadhaar + bank).',
  'Enter the number, upload a photo, or import from DigiLocker.',
  'Confirm OTP or selfie. Get instant status on your profile.',
];

const catalog = [
  {
    title: 'Aadhaar stack',
    items: [
      ['Aadhaar OKYC 2.0', 'Offline KYC XML with consent'],
      ['eAadhaar / XML', 'Issued PDF or XML import'],
      ['QR-based Aadhaar', 'Scan the QR on card or eAadhaar'],
      ['Aadhaar to PAN', 'Confirm the linked PAN'],
      ['Aadhaar Vintage', 'How long the number has existed'],
      ['Aadhaar Data Vault', 'Tokenise after verify'],
      ['Aadhaar Masking', 'Last-4 display everywhere else'],
      ['WhatsApp Aadhaar KYC', 'Guided KYC in chat — still no PIN'],
    ],
  },
  {
    title: 'PAN stack',
    items: [
      ['PAN Verification', 'Number + name + status'],
      ['PAN Comprehensive', 'Holder type and extra fields'],
      ['PAN Validation', 'Format-only pre-check'],
      ['DOB check by PAN', 'Match date of birth'],
      ['PAN 206AB', 'Specified-person TDS flag'],
      ['PAN–Aadhaar link', 'Link status before payouts'],
      ['PAN to Aadhaar', 'Reverse lookup where allowed'],
      ['PAN Masking', 'Hide middle characters on UI'],
    ],
  },
  {
    title: 'CKYC & video',
    items: [
      ['CKYC Search', 'Find an existing CKYC record'],
      ['CKYC Download', 'Pull the registered KYC pack'],
      ['CKYC Upload', 'Push a completed KYC pack'],
      ['CKYC Verification', 'Match against CKYCR'],
      ['CKYCRR 2.0', 'Updated registry fields'],
      ['Video KYC', 'Agent-assisted live session'],
      ['WhatsApp KYC', 'Document + OTP in chat'],
      ['Full KYC flow', 'PAN + Aadhaar + bank + face'],
    ],
  },
  {
    title: 'More documents',
    items: [
      ['Ration Card', 'Household ID for welfare KYC'],
      ['E-Shram Card', 'Unorganised-worker ID'],
      ['ABHA Card', 'Health ID for medical KYC'],
      ['UMID Card', 'Railway employee ID'],
      ['OCI Card', 'Overseas citizen identity'],
      ['International Passport', 'Non-Indian travel document'],
      ['Age Verification', '18+ / 21+ from DOB on ID'],
      ['Address Proof OCR', 'Extract address from any ID'],
    ],
  },
];

const faqs = [
  {
    q: 'How to use Verification Suite?',
    a: 'Log in, open KYC, and follow the steps for the document you need. Full KYC runs PAN, Aadhaar, and bank together. Face Match and credit score appear when the account needs them.',
  },
  {
    q: 'How does identity verification work?',
    a: 'You submit a number or a photo. Format and checksum run first. Then OTP, DigiLocker consent, or a selfie-ID match. The result is stored on your profile.',
  },
  {
    q: 'Is this the same as UPI?',
    a: 'No. UPI moves money. Verification Suite proves who you are so limits, banks, and credit products can unlock. UPI PIN is never used as a KYC step.',
  },
  {
    q: 'Do I need a separate registration?',
    a: 'No. Use your existing India Pay Now account. New users create an account and start KYC in the same flow.',
  },
  {
    q: 'How much time does it take?',
    a: 'Most number checks finish under 30 seconds. OCR is under 10 seconds. DigiLocker and credit score can take up to a minute with consent.',
  },
  {
    q: 'Will you ask for my UPI PIN to complete KYC?',
    a: 'Never. PIN is only to send money. Aadhaar OTP is only on the signed-in KYC screen — never on a call, SMS link, or WhatsApp.',
  },
];

export default function VerificationSuite() {
  const [tab, setTab] = useState(audiences[0].id);
  const [catGroup, setCatGroup] = useState(categoryGroups[0].id);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [inquireOpen, setInquireOpen] = useState(false);
  const [inquire, setInquire] = useState(emptyInquire);
  const [inquireSending, setInquireSending] = useState(false);
  const [inquireSent, setInquireSent] = useState(false);
  const active = audiences.find((item) => item.id === tab) || audiences[0];
  const activeGroup = categoryGroups.find((g) => g.id === catGroup) || categoryGroups[0];

  const visibleItems = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      return activeGroup.items.map((item) => ({ item, group: activeGroup }));
    }
    return categoryGroups.flatMap((group) =>
      group.items
        .filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q)
        )
        .map((item) => ({ item, group }))
    );
  }, [activeGroup, categoryQuery]);

  const closeInquire = () => {
    setInquireOpen(false);
    setInquireSent(false);
    setInquire(emptyInquire);
  };

  const updateInquire = (e) => {
    setInquire((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!inquireOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setInquireOpen(false);
        setInquireSent(false);
        setInquire(emptyInquire);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [inquireOpen]);

  const submitInquire = (e) => {
    e.preventDefault();
    if (!inquire.name.trim() || !inquire.email.trim() || !inquire.mobile.trim()) {
      toast.error('Name, email, and mobile are required');
      return;
    }
    setInquireSending(true);
    window.setTimeout(() => {
      setInquireSending(false);
      setInquireSent(true);
      toast.success('Inquiry sent');
    }, 450);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Verification Suite — India Pay Now';
    return () => {
      document.title = 'India Pay Now';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#001c64]">
      <SiteHeader />

      <div className="border-b border-[#001c64]/10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {audiences.map((item) => {
              const on = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`shrink-0 px-5 py-4 text-[15px] font-semibold transition ${
                    on
                      ? 'border-b-[3px] border-[#00baf2] text-[#001c64]'
                      : 'border-b-[3px] border-transparent text-[#001c64]/50 hover:text-[#001c64]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <p className="text-sm font-semibold text-[#0070ba]">{active.kicker}</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="font-display text-[2.35rem] font-extrabold leading-[1.12] tracking-tight sm:text-5xl md:text-[3.35rem]">
            {active.headline}
          </h1>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to={active.cta.to}
              className="inline-flex rounded-full bg-[#001c64] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#003087]"
            >
              {active.cta.label}
            </Link>
            <Link
              to={active.secondary.to}
              className="inline-flex rounded-full border border-[#001c64]/30 px-7 py-3 text-sm font-bold transition hover:bg-white"
            >
              {active.secondary.label}
            </Link>
          </div>
        </div>
        <ul className="mt-14 grid gap-8 border-t border-[#001c64]/15 pt-8 sm:grid-cols-3">
          {active.stats.map(([value, label]) => (
            <li key={label}>
              <p className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{value}</p>
              <p className="mt-2 text-sm text-[#001c64]/70">{label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#001c64] px-4 py-16 text-[#f7f8fa] md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#00baf2]">What’s new?</p>
          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
            {news.map((item) => (
              <article key={item.title}>
                <h2 className="font-display text-3xl font-extrabold md:text-4xl">{item.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 md:text-base">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fa] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Link
              to="/verification/categories"
              className="font-display text-[2.4rem] font-bold tracking-tight text-[#111] transition hover:text-[#0070ba] md:text-[3.15rem]"
            >
              25+ Categories
            </Link>
            <p className="mt-2 text-sm text-slate-500 md:text-base">More categories coming soon.</p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={categoryQuery}
                onChange={(e) => setCategoryQuery(e.target.value)}
                placeholder="Search by name"
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-[#111] shadow-sm outline-none ring-[#00baf2]/25 placeholder:text-slate-400 focus:ring-2"
              />
            </label>
          </div>

          <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,28,100,0.06)] md:grid md:grid-cols-[248px_1fr] lg:grid-cols-[272px_1fr]">
            <aside className="border-b border-slate-200 bg-white p-3 md:border-b-0 md:border-r md:p-4">
              <p className="mb-2 hidden px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:block">
                Browse by section
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
                {categoryGroups.map((group) => {
                  const Icon = group.icon;
                  const on = group.id === catGroup;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setCatGroup(group.id);
                        setCategoryQuery('');
                      }}
                      className={`flex min-w-[220px] items-center gap-3 rounded-xl px-3 py-3 text-left transition md:min-w-0 ${
                        on
                          ? 'bg-slate-100 text-[#111] ring-1 ring-slate-200'
                          : 'text-[#111] hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          on ? 'bg-white text-[#111] ring-1 ring-slate-200' : 'bg-slate-100 text-[#111]'
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug text-[#111]">{group.label}</span>
                        <span className="text-[11px] text-slate-500">{group.items.length} checks</span>
                      </span>
                      <ChevronRight className={`h-4 w-4 shrink-0 text-[#111] ${on ? 'opacity-100' : 'opacity-30'}`} />
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0070ba]">
                    {categoryQuery.trim() ? 'Search results' : activeGroup.label}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#111] md:text-2xl">
                    {categoryQuery.trim()
                      ? `${visibleItems.length} ${visibleItems.length === 1 ? 'match' : 'matches'}`
                      : `${activeGroup.items.length} identity checks`}
                  </h3>
                </div>
                <Link
                  to="/verification/categories"
                  className="text-sm font-semibold text-[#0070ba] hover:text-[#001c64]"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleItems.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-[#f7f8fa] py-14 text-center">
                    <p className="font-display text-lg font-bold text-[#111]">No results found</p>
                    <p className="mt-1 text-sm text-slate-500">Please try a different search term.</p>
                  </div>
                ) : (
                  visibleItems.map(({ item, group }) => {
                    const Icon = item.icon;
                    const count = listingCount(item);
                    const [time] = item.stats;
                    return (
                      <Link
                        key={`${group.id}-${item.id}`}
                        to={servicePath(item.id)}
                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#00baf2]/40 hover:shadow-[0_12px_28px_rgba(0,112,186,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#001c64] ring-1 ring-[#00baf2]/15">
                            <Icon className="h-5 w-5" strokeWidth={1.6} />
                          </span>
                          <span className="rounded-md bg-[#00baf2] px-2 py-0.5 text-[10px] font-bold text-white">
                            {count} Services
                          </span>
                        </div>
                        {categoryQuery.trim() ? (
                          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#0070ba]">
                            {group.label}
                          </p>
                        ) : null}
                        <h4 className="mt-2 font-display text-base font-bold text-[#111] group-hover:text-[#0070ba]">
                          {item.label}
                        </h4>
                        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className="text-xs text-slate-400">
                            {time[0]}: <span className="font-semibold text-[#111]">{time[1]}</span>
                          </span>
                          <span className="text-sm font-bold text-[#111] group-hover:text-[#0070ba]">
                            View →
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-sm font-semibold text-[#0070ba]">Benefits</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          A trusted platform for identity checks
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-8 sm:grid-cols-2">
          {benefits.map(([title, text]) => (
            <div key={title} className="border-t border-[#001c64]/15 pt-5">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#001c64]/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#001c64]/10 bg-white">
        {forBlocks.map((block) => (
          <div key={block.kicker} className="border-b border-[#001c64]/10">
            <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
              <p className="text-sm font-semibold text-[#0070ba]">{block.kicker}</p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-[2.4rem]">
                {block.headline}
              </h2>
              {block.cta ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to={block.cta.to}
                    className="inline-flex rounded-full bg-[#001c64] px-6 py-2.5 text-sm font-bold text-white"
                  >
                    {block.cta.label}
                  </Link>
                  <Link
                    to={block.secondary.to}
                    className="inline-flex rounded-full border border-[#001c64]/25 px-6 py-2.5 text-sm font-bold"
                  >
                    {block.secondary.label}
                  </Link>
                </div>
              ) : null}
              {block.stats ? (
                <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {block.stats.map(([value, label]) => (
                    <li key={label} className="border-t border-[#001c64]/15 pt-4">
                      <p className="font-display text-2xl font-extrabold">{value}</p>
                      <p className="mt-1 text-sm text-[#001c64]/70">{label}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-sm font-semibold text-[#0070ba]">Identity checks</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Everything in the suite
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-8 sm:grid-cols-2">
          {checks.map(([title, text]) => (
            <div key={title} className="border-t border-[#001c64]/15 pt-5">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#001c64]/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#0070ba]">How to use Verification Suite</p>
          <ol className="mt-8">
            {howTo.map((step, i) => (
              <li key={step} className="flex gap-6 border-t border-[#001c64]/10 py-6 first:border-t-0 first:pt-0">
                <span className="font-display text-2xl font-extrabold text-[#0070ba]">{i + 1}.</span>
                <p className="pt-1 text-lg font-semibold leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-20">
        <p className="text-sm font-semibold text-[#0070ba]">Catalog</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Full identity catalog
        </h2>
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          {catalog.map((group) => (
            <div key={group.title}>
              <h3 className="border-b border-[#001c64]/15 pb-3 font-display text-xl font-extrabold">{group.title}</h3>
              <ul>
                {group.items.map(([name, detail]) => (
                  <li key={name} className="flex items-baseline justify-between gap-4 border-b border-[#001c64]/10 py-3">
                    <span className="text-sm font-semibold">{name}</span>
                    <span className="max-w-[55%] text-right text-xs text-[#001c64]/60">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">FAQs</h2>
          <div className="mt-8">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="border-b border-[#001c64]/15">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-display text-lg font-bold md:text-xl">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[#0070ba] transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? <p className="pb-5 pr-10 text-sm leading-relaxed text-[#001c64]/70">{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="inquire" className="bg-[#001c64] px-4 py-16 text-[#f7f8fa] md:py-20">
        <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-10">
          <div>
            <p className="text-sm font-semibold text-[#00baf2]">Become verified</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Inquire. Start KYC on India Pay Now.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/65">
              No extra registration. Use your account, complete identity checks, and unlock the rest of the suite.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block text-sm font-semibold text-[#00baf2] hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 md:mt-0">
            <button
              type="button"
              onClick={() => {
                setInquireSent(false);
                setInquireOpen(true);
              }}
              className="inline-flex rounded-full bg-[#00baf2] px-8 py-3 text-sm font-bold text-[#001c64] transition hover:bg-[#7dd3fc]"
            >
              Inquire
            </button>
            <Link
              to="/register"
              className="inline-flex rounded-full border border-white/30 px-8 py-3 text-sm font-bold text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {inquireOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[#001c64]/55 backdrop-blur-[6px]"
            aria-label="Close inquire"
            onClick={closeInquire}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquire-title"
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-[920px] flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_32px_80px_rgba(0,28,100,0.28)] sm:rounded-[1.75rem] md:flex-row"
          >
            <aside className="relative hidden w-[320px] shrink-0 flex-col justify-between bg-[#001c64] px-8 py-10 text-white md:flex">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00baf2]">Verification Suite</p>
                <h2 id="inquire-title" className="mt-4 font-display text-3xl font-extrabold leading-tight">
                  Let’s set up your APIs
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Share a few details. A specialist will reply within one business day.
                </p>
                <ul className="mt-8 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <Clock className="h-4 w-4 text-[#00baf2]" />
                    </span>
                    <span>
                      <span className="block font-semibold">Reply in 24 hrs</span>
                      <span className="text-white/60">Working days, IST</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <Mail className="h-4 w-4 text-[#00baf2]" />
                    </span>
                    <span>
                      <span className="block font-semibold">Direct inbox</span>
                      <span className="break-all text-white/60">{CONTACT_EMAIL}</span>
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-white/40">No spam. Used only to answer this inquiry.</p>
            </aside>

            <div className="relative min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-8 sm:py-8">
              <button
                type="button"
                onClick={closeInquire}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-[#111]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {inquireSent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f9ee] text-[#1a9d58]">
                    <Check className="h-8 w-8" strokeWidth={2.5} />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-extrabold text-[#111]">Inquiry received</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                    Thanks{inquire.name ? `, ${inquire.name.split(' ')[0]}` : ''}. We’ll write to{' '}
                    <span className="font-semibold text-[#111]">{inquire.email || CONTACT_EMAIL}</span> about{' '}
                    {inquire.interest}.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-6 text-sm font-semibold text-[#0070ba] hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <button
                    type="button"
                    onClick={closeInquire}
                    className="mt-8 rounded-full bg-[#001c64] px-7 py-3 text-sm font-bold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="pr-10 md:pr-8">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0070ba] md:hidden">
                      Verification Suite
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold text-[#111] md:text-[1.75rem]">
                      Send an inquiry
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-500">
                      We’ll get back at <span className="font-semibold text-[#111]">{CONTACT_EMAIL}</span>
                    </p>
                  </div>

                  <form onSubmit={submitInquire} className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Full name
                      </span>
                      <input
                        required
                        name="name"
                        value={inquire.name}
                        onChange={updateInquire}
                        placeholder="Harshit Sharma"
                        className="w-full rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Work email
                      </span>
                      <input
                        required
                        name="email"
                        type="email"
                        value={inquire.email}
                        onChange={updateInquire}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Mobile
                      </span>
                      <input
                        required
                        name="mobile"
                        inputMode="tel"
                        value={inquire.mobile}
                        onChange={updateInquire}
                        placeholder="10-digit mobile"
                        className="w-full rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Company
                      </span>
                      <input
                        name="company"
                        value={inquire.company}
                        onChange={updateInquire}
                        placeholder="Optional"
                        className="w-full rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        I am interested in
                      </span>
                      <select
                        name="interest"
                        value={inquire.interest}
                        onChange={updateInquire}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      >
                        {categoryGroups.map((group) => (
                          <option key={group.id} value={group.label}>
                            {group.label}
                          </option>
                        ))}
                        <option value="Full verification suite">Full verification suite</option>
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Message
                      </span>
                      <textarea
                        name="message"
                        rows={3}
                        value={inquire.message}
                        onChange={updateInquire}
                        placeholder="Volume, APIs you need, go-live date…"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#00baf2] focus:bg-white focus:ring-2 focus:ring-[#00baf2]/20"
                      />
                    </label>
                    <div className="flex flex-col gap-3 pt-1 sm:col-span-2 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={inquireSending}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#00baf2] px-6 py-3 text-sm font-bold text-[#001c64] transition hover:bg-[#7dd3fc] disabled:opacity-60"
                      >
                        {inquireSending ? 'Sending…' : 'Send inquiry'}
                      </button>
                      <button
                        type="button"
                        onClick={closeInquire}
                        className="rounded-full px-5 py-3 text-sm font-semibold text-slate-500 hover:text-[#111]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
