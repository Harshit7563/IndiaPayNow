import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Bus,
  Car,
  ChevronDown,
  Code2,
  Download,
  Droplets,
  Ellipsis,
  Fingerprint,
  Globe2,
  Hotel,
  IdCard,
  Landmark,
  Link2,
  LogOut,
  Menu,
  Plane,
  QrCode,
  ScanFace,
  ShieldCheck,
  Smartphone,
  TrainFront,
  Tv,
  User,
  Wifi,
  Zap,
} from 'lucide-react';
import { Logo } from './Logo';
import { NavMegaMenu } from './NavMegaMenu';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { shortcutServices } from '../data/recharge';
import { serviceCatalog } from '../data/services';
import { SiteFooter } from './SiteFooter';

const byGroup = (id) => serviceCatalog.find((g) => g.id === id)?.items || [];

const menus = [
  {
    label: 'Recharge & Bills',
    columns: [
      { title: 'Recharges', items: byGroup('recharges') },
      { title: 'Bill Payments', items: byGroup('bills') },
    ],
  },
  {
    label: 'Ticket Booking',
    columns: [
      {
        title: 'Travel & Movies',
        items: [
          ['flight', 'Flight Booking', Plane],
          ['train', 'Train Booking', TrainFront],
          ['bus', 'Bus Booking', Bus],
          ['hotel', 'Hotel Booking', Hotel],
          ...byGroup('book').filter((i) => ['movie-tickets', 'imax-tickets'].includes(i[0])),
          ...byGroup('other').filter((i) => ['pnr-status', 'live-train'].includes(i[0])),
          ...byGroup('recharges').filter((i) => ['metro-recharge', 'fastag'].includes(i[0])),
        ],
      },
    ],
  },
  {
    label: 'Payments & Services',
    columns: [
      { title: 'Invest & Pay', items: byGroup('book').filter((i) => ['gold', 'mutual-funds', 'stocks', 'gas'].includes(i[0])) },
      { title: 'More Services', gridCols: 4, items: byGroup('other') },
    ],
  },
  {
    label: 'Verification Suite',
    links: [
      ['KYC Verification', '/app/kyc', ShieldCheck],
      ['Aadhaar Verify', '/app/kyc', Fingerprint],
      ['PAN Verify', '/app/kyc', IdCard],
      ['Bank Account Verify', '/app/profile', Landmark],
      ['Face Match', '/app/kyc', ScanFace],
      ['Credit Score', '/app/bills/credit-score', BadgeCheck],
    ],
  },
  {
    label: 'For Business',
    links: [
      ['Exports', '/for-business/exports', Globe2],
      ['Merchant Hub', '/app/merchant', BriefcaseBusiness],
      ['Payment Links', '/app/merchant', Link2],
      ['QR Payments', '/app/merchant', QrCode],
      ['Settlements', '/app/merchant', Landmark],
      ['Open business login', '/login?type=business&switch=1', Code2],
    ],
  },
  {
    label: 'Company',
    links: [
      ['Support', '/app/support', ShieldCheck],
      ['KYC', '/app/kyc', User],
      ['Profile', '/app/profile', User],
      ['Transactions', '/app/transactions', Building2],
    ],
  },
];

const barIcons = {
  mobile: Smartphone,
  fastag: Car,
  dth: Tv,
  electricity: Zap,
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  loan: Landmark,
  insurance: ShieldCheck,
  water: Droplets,
  broadband: Wifi,
  more: Ellipsis,
};

export function AppChrome({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeService = params.get('service') || 'mobile';
  const [activeMenu, setActiveMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  const toggleMenu = (label) => setActiveMenu((current) => (current === label ? null : label));

  return (
    <div className="min-h-screen bg-[#eef2f6]">
      {activeMenu && (
        <button type="button" className="fixed inset-0 z-30" aria-label="Close menu" onClick={() => setActiveMenu(null)} />
      )}
      <header className="relative sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <div className="flex shrink-0 items-center gap-2">
            <button className="rounded-lg p-1.5 lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/app">
              <Logo size="sm" />
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex">
            {menus.map((menu, index) => {
              const align = index >= 4 ? 'right' : index === 0 ? 'left' : 'center';
              return (
                <div key={menu.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={activeMenu === menu.label}
                    onClick={() => toggleMenu(menu.label)}
                    className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-semibold ${
                      activeMenu === menu.label ? 'bg-slate-100 text-black' : 'text-black hover:bg-slate-50'
                    }`}
                  >
                    {menu.label}
                    <ChevronDown className={`h-3.5 w-3.5 text-black transition ${activeMenu === menu.label ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMenu === menu.label && (
                    <NavMegaMenu menu={menu} onNavigate={() => setActiveMenu(null)} align={align} />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <button className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-[#002970] hover:bg-slate-50 md:inline-flex">
              <Download className="h-4 w-4" /> Download App
            </button>
            <NotificationDropdown />
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00baf2] text-sm font-bold text-white">
                  {firstName[0]}
                </span>
                <span className="hidden text-sm font-semibold text-[#002970] sm:inline">Hi, {firstName}</span>
              </button>
              {profileOpen && (
                <>
                  <button className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
                    <Link to="/app/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </header>

      <div className="bg-[#002970] text-white">
        <div className="flex gap-0 overflow-x-auto px-3 py-3">
          {shortcutServices.map((item) => {
            const Icon = barIcons[item.id];
            const selected = activeService === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'more') navigate('/app/payments');
                  else navigate(`/app?service=${item.id}`);
                }}
                className={`flex min-w-[96px] flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-2.5 text-center ${
                  selected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Icon className="h-7 w-7" />
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
                {selected && <span className="mt-0.5 h-0.5 w-8 rounded-full bg-[#00baf2]" />}
              </button>
            );
          })}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 overflow-y-auto bg-white p-5">
            <Logo />
            <p className="mt-4 text-sm text-slate-500">Hi, {firstName}</p>
            <div className="mt-4 space-y-2">
              {shortcutServices.map((s) => (
                <button
                  key={s.id}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-50"
                  onClick={() => {
                    setMobileOpen(false);
                    if (s.id === 'more') navigate('/app/payments');
                    else navigate(`/app?service=${s.id}`);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-6 pb-24 md:pb-10">{children}</main>
      <div className="pb-16 md:pb-0">
        <SiteFooter variant="app" />
      </div>
    </div>
  );
}
