import { Gift, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_DOWNLOAD, GIFT_OFFER } from '../data/appDownload';

function PlayStoreBadge({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-[48px] items-center gap-3 rounded-xl bg-[#111] px-4 py-2.5 text-white transition hover:bg-black"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
        <path
          fill="#EA4335"
          d="M3.6 2.1c-.3.2-.6.6-.6 1.1v17.6c0 .5.3.9.6 1.1l9.2-9.9L3.6 2.1z"
        />
        <path fill="#FBBC04" d="M14.3 12.9l-1.5-1.6 1.5-1.6 3.7-2.1-8.9-5.1 5.2 10.4z" />
        <path fill="#4285F4" d="M14.3 12.9l5.2 2.9c.7.4 1.5-.1 1.5-.9v-.1c0-.3-.2-.6-.4-.8l-6.3-1.1z" />
        <path fill="#34A853" d="M14.3 11.1l6.3-1.1c.2-.2.4-.5.4-.8v-.1c0-.8-.8-1.3-1.5-.9l-5.2 2.9z" />
        <path fill="#fff" d="M12.8 11.3l-9.2 9.9c.2.1.4.1.6 0l10.1-5.7-1.5-4.2z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium text-white/70">GET IT ON</span>
        <span className="block text-sm font-bold">Google Play</span>
      </span>
    </a>
  );
}

function AppStoreBadge({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-[48px] items-center gap-3 rounded-xl bg-[#111] px-4 py-2.5 text-white transition hover:bg-black"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-white" aria-hidden>
        <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.2-.9-2.2-3.4zM14.3 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium text-white/70">Download on the</span>
        <span className="block text-sm font-bold">App Store</span>
      </span>
    </a>
  );
}

export function GiftOfferCard({ active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`overflow-hidden rounded-[1.75rem] bg-[#dcebff] p-6 text-left text-slate-800 transition md:min-h-[260px] md:rounded-[2rem] md:p-7 ${
        active ? 'ring-2 ring-[#111]/20' : 'opacity-95 hover:opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-3xl font-extrabold leading-none text-[#0070ba] sm:text-4xl">
          {GIFT_OFFER.amount}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#003087] ring-1 ring-[#0070ba]/15">
          <Sparkles className="h-3 w-3" />
          {GIFT_OFFER.badge}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#003087]">{GIFT_OFFER.perk}</p>
      <p className="mt-1 inline-flex rounded-md bg-[#111] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
        Code {GIFT_OFFER.code}
      </p>
      <h3 className="mt-5 font-display text-2xl font-bold">{GIFT_OFFER.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{GIFT_OFFER.text}</p>
    </button>
  );
}

export function AppDownloadOffers() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:rounded-[2rem]">
        <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[linear-gradient(145deg,#0070ba_0%,#003087_55%,#001c64_100%)] p-6 text-white sm:p-8 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/20">
              <Gift className="h-3.5 w-3.5" />
              Gift offers · App exclusive
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Download the app &amp; unlock gift cashback
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Send festive gifts in a tap. Get <strong className="text-white">₹100 cashback</strong> on
              each of your first 3 gifts — up to ₹300.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                ['₹100 × 3', 'First gifts cashback'],
                ['0 fee', 'Festival gift sends'],
                ['Instant', 'UPI gift delivery'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/12 px-3.5 py-2.5 ring-1 ring-white/15 backdrop-blur"
                >
                  <p className="text-sm font-extrabold text-white">{value}</p>
                  <p className="text-[11px] text-white/70">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <PlayStoreBadge href={APP_DOWNLOAD.android} />
              <AppStoreBadge href={APP_DOWNLOAD.ios} />
            </div>
            <p className="mt-3 text-[11px] text-white/55">
              Use code <span className="font-mono font-bold text-white">{GIFT_OFFER.code}</span> in the
              app after signup.
            </p>
          </div>

          <div className="flex flex-col justify-center bg-[#f7f9fa] p-6 sm:p-8">
            <p className="text-sm font-semibold text-[#5ba3d9]">How it works</p>
            <ol className="mt-4 space-y-4">
              {[
                'Download India Pay Now on Android or iOS',
                'Sign up and open Gifts from Home',
                `Apply ${GIFT_OFFER.code} — ₹100 back on first 3 gifts`,
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm font-medium leading-snug text-[#111]">{step}</p>
                </li>
              ))}
            </ol>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#111] px-6 py-3 text-sm font-bold text-white transition hover:bg-black"
            >
              Claim offer — create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
