import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Smartphone,
  User,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.';

const destinationFor = (role) => (role === 'merchant' ? '/business' : '/app');

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    otp: '',
  });

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const register = async (event) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.mobile || !form.email.trim() || !form.password) {
      toast.error('Please complete all required fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        mobile: form.mobile,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      });
      setStep('otp');
      toast.success('Account created! Verify your mobile to continue.');
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
        identifier: form.mobile,
        code: form.otp,
        purpose: 'register',
      });
      const { token, user } = response.data.data;
      login(token, user);
      toast.success('Welcome to India Pay Now!');
      navigate(destinationFor(user.role), { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111111]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/80 transition hover:text-[#111]"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </header>

        <div className="fade-up my-auto grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
          {/* Light left story */}
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0070ba] shadow-sm ring-1 ring-slate-200/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
              </span>
              Safe, simple, made for India
            </span>

            <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.75rem]">
              Create your account and take control of{' '}
              <span className="text-slate-400">your payments.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500 md:text-[15px]">
              Send money, pay bills, recharge, and run your business from one clean India Pay Now account.
            </p>

            <div className="mt-7 space-y-3">
              {[
                'Instant UPI transfers',
                'Bank-grade security',
                'Personal & business ready',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcebff] text-[#0070ba]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                ['10L+', 'Users'],
                ['₹2Cr+', 'Daily'],
                ['99.9%', 'Uptime'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                >
                  <p className="font-display text-lg font-extrabold text-[#111]">{value}</p>
                  <p className="text-[11px] font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#f8fbff] to-white px-6 py-5 sm:px-8">
                <p className="text-sm font-semibold text-[#5ba3d9]">
                  {step === 'details' ? 'Create account' : 'Verify mobile'}
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#111] sm:text-[1.75rem]">
                  {step === 'details' ? 'Join India Pay Now' : 'Confirm it is you'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {step === 'details'
                    ? 'Start securely in just a couple of minutes.'
                    : `OTP sent to +91 ${form.mobile}`}
                </p>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-7">
                {step === 'details' ? (
                  <>
                    <div className="mb-6">
                      <p className="mb-2 text-sm font-semibold text-[#111]">I&apos;m joining for</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['user', UserRound, 'Personal', 'Everyday payments'],
                          ['merchant', BriefcaseBusiness, 'Business', 'Accept & manage'],
                        ].map(([role, Icon, title, subtitle]) => {
                          const selected = form.role === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setForm((current) => ({ ...current, role }))}
                              className={`rounded-2xl border p-3.5 text-left transition sm:p-4 ${
                                selected
                                  ? 'border-[#0070ba] bg-[#e8f4ff] shadow-sm ring-2 ring-[#0070ba]/15'
                                  : 'border-slate-200 bg-[#f8fafc] hover:border-slate-300 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                    selected ? 'bg-white text-[#0070ba]' : 'bg-white text-slate-400'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                    selected ? 'border-[#0070ba] bg-[#0070ba] text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {selected ? <Check className="h-3 w-3" /> : null}
                                </span>
                              </div>
                              <p className="mt-3 text-sm font-bold text-[#111]">{title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <form onSubmit={register} className="space-y-4">
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-[2.85rem] z-10 h-4 w-4 text-slate-400" />
                        <Input
                          label="Full name"
                          name="fullName"
                          value={form.fullName}
                          onChange={update}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          inputClassName="rounded-xl border-slate-200 bg-[#f8fafc] !pl-11 focus:border-[#0070ba] focus:bg-white"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <Smartphone className="pointer-events-none absolute left-3.5 top-[2.85rem] z-10 h-4 w-4 text-slate-400" />
                          <Input
                            label="Mobile number"
                            name="mobile"
                            value={form.mobile}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                mobile: event.target.value.replace(/\D/g, '').slice(0, 10),
                              }))
                            }
                            placeholder="9876543210"
                            inputMode="numeric"
                            autoComplete="tel"
                            inputClassName="rounded-xl border-slate-200 bg-[#f8fafc] !pl-11 focus:bg-white"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-[2.85rem] z-10 h-4 w-4 text-slate-400" />
                          <Input
                            label="Email address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={update}
                            placeholder="you@example.com"
                            autoComplete="email"
                            inputClassName="rounded-xl border-slate-200 bg-[#f8fafc] !pl-11 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <Input
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={update}
                            placeholder="Minimum 6 characters"
                            autoComplete="new-password"
                            inputClassName="rounded-xl border-slate-200 bg-[#f8fafc] !pr-11 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((shown) => !shown)}
                            className="absolute right-3 top-[2.65rem] z-10 rounded p-1 text-slate-400 hover:text-[#111]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            label="Confirm password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={update}
                            placeholder="Enter password again"
                            autoComplete="new-password"
                            inputClassName="rounded-xl border-slate-200 bg-[#f8fafc] !pr-11 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((shown) => !shown)}
                            className="absolute right-3 top-[2.65rem] z-10 rounded p-1 text-slate-400 hover:text-[#111]"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs leading-5 text-slate-500">
                        By creating an account, you agree to our{' '}
                        <a href="/company/about-us" className="font-semibold text-[#0070ba] hover:underline">
                          Terms
                        </a>{' '}
                        and{' '}
                        <a href="/company/about-us" className="font-semibold text-[#0070ba] hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0070ba] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,112,186,0.28)] transition hover:bg-[#005ea6] disabled:opacity-60"
                      >
                        {loading ? 'Creating…' : 'Create account'}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                      </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold text-[#0070ba] hover:underline">
                        Log in
                      </Link>
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4ff] text-[#0070ba]">
                      <KeyRound className="h-8 w-8" />
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      <ShieldCheck className="h-3.5 w-3.5" /> Account created
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-extrabold text-[#111]">Verify your mobile</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Enter the OTP sent to <span className="font-semibold text-[#111]">+91 {form.mobile}</span>.
                    </p>

                    <form onSubmit={verifyOtp} className="mx-auto mt-7 max-w-sm space-y-4 text-left">
                      <div className="rounded-2xl bg-[#f0f7ff] px-4 py-3 text-center text-sm text-[#0070ba] ring-1 ring-[#cfe6ff]">
                        Demo OTP: <strong>123456</strong>
                      </div>
                      <Input
                        label="6-digit OTP"
                        name="otp"
                        value={form.otp}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            otp: event.target.value.replace(/\D/g, '').slice(0, 6),
                          }))
                        }
                        placeholder="••••••"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="[&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-[#f8fafc] [&_input]:text-center [&_input]:font-display [&_input]:text-2xl [&_input]:tracking-[0.45em] [&_input]:focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0070ba] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,112,186,0.28)] transition hover:bg-[#005ea6] disabled:opacity-60"
                      >
                        {loading ? 'Verifying…' : 'Verify & continue'}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="w-full text-center text-sm font-medium text-slate-500 hover:text-[#0070ba]"
                      >
                        Change registration details
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
