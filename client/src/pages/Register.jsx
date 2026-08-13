import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Check, CircleAlert, Eye, EyeOff, IdCard, Loader2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../components/ui';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { destinationForLogin, normalizeAccountIntent, roleForIntent } from '../utils/authRouting';

const nationalities = [
  'India',
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Singapore',
  'Australia',
  'Canada',
  'Other',
];

const businessTypes = [
  'Retail',
  'Restaurant / Food',
  'Services',
  'E-commerce',
  'Freelancer / Consultant',
  'Education',
  'Healthcare',
  'Travel / Transport',
  'Other',
];

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other',
];

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const dobPattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
const pinPattern = /^\d{6}$/;
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const aadhaarPattern = /^\d{12}$/;
const DEMO_AADHAAR_OTP = '123456';

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.';

const buildFullName = ({ firstName, middleName, lastName }) =>
  [firstName, middleName, lastName].map((part) => part.trim()).filter(Boolean).join(' ');

function parseDob(value) {
  if (!dobPattern.test(value)) return null;
  const [dd, mm, yyyy] = value.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  const age =
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 18 || age > 120) return null;
  return date;
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const urlIntent = normalizeAccountIntent(searchParams.get('type') || searchParams.get('account') || searchParams.get('role'));
  const [step, setStep] = useState('type');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dobError, setDobError] = useState('');
  const [pinStatus, setPinStatus] = useState('idle'); // idle | loading | success | error
  const [pinMeta, setPinMeta] = useState('');
  const [kycSkipped, setKycSkipped] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const pinRequestRef = useRef(0);
  const [form, setForm] = useState({
    role: roleForIntent(urlIntent || 'personal'),
    nationality: 'India',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
    agreeTerms: false,
    agreeMarketing: false,
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    pan: '',
    aadhaar: '',
    aadhaarOtp: '',
    businessName: '',
    businessType: 'Retail',
    gstin: '',
  });

  const isBusiness = form.role === 'merchant';
  const fullName = useMemo(() => buildFullName(form), [form]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const pin = form.pinCode;
    if (pin.length < 6) {
      setPinStatus('idle');
      setPinMeta('');
      return undefined;
    }

    const requestId = ++pinRequestRef.current;
    setPinStatus('loading');
    setPinMeta('Fetching PIN details…');

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (requestId !== pinRequestRef.current) return;

        const result = Array.isArray(data) ? data[0] : null;
        const office = result?.PostOffice?.[0];
        if (result?.Status !== 'Success' || !office) {
          setPinStatus('error');
          setPinMeta('Invalid PIN code. Please check and try again.');
          return;
        }

        setForm((current) => ({
          ...current,
          city: office.District || office.Block || current.city,
          state: indianStates.includes(office.State) ? office.State : current.state || 'Other',
        }));
        setPinStatus('success');
        setPinMeta(`${office.Name?.trim() || 'Post office'} · ${office.District}, ${office.State}`);
      } catch {
        if (requestId !== pinRequestRef.current) return;
        setPinStatus('error');
        setPinMeta('Could not verify PIN right now. Try again.');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.pinCode]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'gstin') next = value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    if (name === 'pan') {
      next = value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
      setPanVerified(false);
    }
    if (name === 'aadhaar') {
      next = value.replace(/\D/g, '').slice(0, 12);
      setAadhaarVerified(false);
      setAadhaarOtpSent(false);
    }
    if (name === 'aadhaarOtp') next = value.replace(/\D/g, '').slice(0, 6);
    if (name === 'pinCode') {
      next = value.replace(/\D/g, '').slice(0, 6);
      if (String(next).length < 6) {
        setPinStatus('idle');
        setPinMeta('');
      }
    }
    if (name === 'dateOfBirth') {
      const digits = value.replace(/\D/g, '').slice(0, 8);
      if (digits.length <= 2) next = digits;
      else if (digits.length <= 4) next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      else next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      setDobError('');
    }
    setForm((current) => ({
      ...current,
      [name]: next,
      ...(name === 'aadhaar' ? { aadhaarOtp: '' } : {}),
    }));
  };

  const goBack = () => {
    if (step === 'personal') setStep('type');
    else if (step === 'address') setStep('personal');
    else if (step === 'kyc') setStep('address');
    else if (step === 'kyc-pan') setStep('kyc');
    else if (step === 'kyc-aadhaar') setStep('kyc-pan');
    else if (step === 'business') setStep('type');
    else if (step === 'credentials') {
      if (isBusiness) setStep('business');
      else if (kycSkipped) setStep('kyc');
      else if (aadhaarVerified || aadhaarOtpSent) setStep('kyc-aadhaar');
      else if (panVerified) setStep('kyc-pan');
      else setStep('kyc');
    } else if (step === 'otp') setStep('credentials');
  };

  const skipKyc = () => {
    setKycSkipped(true);
    setStep('credentials');
  };

  const startKyc = () => {
    setKycSkipped(false);
    setStep('kyc-pan');
  };

  const verifyPan = async (event) => {
    event.preventDefault();
    if (!panPattern.test(form.pan)) {
      toast.error('Enter a valid 10-character PAN (e.g. ABCDE1234F)');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setPanVerified(true);
      toast.success('PAN verified');
      setStep('kyc-aadhaar');
    } finally {
      setLoading(false);
    }
  };

  const sendAadhaarOtp = async () => {
    if (!aadhaarPattern.test(form.aadhaar)) {
      toast.error('Enter a valid 12-digit Aadhaar number');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAadhaarOtpSent(true);
      setForm((current) => ({ ...current, aadhaarOtp: '' }));
      toast.success(`Aadhaar OTP sent (demo: ${DEMO_AADHAAR_OTP})`);
    } finally {
      setLoading(false);
    }
  };

  const verifyAadhaar = async (event) => {
    event.preventDefault();
    if (!aadhaarPattern.test(form.aadhaar)) {
      toast.error('Enter a valid 12-digit Aadhaar number');
      return;
    }
    if (!aadhaarOtpSent) {
      toast.error('Send OTP to your Aadhaar-linked mobile first');
      return;
    }
    if (form.aadhaarOtp !== DEMO_AADHAAR_OTP) {
      toast.error('Invalid Aadhaar OTP');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setAadhaarVerified(true);
      toast.success('Aadhaar verified');
      setStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  const continueFromType = () => {
    setStep(isBusiness ? 'business' : 'personal');
  };

  const continueFromPersonal = (event) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Enter your first and last name');
      return;
    }
    if (!form.dateOfBirth) {
      setDobError('Please enter a valid date. Use format: dd/mm/yyyy');
      return;
    }
    if (!parseDob(form.dateOfBirth)) {
      setDobError('Please enter a valid date. Use format: dd/mm/yyyy');
      return;
    }
    setDobError('');
    setStep('address');
  };

  const continueFromAddress = (event) => {
    event.preventDefault();
    if (!form.addressLine1.trim()) {
      toast.error('Enter address line 1');
      return;
    }
    if (!form.city.trim()) {
      toast.error('Enter your town / city');
      return;
    }
    if (!form.state) {
      toast.error('Select your state');
      return;
    }
    if (!pinPattern.test(form.pinCode)) {
      toast.error('Enter a valid 6-digit PIN code');
      return;
    }
    if (pinStatus === 'loading') {
      toast.error('Please wait while we verify your PIN code');
      return;
    }
    if (pinStatus !== 'success') {
      toast.error('Enter a valid Indian PIN code');
      return;
    }
    if (!form.agreeTerms) {
      toast.error('Please agree to the User Agreement and Privacy Statement');
      return;
    }
    setStep('kyc');
  };

  const continueFromBusiness = (event) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Enter owner first and last name');
      return;
    }
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!form.city.trim()) {
      toast.error('City is required for business accounts');
      return;
    }
    if (form.gstin && !gstinPattern.test(form.gstin)) {
      toast.error('Enter a valid 15-character GSTIN or leave it blank');
      return;
    }
    setStep('credentials');
  };

  const register = async (event) => {
    event.preventDefault();
    if (!fullName || !form.mobile || !form.email.trim() || !form.password) {
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
      const response = await api.post('/auth/register', {
        fullName,
        mobile: form.mobile,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        nationality: form.nationality,
        dateOfBirth: form.dateOfBirth,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pinCode: form.pinCode,
        agreeMarketing: form.agreeMarketing,
        ...(isBusiness
          ? {
              businessName: form.businessName.trim(),
              businessType: form.businessType,
              gstin: form.gstin.trim() || undefined,
            }
          : {}),
      });
      setStep('otp');
      setResendCooldown(30);
      const resumed = response.data?.data?.resumed;
      toast.success(
        resumed
          ? 'OTP sent again. Verify your mobile to continue.'
          : 'Account created! Verify your mobile to continue.'
      );
    } catch (error) {
      const status = error.response?.status;
      const message = errorMessage(error);
      // Older servers / partial signup: continue to OTP if credentials already exist
      if (status === 409 && /already registered/i.test(message)) {
        try {
          await api.post('/auth/resend-otp', {
            identifier: form.mobile,
            purpose: 'register',
          });
          setStep('otp');
          setResendCooldown(30);
          toast.success('Account already started. Enter the OTP sent to your mobile.');
          return;
        } catch {
          toast.error(`${message} Try logging in instead.`);
          return;
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    if (!form.mobile) {
      toast.error('Mobile number missing');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', {
        identifier: form.mobile,
        purpose: 'register',
      });
      setForm((current) => ({ ...current, otp: '' }));
      setResendCooldown(30);
      toast.success('OTP resent to your mobile');
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
      toast.success(isBusiness ? 'Business account ready!' : 'Welcome to India Pay Now!');
      navigate(destinationForLogin(user, isBusiness ? 'business' : 'personal'), { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const showBack = step !== 'type';

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

      <main className="flex flex-1 items-start justify-center px-4 py-6 sm:py-12">
        <div className="fade-up w-full max-w-md pb-8">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#111] transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          {step === 'type' && (
            <>
              <h1 className="text-center font-display text-[1.75rem] font-extrabold text-[#111] sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                Or{' '}
                <Link to={`/login?type=${isBusiness ? 'business' : 'personal'}`} className="font-bold text-[#0070ba] hover:underline">
                  log in
                </Link>
              </p>

              <div className="mt-8 grid grid-cols-2 gap-2 rounded-full bg-[#f7f9fa] p-1">
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role: 'user' }))}
                  className={`rounded-full py-2.5 text-sm font-bold ${
                    form.role === 'user' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role: 'merchant' }))}
                  className={`rounded-full py-2.5 text-sm font-bold ${
                    form.role === 'merchant' ? 'bg-white text-[#001c64] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Business
                </button>
              </div>

              <div className="mt-8 rounded-3xl border border-[#e5e7eb] bg-white p-6 sm:p-8">
                <p className="text-sm leading-relaxed text-slate-500">
                  {isBusiness
                    ? 'Open a business account to accept payments, share QR, and settle to your bank.'
                    : 'Open a personal account to send money, pay bills, and recharge.'}
                </p>
                <Button type="button" onClick={continueFromType} className="mt-6 w-full rounded-full bg-[#111] py-3.5 hover:bg-black">
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 'personal' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Personal information
              </h1>
              <p className="mt-2 text-sm text-slate-500">Make sure this matches your official ID.</p>

              <form onSubmit={continueFromPersonal} className="mt-8 space-y-4">
                <Select label="Nationality" name="nationality" value={form.nationality} onChange={update}>
                  {nationalities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Input
                  label="First name"
                  name="firstName"
                  value={form.firstName}
                  onChange={update}
                  placeholder="First name"
                  autoComplete="given-name"
                />
                <Input
                  label="Middle name"
                  name="middleName"
                  value={form.middleName}
                  onChange={update}
                  placeholder="Middle name (optional)"
                  autoComplete="additional-name"
                />
                <Input
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={update}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
                <div>
                  <Input
                    label="Date of birth"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={update}
                    placeholder="dd/mm/yyyy"
                    inputMode="numeric"
                    autoComplete="bday"
                    inputClassName={dobError ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {dobError ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <span aria-hidden>⚠</span> {dobError}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black"
                >
                  Next
                </button>
              </form>
            </>
          )}

          {step === 'address' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Your address
              </h1>
              <p className="mt-2 text-sm text-slate-500">Make sure to use your billing address.</p>

              <form onSubmit={continueFromAddress} className="mt-8 space-y-4">
                <Input
                  label="Address line 1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={update}
                  placeholder="House no., street, area"
                  autoComplete="address-line1"
                />
                <Input
                  label="Address line 2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={update}
                  placeholder="Landmark (optional)"
                  autoComplete="address-line2"
                />
                <Input
                  label="Town / City"
                  name="city"
                  value={form.city}
                  onChange={update}
                  placeholder="Town / City"
                  autoComplete="address-level2"
                />
                <Select label="State" name="state" value={form.state} onChange={update}>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
                <div>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-[#2c2e2f]">PIN code</span>
                    <div className="relative">
                      <input
                        name="pinCode"
                        value={form.pinCode}
                        onChange={update}
                        placeholder="6-digit PIN code"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        className={`input-field pr-11 ${
                          pinStatus === 'error'
                            ? 'border-red-500 focus:border-red-500'
                            : pinStatus === 'success'
                              ? 'border-emerald-500 focus:border-emerald-500'
                              : ''
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {pinStatus === 'loading' ? (
                          <Loader2 className="h-5 w-5 animate-spin text-[#0070ba]" />
                        ) : null}
                        {pinStatus === 'success' ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        ) : null}
                        {pinStatus === 'error' ? (
                          <CircleAlert className="h-5 w-5 text-red-500" />
                        ) : null}
                      </span>
                    </div>
                  </label>
                  {pinMeta ? (
                    <p
                      className={`mt-1.5 text-xs font-medium ${
                        pinStatus === 'loading'
                          ? 'text-[#0070ba]'
                          : pinStatus === 'success'
                            ? 'text-emerald-600'
                            : pinStatus === 'error'
                              ? 'text-red-600'
                              : 'text-slate-500'
                      }`}
                    >
                      {pinMeta}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-400">Verified via India Post PIN API</p>
                  )}
                </div>

                <label className="flex items-start gap-3 pt-2 text-sm leading-5 text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={form.agreeTerms}
                    onChange={update}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0070ba]"
                  />
                  <span>
                    By clicking the button below, I agree to be bound by India Pay Now&apos;s{' '}
                    <a href="/company/about-us" className="font-bold text-[#0070ba] hover:underline">
                      User Agreement
                    </a>{' '}
                    and{' '}
                    <a href="/company/about-us" className="font-bold text-[#0070ba] hover:underline">
                      Privacy Statement
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={form.agreeMarketing}
                    onChange={update}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0070ba]"
                  />
                  <span>
                    I agree to receive marketing communications from India Pay Now. I can change my notification
                    preferences at any time.
                  </span>
                </label>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black"
                >
                  Agree and Create Account
                </button>
              </form>
            </>
          )}

          {step === 'kyc' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-[#111] sm:text-3xl">
                To pay, you need to provide some information
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                As per RBI guidelines, complete your KYC (Know Your Customer) to start making payments.
              </p>

              <div className="mt-8">
                <p className="text-sm font-bold text-[#111]">What we need</p>
                <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                  {[
                    {
                      icon: UserRound,
                      title: 'PAN number',
                      detail: null,
                      done: panVerified,
                    },
                    {
                      icon: Banknote,
                      title: 'Basic financial information',
                      detail: null,
                      done: aadhaarVerified,
                    },
                    {
                      icon: IdCard,
                      title: 'A copy of your ID',
                      detail: 'Verify with Aadhaar OTP, DigiLocker, or upload later.',
                      done: aadhaarVerified,
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 bg-white px-4 py-4">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[#111]">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#111]">{item.title}</p>
                          {item.done ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                              <Check className="h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                              <CircleAlert className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        {item.detail ? (
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.detail}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="/company/about-us"
                  className="mt-4 inline-block text-sm font-semibold text-[#0070ba] hover:underline"
                >
                  Have questions? Read our FAQs
                </a>

                <button
                  type="button"
                  onClick={startKyc}
                  className="mt-8 w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={skipKyc}
                  className="mt-3 w-full text-center text-sm font-bold text-[#0070ba] hover:underline"
                >
                  Do it later
                </button>
              </div>
            </>
          )}

          {step === 'kyc-pan' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Verify your PAN
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter the PAN linked to {fullName || 'your name'}. We use this for RBI KYC compliance.
              </p>

              <form onSubmit={verifyPan} className="mt-8 space-y-4">
                <Input
                  label="PAN number"
                  name="pan"
                  value={form.pan}
                  onChange={update}
                  placeholder="ABCDE1234F"
                  autoComplete="off"
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <p className="text-xs leading-5 text-slate-500">
                  Demo mode accepts any valid PAN format (10 characters: 5 letters, 4 digits, 1 letter).
                </p>
                <Button type="submit" loading={loading} className="mt-2 w-full rounded-full bg-[#111] py-3.5 hover:bg-black">
                  Verify PAN
                </Button>
              </form>
            </>
          )}

          {step === 'kyc-aadhaar' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Verify your Aadhaar
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Confirm identity with Aadhaar OTP. Your number is used only for verification.
              </p>

              <form onSubmit={verifyAadhaar} className="mt-8 space-y-4">
                {panVerified ? (
                  <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    PAN verified: <strong>{form.pan}</strong>
                  </p>
                ) : null}
                <Input
                  label="Aadhaar number"
                  name="aadhaar"
                  value={form.aadhaar}
                  onChange={update}
                  placeholder="12-digit Aadhaar"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={12}
                />
                <button
                  type="button"
                  onClick={sendAadhaarOtp}
                  disabled={loading}
                  className="text-sm font-bold text-[#0070ba] hover:underline disabled:opacity-60"
                >
                  {aadhaarOtpSent ? 'Resend Aadhaar OTP' : 'Send OTP to Aadhaar-linked mobile'}
                </button>

                {aadhaarOtpSent ? (
                  <>
                    <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm text-[#003087]">
                      Enter the OTP sent to your Aadhaar mobile. Demo OTP: <strong>{DEMO_AADHAAR_OTP}</strong>
                    </p>
                    <Input
                      label="Aadhaar OTP"
                      name="aadhaarOtp"
                      value={form.aadhaarOtp}
                      onChange={update}
                      placeholder="6-digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!aadhaarOtpSent}
                  className="mt-2 w-full rounded-full bg-[#111] py-3.5 hover:bg-black"
                >
                  Verify Aadhaar
                </Button>
              </form>
            </>
          )}

          {step === 'business' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Business information
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Tell us about your shop so you can start collecting payments.
              </p>

              <form onSubmit={continueFromBusiness} className="mt-8 space-y-4">
                <Input
                  label="Owner first name"
                  name="firstName"
                  value={form.firstName}
                  onChange={update}
                  placeholder="First name"
                />
                <Input
                  label="Owner last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={update}
                  placeholder="Last name"
                />
                <Input
                  label="Business name"
                  name="businessName"
                  value={form.businessName}
                  onChange={update}
                  placeholder="Registered / shop name"
                />
                <Select label="Business type" name="businessType" value={form.businessType} onChange={update}>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Input label="City" name="city" value={form.city} onChange={update} placeholder="e.g. Mumbai" />
                <Input
                  label="GSTIN (optional)"
                  name="gstin"
                  value={form.gstin}
                  onChange={update}
                  placeholder="15-character GSTIN"
                />
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#111] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black"
                >
                  Next
                </button>
              </form>
            </>
          )}

          {step === 'credentials' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Account details
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Create login details for {fullName || 'your account'}.
              </p>

              <form onSubmit={register} className="mt-8 space-y-4">
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
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className="[&_input]:pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute right-3.5 top-[39px] text-slate-400"
                    aria-label="Toggle password"
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
                    className="[&_input]:pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((shown) => !shown)}
                    className="absolute right-3.5 top-[39px] text-slate-400"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  By continuing, you agree to our{' '}
                  <a href="/company/about-us" className="font-bold text-[#0070ba] hover:underline">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="/company/about-us" className="font-bold text-[#0070ba] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>

                <Button type="submit" loading={loading} className="mt-2 w-full rounded-full bg-[#111] py-3.5 hover:bg-black">
                  Create account
                </Button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#111] sm:text-3xl">
                Verify your mobile
              </h1>
              <p className="mt-2 text-sm text-slate-500">OTP sent to +91 {form.mobile}</p>

              <form onSubmit={verifyOtp} className="mt-8 space-y-5">
                <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm text-[#003087]">
                  Enter the code sent to your mobile. Demo OTP: <strong>123456</strong>
                </p>
                <Input
                  label="One-time code"
                  name="otp"
                  value={form.otp}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      otp: event.target.value.replace(/\D/g, '').slice(0, 6),
                    }))
                  }
                  placeholder="6-digit code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-[0.4em]"
                />
                <Button type="submit" loading={loading} className="w-full rounded-full bg-[#111] py-3.5 hover:bg-black">
                  Verify & continue
                </Button>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="w-full text-sm font-bold text-[#0070ba] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} India Pay Now · Privacy · Legal
          </p>
        </div>
      </main>
    </div>
  );
}
