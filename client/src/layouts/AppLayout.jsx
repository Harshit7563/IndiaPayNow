import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, QrCode, Receipt, Send, User } from 'lucide-react';
import { Logo } from '../components/Logo';
import { AppChrome } from '../components/AppChrome';
import { useAuth } from '../context/AuthContext';

export { NotificationDropdown } from '../components/NotificationDropdown';

const mobileNav = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/send', icon: Send, label: 'Send' },
  { to: '/app/scan', icon: QrCode, label: 'Scan' },
  { to: '/app/transactions', icon: Receipt, label: 'Activity' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export function AppLayout() {
  return (
    <AppChrome>
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e5e7eb] bg-white md:hidden safe-bottom">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[11px] font-bold ${isActive ? 'text-[#00baf2]' : 'text-slate-500'}`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </AppChrome>
  );
}

export function BusinessLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isDevelopers = location.pathname.startsWith('/business/developers');
  const uniqueLinks = [
    ['Overview', '/business', true],
    ['Payments', '/business/payments'],
    ['Transactions', '/business/transactions'],
    ['Customers', '/business/customers'],
    ['Payment Links', '/business/payment-links'],
    ['QR Payments', '/business/qr'],
    ['UPI Cash Point', '/business/qr?type=cashpoint'],
    ['Settlements', '/business/settlements'],
    ['Refunds', '/business/refunds'],
    ['Reports', '/business/reports'],
    ['KYC', '/business/kyc'],
    ['Developers', '/business/developers'],
    ['Settings', '/business/settings'],
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fa] lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-[#e5e7eb] bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <Logo />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Business</p>
          <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
            {uniqueLinks.map(([label, to, end]) => (
              <NavLink
                key={to + label}
                to={to}
                end={!!end}
                className={({ isActive }) =>
                  `block rounded-full px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-[#eef5ff] text-[#0070ba]' : 'text-[#2c2e2f] hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                logout();
                navigate('/login?type=business');
              }}
              className="w-full rounded-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="font-display text-sm font-extrabold text-[#001c64]">Business Dashboard</p>
              <p className="text-xs text-slate-500">{user?.fullName}</p>
            </div>
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-[#001c64]/40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5">
              <Logo />
              <nav className="mt-6 space-y-1">
                {uniqueLinks.map(([label, to, end]) => (
                  <NavLink
                    key={to + label}
                    to={to}
                    end={!!end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-[#eef5ff] text-[#0070ba]' : 'text-[#2c2e2f]'}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login?type=business');
                  }}
                  className="w-full rounded-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
        <main className={isDevelopers ? 'w-full p-0' : 'mx-auto max-w-6xl p-4 md:p-6'}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    ['Dashboard', '/admin', true],
    ['Users', '/admin/users'],
    ['Merchants', '/admin/merchants'],
    ['Transactions', '/admin/transactions'],
    ['Refunds', '/admin/refunds'],
    ['Settlements', '/admin/settlements'],
    ['KYC', '/admin/kyc'],
    ['Complaints', '/admin/complaints'],
    ['API Logs', '/admin/api-logs'],
    ['Settings', '/admin/settings'],
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fa] lg:flex">
      <aside className="hidden w-64 border-r border-[#e5e7eb] bg-[#001c64] text-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <Logo className="[&_.text-navy-900]:text-white [&_.text-slate-500]:text-blue-200" />
          <nav className="mt-8 flex-1 space-y-1">
            {links.map(([label, to, end]) => (
              <NavLink
                key={to}
                to={to}
                end={!!end}
                className={({ isActive }) =>
                  `block rounded-full px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-full px-3 py-2 text-left text-sm font-semibold text-blue-100 hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
