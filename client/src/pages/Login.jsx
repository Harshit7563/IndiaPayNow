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
  const initialIntent = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account')) || 'personal';
  const [accountType, setAccountType] = useState(initialIntent);
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
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('type', next);
    setSearchParams(nextParams, { replace: true });
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#e5e7eb] px-4 py-5">
        <div className="mx-auto flex max-w-lg justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="fade-up w-full max-w-md">
          <h1 className="text-center font-display text-3xl font-extrabold text-[#001c64]">Log in to your account</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Or{' '}
            <Link
              to={`/register?type=${accountType}`}
              className="font-bold text-[#0070ba] hover:underline"
            >
              sign up
            </Link>
          </p>

          {user && searchParams.get('switch') === '1' ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Signed in as <strong>{user.email}</strong>.{' '}
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

          <div className="mt-8 grid grid-cols-2 gap-2 rounded-full bg-[#f7f9fa] p-1">
            <button
              type="button"
              onClick={() => selectAccountType('personal')}
              className={`rounded-full py-2.5 text-sm font-bold ${
                accountType === 'personal' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => selectAccountType('business')}
              className={`rounded-full py-2.5 text-sm font-bold ${
                accountType === 'business' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
              }`}
            >
              Business
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-[#f7f9fa] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('otp');
                setOtpSent(false);
              }}
              className={`rounded-full py-2.5 text-sm font-bold ${
                mode === 'otp' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
              }`}
            >
              One-time code
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setOtpSent(false);
              }}
              className={`rounded-full py-2.5 text-sm font-bold ${
                mode === 'password' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
              }`}
            >
              Password
            </button>
          </div>

          <div className="mt-8 rounded-3xl border border-[#e5e7eb] bg-white p-6 sm:p-8">
            <p className="mb-5 text-sm text-slate-500">
              {accountType === 'business'
                ? 'Log in to your business / merchant dashboard.'
                : 'Log in to your personal wallet and payments.'}
            </p>
            {mode === 'password' ? (
              <form onSubmit={submitPassword} className="space-y-4">
                <Input
                  label="Email or mobile"
                  name="identifier"
                  value={form.identifier}
                  onChange={update}
                  placeholder="Email or mobile number"
                  autoComplete="username"
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
                    className="[&_input]:pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-[39px] text-slate-400"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
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
                <Button type="submit" loading={loading} className="mt-2 w-full py-3.5">
                  Log In
                </Button>
              </form>
            ) : !otpSent ? (
              <form onSubmit={requestOtp} className="space-y-5">
                <Input
                  label="Email or mobile"
                  name="identifier"
                  value={form.identifier}
                  onChange={update}
                  placeholder="Email or mobile number"
                />
                <Button type="submit" loading={loading} className="w-full py-3.5">
                  Next
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm text-[#003087]">
                  Enter the code sent to your mobile. Demo OTP: <strong>123456</strong>
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
                  className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-[0.4em]"
                />
                <Button type="submit" loading={loading} className="w-full py-3.5">
                  Log In
                </Button>
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={loading || resendCooldown > 0}
                  className="w-full text-sm font-bold text-[#0070ba] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Personal demo: harshit@indiapaynow.com · Business: merchant@indiapaynow.com · Password@123
          </p>
        </div>
      </main>
    </div>
  );
}
