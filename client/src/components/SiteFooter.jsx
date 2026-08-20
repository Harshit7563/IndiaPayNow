import { Link } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { CONTACT_EMAIL } from '../data/siteConfig';

const columns = [
  ['Company', ['About Us', 'Careers', 'Press', 'Blog', 'Trust & Safety']],
  ['Features', ['Send Money', 'Bill Payments', 'Recharges', 'Smart Wallet']],
  ['Business', ['Exports', 'Payment Links', 'Merchant QR', 'Settlements', 'Developer APIs']],
  ['Accounts', ['Personal', 'Business', 'Savings']],
  ['Lifestyle', ['Rewards', 'Insurance', 'Donations']],
];

const pageLinks = {
  'About Us': '/company/about-us',
  Careers: '/company/careers',
  Press: '/company/press',
  Blog: '/company/blog',
  'Send Money': '/features/send-money',
  'Bill Payments': '/features/bill-payments',
  Recharges: '/features/recharges',
  'Smart Wallet': '/features/smart-wallet',
  Exports: '/for-business/exports',
  'Payment Links': '/for-business/payment-links',
  'Merchant QR': '/for-business/merchant-qr',
  Settlements: '/for-business/settlements',
  'Developer APIs': '/for-business/developer-apis',
  Personal: '/accounts/personal',
  Business: '/accounts/business',
  Savings: '/accounts/savings',
  Rewards: '/lifestyle/rewards',
  Insurance: '/lifestyle/insurance',
  Donations: '/lifestyle/donations',
  'Trust & Safety': '/trust-and-safety',
};

const appLinks = {
  ...pageLinks,
  'Send Money': '/app/send',
  'Bill Payments': '/app?service=electricity',
  Recharges: '/app?service=mobile',
  'Smart Wallet': '/app',
  Exports: '/for-business/exports',
  'Payment Links': '/app/merchant',
  'Merchant QR': '/app/merchant',
  Settlements: '/app/merchant',
  'Developer APIs': '/app/merchant',
  Rewards: '/app/rewards',
  Insurance: '/app?service=insurance',
};

function SocialIcon({ label, children }) {
  return (
    <a
      href="#help"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9fd0f5] text-[#111] transition hover:bg-[#b9dcf8]"
    >
      {children}
    </a>
  );
}

export function SiteFooter({ variant = 'marketing' }) {
  const map = variant === 'app' ? appLinks : pageLinks;
  const hrefFor = (item) => map[item] || (variant === 'app' ? '/app' : '/');

  return (
    <footer id="help" className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-sm">
            <Logo className="[&_.text-navy-900]:text-white [&_.text-slate-500]:text-slate-400" />
            <p className="mt-4 text-sm leading-relaxed text-white">
              Designed for the next generation. India Pay Now makes managing your money effortless.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-block text-sm font-semibold text-[#9fd0f5] hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="mt-6 flex gap-3">
              <SocialIcon label="YouTube">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M22 12.2s0-3.2-.4-4.6a2.8 2.8 0 0 0-2-2C17.8 5.2 12 5.2 12 5.2s-5.8 0-7.6.4a2.8 2.8 0 0 0-2 2C2 9 2 12.2 2 12.2s0 3.2.4 4.6a2.8 2.8 0 0 0 2 2c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.8 2.8 0 0 0 2-2c.4-1.4.4-4.6.4-4.6zM10 15.5v-6.6l5.6 3.3z" /></svg>
              </SocialIcon>
              <SocialIcon label="Instagram">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM17.2 6.6a.9.9 0 0 1 .9-.9z" /></svg>
              </SocialIcon>
              <SocialIcon label="Facebook">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z" /></svg>
              </SocialIcon>
              <SocialIcon label="LinkedIn">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M6.5 9H4V20h2.5zM5.2 4A1.5 1.5 0 1 0 6.7 5.5 1.5 1.5 0 0 0 5.2 4zM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6s-2 1.1-2 2.6V20H11V9h2.4v1.5A3.3 3.3 0 0 1 16.4 9C19 9 20 10.7 20 13.8z" /></svg>
              </SocialIcon>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((item) => {
                    const href = hrefFor(item);
                    return (
                      <li key={item}>
                        <Link to={href} className="text-sm text-white transition hover:text-[#9fd0f5]">
                          {item}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p>Privacy Policy / Terms</p>
            <Link
              to="/trust-and-safety"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0a0a0a] shadow-[0_8px_20px_rgba(255,255,255,0.12)] transition hover:bg-[#e8f4ff]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#0070ba]" />
              Trust &amp; Safety
            </Link>
            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0a0a0a] shadow-[0_8px_20px_rgba(255,255,255,0.12)] transition hover:bg-[#e8f4ff]"
            >
              <Building2 className="h-3.5 w-3.5 text-[#0070ba]" />
              For Business
            </Link>
          </div>
          <p>All rights reserved © India Pay Now {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
