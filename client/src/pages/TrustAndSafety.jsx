import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Ban,
  ChevronDown,
  EyeOff,
  Fingerprint,
  Handshake,
  Lock,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { CONTACT_EMAIL } from '../data/siteConfig';

const pillars = [
  {
    icon: Fingerprint,
    title: 'Secure from the start',
    text: 'Every payment needs your device lock, UPI PIN, or 2FA. We never complete a transfer without you.',
  },
  {
    icon: EyeOff,
    title: 'Payment privacy',
    text: 'Only you and the person you pay can see transaction details. We never share your PIN, OTP, or card data.',
  },
  {
    icon: Activity,
    title: 'Live risk checks',
    text: 'Every transfer is scored in real time. High-risk payments are blocked, and suspicious accounts are frozen.',
  },
  {
    icon: Handshake,
    title: 'Partners in protection',
    text: 'We work with banks, NPCI rails, and cybercrime cells so fraud can be reported and stopped faster.',
  },
];

const safetyTips = [
  {
    icon: Lock,
    title: 'Never share secrets',
    text: 'India Pay Now will never ask for your UPI PIN, OTP, CVV, or password on a call, SMS, or WhatsApp.',
  },
  {
    icon: Ban,
    title: 'PIN is only to send',
    text: 'You never enter a UPI PIN to receive money. If someone asks you to, it is a scam.',
  },
  {
    icon: ShieldAlert,
    title: 'Skip remote apps',
    text: 'Do not install AnyDesk, TeamViewer, or screen-sharing apps because a stranger asked you to.',
  },
  {
    icon: Smartphone,
    title: 'Check before you pay',
    text: 'Confirm the name on the QR or UPI ID. Fake merchants often look almost right.',
  },
];

const alerts = [
  {
    tag: 'UPI cash scam',
    title: 'Do not accept UPI in return for physical cash',
    text: 'Fraudsters use QR codes as a fake ATM. Once you scan, the money leaves your account — the cash never arrives.',
  },
  {
    tag: 'Impersonation',
    title: 'We never call from “bank / RBI / police”',
    text: 'Scammers pretend to be officers and ask you to “verify” your PIN. Hang up and report it inside the app.',
  },
  {
    tag: 'KYC fraud',
    title: 'No one needs your Aadhaar OTP for India Pay Now',
    text: 'Official KYC happens only inside the signed-in app. Never share OTPs with a visitor, SMS link, or caller.',
  },
];

const faqs = [
  {
    q: 'How does India Pay Now keep my payments safe?',
    a: 'Every transaction gets a risk score. Unusual devices, amounts, or destinations can be blocked automatically. UPI PIN and optional 2FA sit on top of that.',
  },
  {
    q: 'What can I do to keep my account safe?',
    a: 'Never share PIN, OTP, CVV, or card numbers. Do not enter a PIN to receive money. Keep 2FA on. Log out of shared phones.',
  },
  {
    q: 'What if someone tries to log in to my account?',
    a: 'A new device always needs an OTP on your registered mobile. Three wrong OTPs lock the login for 24 hours.',
  },
  {
    q: 'How do I report fraud?',
    a: 'Open the app → Support → raise a ticket with “Fraud”. You can also use this website after login, and file a complaint at cybercrime.gov.in.',
  },
  {
    q: 'Is it safe to add a bank account?',
    a: 'Yes. Bank linking uses official UPI/NPCI flows. We never store your UPI PIN. You can unlink a bank anytime from Profile.',
  },
  {
    q: 'Is the India Pay Now app safe?',
    a: 'Payments run on bank-grade encryption, device checks, and live monitoring. Download only from the official Play Store or App Store listing.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-base font-bold text-[#001c64] md:text-lg">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#0070ba] transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? <p className="pb-5 pr-10 text-sm leading-relaxed text-slate-600">{item.a}</p> : null}
    </div>
  );
}

export default function TrustAndSafety() {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Trust & Safety — India Pay Now';
    return () => {
      document.title = 'India Pay Now';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111]">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#d7ecff_0%,#e8f8f1_48%,#fde8e8_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[62%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#0070ba]/20" />
        <div className="pointer-events-none absolute left-1/2 top-[62%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#00baf2]/25" />
        <div className="pointer-events-none absolute left-1/2 top-[62%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#0070ba]/18" />

        <div className="relative mx-auto grid min-h-[420px] max-w-6xl items-center gap-6 px-4 py-16 md:min-h-[520px] md:grid-cols-[1fr_auto_1fr] md:py-20">
          <div className="hidden justify-self-end md:block">
            <div className="w-44 -rotate-[10deg] rounded-[1.4rem] bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.14)]">
              <p className="text-[11px] font-semibold text-slate-400">Sending</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-[#001c64]">₹350</p>
              <p className="mt-3 rounded-full bg-emerald-50 px-2 py-1 text-center text-[10px] font-bold text-emerald-600">
                UPI PIN verified
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0070ba]">Trust &amp; Safety</p>
            <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#001c64] text-white shadow-[0_12px_30px_rgba(0,28,100,0.28)]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[#001c64] sm:text-5xl md:text-[3.15rem]">
              Every payment protected
            </h1>
            <p className="mt-3 text-base text-slate-600 md:text-lg">Your money is safe on India Pay Now</p>
          </div>

          <div className="hidden justify-self-start md:block">
            <div className="w-44 rotate-[9deg] rounded-[1.4rem] bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.14)]">
              <p className="text-[11px] font-semibold text-slate-400">Bank linked</p>
              <p className="mt-1 font-display text-lg font-extrabold text-[#001c64]">HDFC •••• 4521</p>
              <p className="mt-3 rounded-full bg-[#e8f4ff] px-2 py-1 text-center text-[10px] font-bold text-[#0070ba]">
                Encrypted
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] px-4 py-16 text-white md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-[#001c64] md:p-12">
            <p className="text-sm font-semibold text-[#f58220]">Did you know that</p>
            <p className="mt-3 font-display text-6xl font-extrabold tracking-tight md:text-7xl">
              <span className="bg-[linear-gradient(90deg,#0070ba,#00baf2,#f58220)] bg-clip-text text-transparent">
                10L+
              </span>
            </p>
            <p className="mt-2 text-xl font-bold">Indians trust India Pay Now</p>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-[#c5ddf5] md:text-xl">
            That’s why we run advanced security on every transfer. We do what it takes to earn the trust
            you place in us — bank-grade encryption, live monitoring, and a team that treats fraud as
            urgent.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
          Your safety comes first
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          From the first login to every UPI send, India Pay Now is built so only you can move your money.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.6rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.04)] md:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f4ff] text-[#0070ba]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#001c64]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
            Your guide to safe transactions
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Learn to spot suspicious payment requests, fake profiles, and common UPI tricks.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {safetyTips.map((tip, i) => (
              <div key={tip.title} className="rounded-[1.5rem] bg-[#f4f8fc] p-5">
                <span className="text-xs font-bold text-[#0070ba]">0{i + 1}</span>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#001c64] shadow-sm">
                  <tip.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-[#001c64]">{tip.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
          Latest fraud alerts
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {alerts.map((alert) => (
            <article
              key={alert.title}
              className="flex flex-col rounded-[1.6rem] border border-slate-200 bg-white p-6"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-600">
                <AlertTriangle className="h-3 w-3" />
                {alert.tag}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold leading-snug text-[#001c64]">{alert.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{alert.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
            Find out more about India Pay Now safety
          </h2>
          <div className="mt-8">
            {faqs.map((item, i) => (
              <FaqItem
                key={item.q}
                item={item}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
          How to report suspicious activity
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-[#001c64] p-7 text-white md:p-8">
            <p className="text-sm font-semibold text-[#9fd0f5]">On the app</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Registered users</h3>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-white/80">
              <li>1. Open India Pay Now on your phone</li>
              <li>2. Go to Support</li>
              <li>3. Raise a ticket with subject “Fraud” or “Account security”</li>
            </ol>
            <Link
              to="/app/support"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#001c64]"
            >
              Open Support
            </Link>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 md:p-8">
            <p className="text-sm font-semibold text-[#0070ba]">On the web &amp; with police</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#001c64]">Anyone can report</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              File a cyber complaint even if you are not logged in. Keep the UTR, time, and UPI ID ready.
            </p>
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-sm font-bold text-white"
            >
              cybercrime.gov.in <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] px-4 py-16 text-center text-white md:py-20">
        <PhoneCall className="mx-auto h-8 w-8 text-[#9fd0f5]" />
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Need help right now?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
          India Pay Now never asks for your PIN. If someone did, freeze the account from Profile and
          contact support immediately at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#9fd0f5] hover:text-white">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Link
          to="/app/support"
          className="mt-7 inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold text-[#111] transition hover:bg-slate-100"
        >
          Contact support
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
