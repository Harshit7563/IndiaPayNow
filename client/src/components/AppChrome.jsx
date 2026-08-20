import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Bus,
  Car,
  ChevronDown,
  Download,
  Droplets,
  Ellipsis,
  Hotel,
  Landmark,
  LogOut,
  Menu,
  Plane,
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
    href: '/verification',
    direct: true,
  },
  {
    label: 'For Business',
    href: '/for-business',
    direct: true,
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
  const location = useLocation();
  const [params] = useSearchParams();
  const activeService = params.get('service') || 'mobile';
  const [activeMenu, setActiveMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const hideServiceBar = location.pathname.startsWith('/app/profile');

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
              if (menu.direct) {
                return (
                  <Link
                    key={menu.label}
                    to={menu.href}
                    className="inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-black hover:bg-slate-50"
                  >
                    {menu.label}
                  </Link>
                );
              }
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
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#00baf2] text-sm font-bold text-white">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    firstName[0]
                  )}
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
                    {user?.role === 'merchant' ? (
                      <Link
                        to="/business"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Building2 className="h-4 w-4" /> Business dashboard
                      </Link>
                    ) : null}
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

      {!hideServiceBar && (
        <div className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-4 sm:py-3.5">
            {shortcutServices.map((item) => {
              const Icon = barIcons[item.id];
              const selected = activeService === item.id;
              const tone = item.tone || '#0070ba';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'more') navigate('/app/payments');
                    else navigate(`/app?service=${item.id}`);
                  }}
                  className={`group flex min-w-[72px] flex-1 flex-col items-center gap-2 rounded-2xl px-2.5 py-2 text-center transition sm:min-w-[84px] ${
                    selected ? 'bg-[#f0f7ff]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ring-1 transition sm:h-12 sm:w-12 ${
                      selected
                        ? 'text-white shadow-md ring-transparent'
                        : 'bg-white text-slate-600 ring-slate-200 group-hover:ring-slate-300'
                    }`}
                    style={
                      selected
                        ? { background: `linear-gradient(145deg, ${tone}, ${tone}cc)` }
                        : { color: tone }
                    }
                  >
                    <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={selected ? 2.25 : 1.9} />
                  </span>
                  <span
                    className={`max-w-[4.75rem] text-[11px] font-bold leading-tight sm:max-w-none sm:text-xs ${
                      selected ? 'text-[#002970]' : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`h-0.5 w-6 rounded-full transition ${
                      selected ? 'bg-[#00baf2] opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

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
