import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Eye, EyeOff, Landmark, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { destinationForLogin, normalizeAccountIntent } from '../utils/authRouting';
import { showMismatchToast } from '../components/RouteHintToast';

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong.';

const DEMO_MERCHANT = {
  identifier: 'merchant@indiapaynow.com',
  password: 'Password@123',
};

const DEMO_PERSONAL = {
  identifier: 'harshit@indiapaynow.com',
  password: 'Password@123',
};

const merchantHighlights = [
  ['QR & payment links', 'Collect at the counter or on an invoice', QrCode],
  ['Verified merchants only', 'GSTIN, PAN, and bank match before go-live', ShieldCheck],
  ['Instant settle', 'Credit to your business bank with UTR tracking', Landmark],
];

function OtpBoxes({ value, onChange, disabled }) {
  const refs = useRef([]);

  const setDigit = (index, digit) => {
    const next = value.split('');
    while (next.length < 6) next.push('');
    next[index] = digit;
    onChange(next.join('').slice(0, 6));
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(node) => {
            refs.current[i] = node;
          }}
          value={value[i] || ''}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, '').slice(-1);
            setDigit(i, digit);
            if (digit && refs.current[i + 1]) refs.current[i + 1].focus();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !value[i] && refs.current[i - 1]) {
              refs.current[i - 1].focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            onChange(pasted);
            const nextIndex = Math.min(pasted.length, 5);
            refs.current[nextIndex]?.focus();
          }}
          className="h-12 w-full rounded-xl border border-slate-200 bg-[#f7f8fa] text-center font-display text-xl font-bold text-[#001c64] outline-none transition focus:border-[#0070ba] focus:bg-white focus:ring-4 focus:ring-[#0070ba]/15"
        />
      ))}
    </div>
  );
}

function ModeTabs({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 rounded-full bg-[#f7f8fa] p-1">
      {[
        ['otp', 'One-time code'],
        ['password', 'Password'],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-full py-2.5 text-sm font-bold transition ${
            mode === id ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500 hover:text-[#001c64]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, logout, user } = useAuth();
  const accountType =
    normalizeAccountIntent(searchParams.get('type') || searchParams.get('account')) === 'business'
      ? 'business'
      : 'personal';
  const [mode, setMode] = useState('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpMasked, setOtpMasked] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
    otp: '',
  });

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const switchMode = (next) => {
    setMode(next);
    setOtpSent(false);
  };

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const finishLogin = (payload) => {
    login(payload.token, payload.user);
    if (!showMismatchToast(payload.user, accountType)) {
      toast.success(`Welcome back, ${payload.user.fullName?.split(' ')[0] || 'there'}!`);
    }
    const requestedPath = searchParams.get('redirect');
    navigate(destinationForLogin(payload.user, accountType, requestedPath), { replace: true });
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      toast.error('Enter your email/mobile and password');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        identifier: form.identifier.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });
      const payload = response.data.data;
      if (payload.otpRequired) {
        setMode('otp');
        setOtpSent(true);
        setOtpIdentifier(payload.identifier);
        setOtpMasked(payload.mobileMasked || '');
        setResendCooldown(30);
        toast.success('OTP sent to your registered mobile');
      } else {
        finishLogin(payload);
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (event) => {
    event?.preventDefault?.();
    if (resendCooldown > 0 && otpSent) return;
    if (!form.identifier.trim()) {
      toast.error('Enter your registered email or mobile');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/otp-login', { identifier: form.identifier.trim() });
      setOtpIdentifier(response.data.data.identifier);
      setOtpMasked(response.data.data.mobileMasked || '');
      setOtpSent(true);
      setForm((c) => ({ ...c, otp: '' }));
      setResendCooldown(30);
      toast.success(response.data.message || (otpSent ? 'OTP resent successfully' : 'OTP sent successfully'));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (form.otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        identifier: otpIdentifier,
        code: form.otp,
        purpose: 'login',
      });
      finishLogin(response.data.data);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = accountType === 'business';
  const registerTo = isBusiness ? '/for-business/open-account' : `/register?type=${accountType || 'personal'}`;

  const formCard = (
    <>
      {user && searchParams.get('switch') === '1' ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Signed in as <strong className="break-all">{user.email}</strong>.{' '}
          <button
            type="button"
            className="font-bold text-[#0070ba] hover:underline"
            onClick={() => {
              logout();
              toast.success('Signed out. You can log in with another account.');
            }}
          >
            Clear session
          </button>
        </div>
      ) : null}

      {mode === 'password' ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <Input
            label="Wallet email or mobile"
            name="identifier"
            value={form.identifier}
            onChange={update}
            placeholder="harshit@indiapaynow.com or 9876543210"
            autoComplete="username"
            inputMode="email"
          />
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={update}
              placeholder="Enter password"
              autoComplete="current-password"
              className="[&_input]:pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-[34px] flex h-11 w-11 items-center justify-center text-slate-400"
              aria-label="Toggle password"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex min-h-[44px] items-center gap-2 text-slate-600 sm:min-h-0">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={update}
                className="h-4 w-4 accent-[#0070ba]"
              />
              Stay logged in
            </label>
            <Link
              to="/forgot-password"
              className="inline-flex min-h-[44px] items-center font-bold text-[#0070ba] hover:underline sm:min-h-0"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={loading} className="mt-1 min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
            Log in
          </Button>
          <div className="relative py-1 text-center">
            <span className="relative z-10 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">or</span>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
          </div>
          <button
            type="button"
            onClick={() => switchMode('otp')}
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-[#001c64] hover:bg-slate-50"
          >
            Use one-time code
          </button>
        </form>
      ) : !otpSent ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <Input
            label="Wallet email or mobile"
            name="identifier"
            value={form.identifier}
            onChange={update}
            placeholder="harshit@indiapaynow.com or 9876543210"
            autoComplete="username"
            inputMode="email"
          />
          <Button type="submit" loading={loading} className="min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
            Send code
          </Button>
          <div className="relative py-1 text-center">
            <span className="relative z-10 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">or</span>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
          </div>
          <button
            type="button"
            onClick={() => switchMode('password')}
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-[#001c64] hover:bg-slate-50"
          >
            Use password
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm leading-5 text-[#003087]">
            Code sent to {otpMasked || 'your registered mobile'}. Enter the 6-digit SMS OTP.
          </p>
          <div>
            <p className="mb-2 text-sm font-semibold text-[#2c2e2f]">One-time code</p>
            <OtpBoxes
              value={form.otp}
              disabled={loading}
              onChange={(otp) => setForm((current) => ({ ...current, otp }))}
            />
          </div>
          <Button type="submit" loading={loading} className="min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
            Log in
          </Button>
          <button
            type="button"
            onClick={requestOtp}
            disabled={loading || resendCooldown > 0}
            className="flex min-h-[44px] w-full items-center justify-center text-sm font-bold text-[#0070ba] disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => switchMode('password')}
            className="flex min-h-[44px] w-full items-center justify-center text-sm font-semibold text-slate-500 hover:text-[#0070ba]"
          >
            Use password instead
          </button>
        </form>
      )}
    </>
  );

  if (isBusiness) {
    return (
      <div className="min-h-dvh min-h-screen bg-[#f7f8fa] text-[#111]">
        <div className="grid min-h-dvh min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden overflow-hidden bg-[#001c64] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#00baf2]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#0070ba]/40 blur-3xl" />
            <div className="relative">
              <Link to="/for-business" className="inline-block">
                <p className="font-display text-2xl font-extrabold tracking-tight text-white">India Pay Now</p>
                <p className="mt-0.5 text-[11px] font-medium text-white/55">Payments Made Simple</p>
              </Link>
              <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-[#00baf2]">Merchant dashboard</p>
              <h1 className="mt-3 max-w-md font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight">
                Your counter, invoices, and bank — one login
              </h1>

              <div className="mt-8 max-w-sm rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/55">Priya Retail Store</p>
                    <p className="mt-1 font-display text-2xl font-extrabold">₹24,800</p>
                    <p className="text-xs text-white/50">Today’s collect</p>
                  </div>
                  <img src="/logos/upi-on-dark.svg" alt="UPI" className="h-6 w-auto object-contain" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[#001c64]/50 px-3 py-2.5">
                    <p className="text-[11px] text-white/50">Available</p>
                    <p className="mt-0.5 text-sm font-bold">₹12,450</p>
                  </div>
                  <div className="rounded-2xl bg-[#001c64]/50 px-3 py-2.5">
                    <p className="text-[11px] text-white/50">Settle</p>
                    <p className="mt-0.5 text-sm font-bold text-[#00baf2]">Instant</p>
                  </div>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {merchantHighlights.map(([title, text, Icon]) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-5 w-5 text-[#00baf2]" strokeWidth={1.7} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="mt-0.5 text-sm text-white/55">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative text-xs text-white/35">GSTIN + PAN verified before QR and payouts go live</p>
          </aside>

          <main className="flex flex-col px-4 py-6 sm:px-10 sm:py-10">
            <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
              <div className="mb-8 flex items-center justify-between">
                <Link to="/for-business" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0070ba]">
                  <ArrowLeft className="h-4 w-4" /> For Business
                </Link>
                <Link to="/" className="lg:hidden">
                  <Logo size="sm" />
                </Link>
              </div>

              <div className="flex flex-1 flex-col justify-center pb-8">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#001c64] px-3 py-1 text-[11px] font-bold text-white">
                  <Building2 className="h-3.5 w-3.5" /> Business
                </span>
                <h2 className="font-display text-[2rem] font-extrabold tracking-tight text-[#001c64] sm:text-[2.15rem]">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Sign in with the mobile or email on your merchant KYC.
                </p>

                <div className="mt-7 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(0,28,100,0.08)] sm:p-7">
                  {user && searchParams.get('switch') === '1' ? (
                    <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Signed in as <strong className="break-all">{user.email}</strong>.{' '}
                      <button
                        type="button"
                        className="font-bold text-[#0070ba] hover:underline"
                        onClick={() => {
                          logout();
                          toast.success('Signed out. You can log in with another account.');
                        }}
                      >
                        Clear session
                      </button>
                    </div>
                  ) : null}

                  <ModeTabs
                    mode={otpSent ? 'otp' : mode}
                    onChange={(next) => {
                      switchMode(next);
                    }}
                  />

                  {mode === 'password' ? (
                    <form onSubmit={submitPassword} className="mt-5 space-y-4">
                      <Input
                        label="Business email or mobile"
                        name="identifier"
                        value={form.identifier}
                        onChange={update}
                        placeholder="merchant@indiapaynow.com"
                        autoComplete="username"
                        inputMode="email"
                      />
                      <div className="relative">
                        <Input
                          label="Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={update}
                          placeholder="Enter password"
                          autoComplete="current-password"
                          className="[&_input]:pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-[34px] flex h-11 w-11 items-center justify-center text-slate-400"
                          aria-label="Toggle password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <label className="flex items-center gap-2 text-slate-600">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={form.rememberMe}
                            onChange={update}
                            className="h-4 w-4 accent-[#0070ba]"
                          />
                          Stay logged in
                        </label>
                        <Link to="/forgot-password" className="font-bold text-[#0070ba] hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Button type="submit" loading={loading} className="min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
                        Log in to dashboard
                      </Button>
                    </form>
                  ) : !otpSent ? (
                    <form onSubmit={requestOtp} className="mt-5 space-y-4">
                      <Input
                        label="Business email or mobile"
                        name="identifier"
                        value={form.identifier}
                        onChange={update}
                        placeholder="merchant@indiapaynow.com"
                        autoComplete="username"
                        inputMode="email"
                      />
                      <Button type="submit" loading={loading} className="min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
                        Send login code
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={verifyOtp} className="mt-5 space-y-4">
                      <p className="text-sm text-slate-500">
                        Code sent to {otpMasked || 'your registered mobile'}. Enter the 6-digit SMS OTP.
                      </p>
                      <OtpBoxes
                        value={form.otp}
                        disabled={loading}
                        onChange={(otp) => setForm((current) => ({ ...current, otp }))}
                      />
                      <Button type="submit" loading={loading} className="min-h-12 w-full rounded-full bg-[#001c64] py-3.5 text-base hover:bg-[#003087]">
                        Verify and continue
                      </Button>
                      <button
                        type="button"
                        onClick={requestOtp}
                        disabled={loading || resendCooldown > 0}
                        className="flex w-full items-center justify-center text-sm font-bold text-[#0070ba] disabled:text-slate-400"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setForm((current) => ({
                        ...current,
                        identifier: DEMO_MERCHANT.identifier,
                        password: DEMO_MERCHANT.password,
                      }));
                      if (mode === 'otp') switchMode('password');
                      toast.success('Demo merchant filled');
                    }}
                    className="mt-5 w-full rounded-2xl bg-[#f7f8fa] px-4 py-3 text-left text-xs leading-relaxed text-slate-500"
                  >
                    <span className="font-bold text-[#001c64]">Try demo merchant</span>
                    <span className="mt-0.5 block">merchant@indiapaynow.com · Password@123</span>
                  </button>
                </div>

                <Link
                  to={registerTo}
                  className="mt-5 flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-[#001c64] hover:border-[#001c64]/30"
                >
                  Open a business account
                </Link>
                <p className="mt-4 text-center text-sm text-slate-500">
                  Personal wallet?{' '}
                  <Link to="/login" className="font-bold text-[#0070ba] hover:underline">
                    Personal login
                  </Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh min-h-screen flex-col bg-white pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-[#e5e7eb] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:py-5">
        <div className="mx-auto flex max-w-lg justify-center">
          <Link to="/" className="max-w-[90vw]">
            <Logo size="sm" className="sm:hidden" />
            <Logo className="hidden sm:block" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
        <div className="fade-up w-full max-w-md">
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-emerald-700">
              <Wallet className="h-3.5 w-3.5" /> Personal wallet
            </span>
          </div>
          <h1 className="text-center font-display text-[1.75rem] font-extrabold leading-tight text-[#001c64] sm:text-3xl">
            Personal login
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Send, receive, and pay bills from your wallet.
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to={registerTo} className="font-bold text-[#0070ba] hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-7 rounded-[1.5rem] border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-8">
            {formCard}
            <button
              type="button"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  identifier: DEMO_PERSONAL.identifier,
                  password: DEMO_PERSONAL.password,
                }));
                if (mode === 'otp') switchMode('password');
                toast.success('Demo wallet filled');
              }}
              className="mt-5 w-full rounded-2xl bg-[#f7f8fa] px-4 py-3 text-left text-xs leading-relaxed text-slate-500"
            >
              <span className="font-bold text-[#001c64]">Try demo wallet</span>
              <span className="mt-0.5 block">harshit@indiapaynow.com · Password@123</span>
            </button>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            Collecting payments?{' '}
            <Link to="/login?type=business" className="font-bold text-[#0070ba] hover:underline">
              Business login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
