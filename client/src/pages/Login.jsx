import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  destinationForLogin,
  mismatchMessage,
  normalizeAccountIntent,
} from '../utils/authRouting';

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong.';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, logout, user } = useAuth();
  const initialIntent = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account'));
  const [accountType, setAccountType] = useState(initialIntent); // null | 'personal' | 'business'
  const [mode, setMode] = useState('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
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
    const fromUrl = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account'));
    if (fromUrl) setAccountType(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const selectAccountType = (next) => {
    setAccountType(next);
    setOtpSent(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('type', next);
    setSearchParams(nextParams, { replace: true });
  };

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
    const note = mismatchMessage(payload.user, accountType);
    if (note) toast(note, { icon: 'ℹ️' });
    else toast.success(`Welcome back, ${payload.user.fullName?.split(' ')[0] || 'there'}!`);

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
      setOtpSent(true);
      setForm((c) => ({ ...c, otp: '' }));
      setResendCooldown(30);
      toast.success(otpSent ? 'OTP resent successfully' : 'OTP sent successfully');
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
  const registerType = accountType || 'personal';

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
          <h1 className="text-center font-display text-[1.75rem] font-extrabold leading-tight text-[#001c64] sm:text-3xl">
            {isBusiness ? 'Business log in' : accountType === 'personal' ? 'Personal log in' : 'Log in'}
          </h1>
          <p className="mt-2 px-1 text-center text-sm leading-5 text-slate-500">
            {isBusiness
              ? 'Merchant dashboard'
              : accountType === 'personal'
                ? 'Personal wallet'
                : 'We’ll open Personal or Business based on your account'}
            {' · '}
            <button
              type="button"
              onClick={() => selectAccountType(isBusiness ? 'personal' : 'business')}
              className="inline min-h-[44px] font-bold text-[#0070ba] hover:underline sm:min-h-0"
            >
              {isBusiness ? 'Use personal' : 'Use business'}
            </button>
          </p>
          <p className="mt-1 text-center text-sm text-slate-500">
            New here?{' '}
            <Link
              to={`/register?type=${registerType}`}
              className="inline-flex min-h-[44px] items-center font-bold text-[#0070ba] hover:underline sm:min-h-0"
            >
              Sign up
            </Link>
          </p>

          {user && searchParams.get('switch') === '1' ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
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

          <div className="mt-6 rounded-[1.5rem] border border-[#e5e7eb] bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-8 sm:shadow-none">
            {mode === 'password' ? (
              <form onSubmit={submitPassword} className="space-y-4">
                <Input
                  label="Email or mobile"
                  name="identifier"
                  value={form.identifier}
                  onChange={update}
                  placeholder="Email or mobile number"
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
                    placeholder="Enter your password"
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
                    Forgot?
                  </Link>
                </div>
                <Button type="submit" loading={loading} className="mt-1 min-h-12 w-full py-3.5 text-base">
                  Log In
                </Button>
                <button
                  type="button"
                  onClick={() => switchMode('otp')}
                  className="flex min-h-[44px] w-full items-center justify-center text-sm font-bold text-[#0070ba] hover:underline"
                >
                  Use one-time code instead
                </button>
              </form>
            ) : !otpSent ? (
              <form onSubmit={requestOtp} className="space-y-5">
                <Input
                  label="Email or mobile"
                  name="identifier"
                  value={form.identifier}
                  onChange={update}
                  placeholder="Email or mobile number"
                  autoComplete="username"
                  inputMode="email"
                />
                <Button type="submit" loading={loading} className="min-h-12 w-full py-3.5 text-base">
                  Send code
                </Button>
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="flex min-h-[44px] w-full items-center justify-center text-sm font-bold text-[#0070ba] hover:underline"
                >
                  Use password instead
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm leading-5 text-[#003087]">
                  Code sent. Demo OTP: <strong>123456</strong>
                </p>
                <Input
                  label="One-time code"
                  name="otp"
                  value={form.otp}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))
                  }
                  placeholder="6-digit code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="[&_input]:text-center [&_input]:text-xl [&_input]:tracking-[0.35em] sm:[&_input]:text-2xl sm:[&_input]:tracking-[0.4em]"
                />
                <Button type="submit" loading={loading} className="min-h-12 w-full py-3.5 text-base">
                  Log In
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
          </div>
        </div>
      </main>
    </div>
  );
}
