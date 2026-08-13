import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Code2,
  Fingerprint,
  Globe2,
  IdCard,
  Landmark,
  Link2,
  Menu,
  Newspaper,
  QrCode,
  ScanFace,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { NavMegaMenu } from './NavMegaMenu';
import { serviceCatalog } from '../data/services';

const byGroup = (id) => serviceCatalog.find((g) => g.id === id)?.items || [];

const menus = [
  {
    label: 'Recharge & Bills',
    href: '#payments',
    columns: [
      { title: 'Recharges', items: byGroup('recharges') },
      { title: 'Bill Payments', items: byGroup('bills') },
    ],
  },
  {
    label: 'Ticket Booking',
    href: '/login',
    columns: [
      {
        title: 'Travel & Movies',
        items: [
          ...byGroup('book').filter((i) => ['movie-tickets', 'imax-tickets'].includes(i[0])),
          ...byGroup('other').filter((i) => ['pnr-status', 'live-train'].includes(i[0])),
          ...byGroup('recharges').filter((i) => ['metro-recharge', 'fastag'].includes(i[0])),
        ],
      },
    ],
  },
  {
    label: 'Payments & Services',
    href: '#other',
    columns: [
      {
        title: 'Invest & Pay',
        items: byGroup('book').filter((i) => ['gold', 'mutual-funds', 'stocks', 'gas'].includes(i[0])),
      },
      { title: 'More Services', gridCols: 4, items: byGroup('other') },
    ],
  },
  {
    label: 'Verification Suite',
    href: '/verification/kyc',
    links: [
      ['KYC Verification', '/verification/kyc', ShieldCheck],
      ['Aadhaar Verify', '/verification/aadhaar', Fingerprint],
      ['PAN Verify', '/verification/pan', IdCard],
      ['Bank Account Verify', '/verification/bank', Landmark],
      ['Face Match', '/verification/face', ScanFace],
      ['Credit Score', '/verification/credit-score', BadgeCheck],
    ],
  },
  {
    label: 'For Business',
    href: '/for-business/exports',
    links: [
      ['Exports', '/for-business/exports', Globe2],
      ['Payment Links', '/for-business/payment-links', Link2],
      ['Merchant QR', '/for-business/merchant-qr', QrCode],
      ['Settlements', '/for-business/settlements', Building2],
      ['Developer APIs', '/for-business/developer-apis', Code2],
      ['Open business account', '/register?type=business', BriefcaseBusiness],
      ['Business login', '/login?type=business', BriefcaseBusiness],
    ],
  },
  {
    label: 'Company',
    href: '/company/about-us',
    links: [
      ['About Us', '/company/about-us', Building2],
      ['Careers', '/company/careers', Users],
      ['Press', '/company/press', Newspaper],
      ['Blog', '/company/blog', Newspaper],
      ['Help Centre', '/company/about-us', UserRound],
    ],
  },
];

function ServiceLink({ slug, label, Icon, onNavigate }) {
  return (
    <Link
      to={`/app/bills/${slug}`}
      onClick={onNavigate}
      className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-black">
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate text-sm font-medium text-[#001c64]">{label}</span>
    </Link>
  );
}

function MenuPanel({ menu, onNavigate }) {
  if (menu.columns) {
    const cols = menu.columns.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-3';
    return (
      <div className={`grid grid-cols-1 gap-x-10 gap-y-6 ${cols}`}>
        {menu.columns.map((col) => (
          <div key={col.title} className="min-w-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{col.title}</p>
            <div className={`grid gap-1 ${col.items.length > 6 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {col.items.map(([slug, label, Icon]) => (
                <ServiceLink key={slug} slug={slug} label={label} Icon={Icon} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid max-w-xl grid-cols-1 gap-1 sm:grid-cols-2">
      {menu.links.map(([label, href, Icon]) => {
        const content = (
          <>
            {Icon ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-black">
                <Icon className="h-4 w-4" />
              </span>
            ) : null}
            {label}
          </>
        );
        const className =
          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-black hover:bg-slate-50';
        return href.startsWith('/') ? (
          <Link key={label} to={href} onClick={onNavigate} className={className}>
            {content}
          </Link>
        ) : (
          <a key={label} href={href} onClick={onNavigate} className={className}>
            {content}
          </a>
        );
      })}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(null);
  const [active, setActive] = useState(null);

  const closeDesktop = () => setActive(null);
  const closeMobile = () => {
    setOpen(false);
    setMobileMenu(null);
  };
  const toggleMenu = (label) => setActive((current) => (current === label ? null : label));

  return (
    <>
      {active ? (
        <button type="button" className="fixed inset-0 z-30" aria-label="Close menu" onClick={closeDesktop} />
      ) : null}

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f8fa]/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="relative z-40 mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
          <Link to="/" aria-label="India Pay Now home" className="min-w-0 shrink">
            <Logo size="sm" />
          </Link>

          <nav className="relative hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {menus.map((menu, index) => {
              const align = index >= 4 ? 'right' : index === 0 ? 'left' : 'center';
              return (
                <div key={menu.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={active === menu.label}
                    onClick={() => toggleMenu(menu.label)}
                    className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                      active === menu.label ? 'bg-white text-black shadow-sm' : 'text-black hover:bg-white/70'
                    }`}
                  >
                    {menu.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-black transition ${active === menu.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {active === menu.label ? (
                    <NavMegaMenu menu={menu} onNavigate={closeDesktop} align={align} />
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
            <Link to="/login" className="text-sm font-semibold text-slate-600 transition hover:text-[#111]">
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-full bg-[#111] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            className="relative z-50 ml-auto flex h-11 w-11 items-center justify-center rounded-full p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-6 w-6 text-black" />
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 pt-[env(safe-area-inset-top)] sm:h-16">
            <Logo size="sm" />
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <X className="h-6 w-6 text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-[max(7rem,env(safe-area-inset-bottom))]">
            {menus.map((menu) => (
              <div key={menu.label} className="border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setMobileMenu(mobileMenu === menu.label ? null : menu.label)}
                  className="flex min-h-[48px] w-full items-center justify-between py-3.5 text-left text-base font-semibold text-black"
                >
                  {menu.label}
                  <ChevronDown
                    className={`h-4 w-4 text-black transition ${mobileMenu === menu.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {mobileMenu === menu.label ? (
                  <div className="pb-4">
                    <MenuPanel menu={menu} onNavigate={closeMobile} />
                  </div>
                ) : null}
              </div>
            ))}
            <Link
              to="/login"
              onClick={closeMobile}
              className="mt-4 flex min-h-[48px] items-center rounded-xl px-3 py-3 font-bold text-[#0070ba]"
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={closeMobile}
              className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-[#111] px-3 py-3 text-center font-bold text-white"
            >
              Sign Up
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
