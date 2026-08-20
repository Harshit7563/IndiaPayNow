import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../components/ui';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { destinationForLogin } from '../utils/authRouting';
import { CONTACT_EMAIL } from '../data/siteConfig';

const DEMO_AADHAAR_OTP = '123456';
const dobPattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
const pinPattern = /^\d{6}$/;
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const aadhaarPattern = /^\d{12}$/;
const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const businessTypes = [
  'Retail',
  'Restaurant / Food',
  'Services',
  'E-commerce',
  'Freelancer / Consultant',
  'Education',
  'Healthcare',
  'Travel / Transport',
  'Manufacturing',
  'Wholesale / Distribution',
  'Other',
];

const legalEntities = [
  'Sole proprietorship',
  'Partnership',
  'LLP',
  'Private limited',
  'Public limited',
  'Trust / Society',
  'Other',
];

const designations = ['Owner', 'Director', 'Partner', 'Authorized signatory', 'Proprietor'];

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

const steps = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'tax', label: 'Tax IDs', icon: ShieldCheck },
  { id: 'owner', label: 'Owner', icon: UserRound },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'bank', label: 'Settlement bank', icon: Landmark },
  { id: 'login', label: 'Login', icon: Wallet },
];

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.';

const buildFullName = ({ firstName, middleName, lastName }) =>
  [firstName, middleName, lastName].map((part) => part.trim()).filter(Boolean).join(' ');

function parseDob(value) {
  if (!dobPattern.test(value)) return null;
  const [dd, mm, yyyy] = value.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 18 || age > 120) return null;
  return date;
}

function StatusNote({ status, text, idle }) {
  if (!text && idle) return <p className="mt-1.5 text-xs text-slate-400">{idle}</p>;
  if (!text) return null;
  const tone =
    status === 'loading'
      ? 'text-[#0070ba]'
      : status === 'success'
        ? 'text-emerald-600'
        : status === 'error'
          ? 'text-red-600'
          : 'text-slate-500';
  return <p className={`mt-1.5 text-xs font-medium ${tone}`}>{text}</p>;
}

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [otpOpen, setOtpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pinStatus, setPinStatus] = useState('idle');
  const [pinMeta, setPinMeta] = useState('');
  const [gstinStatus, setGstinStatus] = useState('idle');
  const [gstinMeta, setGstinMeta] = useState('');
  const [panVerified, setPanVerified] = useState(false);
  const [panMeta, setPanMeta] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [ifscStatus, setIfscStatus] = useState('idle');
  const [ifscMeta, setIfscMeta] = useState('');
  const pinRequestRef = useRef(0);
  const gstinRequestRef = useRef(0);
  const ifscRequestRef = useRef(0);
  const [form, setForm] = useState({
    businessName: '',
    legalName: '',
    businessType: 'Retail',
    legalEntity: 'Sole proprietorship',
    website: '',
    gstin: '',
    pan: '',
    firstName: '',
    middleName: '',
    lastName: '',
    designation: 'Owner',
    dateOfBirth: '',
    aadhaar: '',
    aadhaarOtp: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
    accountHolder: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    agreeTerms: false,
    agreeMarketing: false,
  });

  const fullName = useMemo(() => buildFullName(form), [form]);
  const current = steps[step];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Open business account — India Pay Now';
    return () => {
      document.title = 'India Pay Now';
    };
  }, []);

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
        let office = null;
        try {
          const { data } = await api.get(`/kyc/pincode/${pin}`);
          office = data.data;
        } catch {
          const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const payload = await response.json();
          const result = Array.isArray(payload) ? payload[0] : null;
          const first = result?.PostOffice?.[0];
          if (result?.Status === 'Success' && first) {
            office = {
              postOffice: first.Name,
              district: first.District,
              state: first.State,
              block: first.Block,
            };
          }
        }
        if (requestId !== pinRequestRef.current) return;
        if (!office?.district && !office?.state) {
          setPinStatus('error');
          setPinMeta('Invalid PIN code. Please check and try again.');
          return;
        }
        setForm((currentForm) => ({
          ...currentForm,
          city: office.district || office.block || currentForm.city,
          state: indianStates.includes(office.state) ? office.state : currentForm.state || 'Other',
        }));
        setPinStatus('success');
        setPinMeta(`${office.postOffice?.trim() || 'Post office'} · ${office.district}, ${office.state}`);
      } catch {
        if (requestId !== pinRequestRef.current) return;
        setPinStatus('error');
        setPinMeta('Could not verify PIN right now. Try again.');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.pinCode]);

  useEffect(() => {
    const gstin = form.gstin;
    if (!gstin || gstin.length < 15) {
      setGstinStatus('idle');
      setGstinMeta('');
      return undefined;
    }
    const requestId = ++gstinRequestRef.current;
    setGstinStatus('loading');
    setGstinMeta('Verifying GSTIN…');
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post('/kyc/gstin', { gstin });
        if (requestId !== gstinRequestRef.current) return;
        const info = data.data || {};
        setGstinStatus('success');
        setGstinMeta(`${info.state} · PAN ${info.pan} · ${info.holderType}`);
        if (info.pan && !form.pan) {
          setForm((currentForm) => ({ ...currentForm, pan: info.pan }));
        }
      } catch (error) {
        if (requestId !== gstinRequestRef.current) return;
        setGstinStatus('error');
        setGstinMeta(error.response?.data?.message || 'Invalid GSTIN. Check and try again.');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.gstin]);

  useEffect(() => {
    const ifsc = form.ifsc;
    if (!ifsc || ifsc.length < 11) {
      setIfscStatus('idle');
      setIfscMeta('');
      return undefined;
    }
    const requestId = ++ifscRequestRef.current;
    setIfscStatus('loading');
    setIfscMeta('Looking up IFSC…');
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/kyc/ifsc/${ifsc}`);
        if (requestId !== ifscRequestRef.current) return;
        const info = data.data || {};
        setIfscStatus('success');
        setIfscMeta(`${info.bank || 'Bank'} · ${info.branch || 'Branch found'}`);
        setForm((currentForm) => ({
          ...currentForm,
          bankName: info.bank || currentForm.bankName,
        }));
      } catch (error) {
        if (requestId !== ifscRequestRef.current) return;
        setIfscStatus('error');
        setIfscMeta(error.response?.data?.message || 'IFSC not found. Check and try again.');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.ifsc]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'gstin') {
      next = value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    }
    if (name === 'pan') {
      next = value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
      setPanVerified(false);
      setPanMeta('');
    }
    if (name === 'aadhaar') {
      next = value.replace(/\D/g, '').slice(0, 12);
      setAadhaarVerified(false);
      setAadhaarOtpSent(false);
    }
    if (name === 'aadhaarOtp' || name === 'otp') next = value.replace(/\D/g, '').slice(0, 6);
    if (name === 'pinCode') next = value.replace(/\D/g, '').slice(0, 6);
    if (name === 'mobile') next = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'accountNumber' || name === 'confirmAccountNumber') next = value.replace(/\D/g, '').slice(0, 18);
    if (name === 'ifsc') {
      next = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
      setIfscStatus('idle');
    }
    if (name === 'dateOfBirth') {
      const digits = value.replace(/\D/g, '').slice(0, 8);
      if (digits.length <= 2) next = digits;
      else if (digits.length <= 4) next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      else next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    setForm((currentForm) => ({
      ...currentForm,
      [name]: next,
      ...(name === 'aadhaar' ? { aadhaarOtp: '' } : {}),
    }));
  };

  const validateStep = () => {
    if (current.id === 'business') {
      if (!form.businessName.trim()) return 'Business name is required';
      if (!form.businessType || !form.legalEntity) return 'Select business type and legal entity';
    }
    if (current.id === 'tax') {
      if (form.gstin.length !== 15 || gstinStatus !== 'success') return 'Enter a valid GSTIN and wait for verification';
      if (!panPattern.test(form.pan)) return 'Enter a valid 10-character PAN';
      if (!panVerified) return 'Verify PAN before continuing';
    }
    if (current.id === 'owner') {
      if (!form.firstName.trim() || !form.lastName.trim()) return 'Enter owner first and last name';
      if (!parseDob(form.dateOfBirth)) return 'Enter a valid date of birth (dd/mm/yyyy), 18+';
      if (!aadhaarPattern.test(form.aadhaar)) return 'Enter a valid 12-digit Aadhaar';
      if (!aadhaarVerified) return 'Verify owner Aadhaar before continuing';
    }
    if (current.id === 'address') {
      if (!form.addressLine1.trim()) return 'Enter registered address line 1';
      if (!form.city.trim() || !form.state) return 'City and state are required';
      if (!pinPattern.test(form.pinCode) || pinStatus !== 'success') return 'Enter a valid Indian PIN code';
    }
    if (current.id === 'bank') {
      if (!form.accountHolder.trim()) return 'Account holder name is required';
      if (form.accountNumber.length < 9) return 'Enter a valid account number';
      if (form.accountNumber !== form.confirmAccountNumber) return 'Account numbers do not match';
      if (!ifscPattern.test(form.ifsc) || ifscStatus !== 'success') return 'Enter a valid IFSC and wait for lookup';
      if (!form.bankName.trim()) return 'Bank name is required';
    }
    if (current.id === 'login') {
      if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Enter a valid 10-digit Indian mobile number';
      if (!form.email.trim()) return 'Email is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
      if (!form.agreeTerms) return 'Please agree to the User Agreement and Privacy Statement';
    }
    return null;
  };

  const verifyPan = async () => {
    if (!panPattern.test(form.pan)) {
      toast.error('Enter a valid 10-character PAN');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/kyc/pan', { pan: form.pan, intent: 'business' });
      const info = data.data || {};
      setPanVerified(true);
      setPanMeta(info.holderType || 'Valid format');
      toast.success(data.message || 'PAN verified');
    } catch (error) {
      toast.error(errorMessage(error));
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
      await api.post('/kyc/aadhaar', { aadhaar: form.aadhaar });
      setAadhaarOtpSent(true);
      setForm((currentForm) => ({ ...currentForm, aadhaarOtp: '' }));
      toast.success(`Aadhaar checksum valid. Demo OTP: ${DEMO_AADHAAR_OTP}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyAadhaar = async () => {
    if (!aadhaarOtpSent) {
      toast.error('Send OTP first');
      return;
    }
    if (form.aadhaarOtp !== DEMO_AADHAAR_OTP) {
      toast.error('Invalid Aadhaar OTP');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAadhaarVerified(true);
      toast.success('Aadhaar verified');
    } finally {
      setLoading(false);
    }
  };

  const goNext = async (event) => {
    event.preventDefault();
    const message = validateStep();
    if (message) {
      toast.error(message);
      return;
    }
    if (current.id === 'login') {
      await submitRegister();
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName,
        mobile: form.mobile,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: 'merchant',
        nationality: 'India',
        dateOfBirth: form.dateOfBirth,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pinCode: form.pinCode,
        agreeMarketing: form.agreeMarketing,
        pan: form.pan,
        aadhaar: form.aadhaar,
        businessName: form.businessName.trim(),
        legalName: form.legalName.trim() || undefined,
        businessType: form.businessType,
        legalEntity: form.legalEntity,
        gstin: form.gstin,
        website: form.website.trim() || undefined,
        designation: form.designation,
        accountHolder: form.accountHolder.trim(),
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName.trim(),
        settlementCycle: 'Instant',
      });
      setOtpOpen(true);
      setResendCooldown(30);
      toast.success(
        response.data?.data?.resumed
          ? 'OTP sent again. Verify your mobile to continue.'
          : 'Business account created. Verify your mobile to continue.'
      );
    } catch (error) {
      const status = error.response?.status;
      const message = errorMessage(error);
      if (status === 409 && /already registered/i.test(message)) {
        try {
          await api.post('/auth/resend-otp', { identifier: form.mobile, purpose: 'register' });
          setOtpOpen(true);
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
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { identifier: form.mobile, purpose: 'register' });
      setForm((currentForm) => ({ ...currentForm, otp: '' }));
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
      toast.success('Business account ready!');
      navigate(destinationForLogin(user, 'business'), { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111]">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <Link to="/for-business" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0070ba]">
            <ArrowLeft className="h-4 w-4" /> Back to For Business
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#0070ba]">Business onboarding</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#001c64] md:text-4xl">
            Open a business account
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            GSTIN, PAN, owner KYC, registered address, and a settlement bank — then QR and payment links go live.
            Questions? {CONTACT_EMAIL}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const done = index < step;
              const active = index === step && !otpOpen;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (otpOpen) return;
                      if (index <= step) setStep(index);
                    }}
                    className={`flex w-full min-w-[148px] items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                      active
                        ? 'bg-[#001c64] text-white'
                        : done
                          ? 'bg-white text-[#001c64] ring-1 ring-slate-200'
                          : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        active ? 'bg-[#00baf2] text-[#001c64]' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="text-sm font-bold">
                      {String(index + 1).padStart(2, '0')} {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-8">
          {otpOpen ? (
            <form onSubmit={verifyOtp} className="max-w-md space-y-4">
              <h2 className="font-display text-2xl font-extrabold text-[#001c64]">Verify your mobile</h2>
              <p className="text-sm text-slate-600">
                OTP sent to <strong>{form.mobile}</strong>. Enter the 6-digit SMS code.
              </p>
              <Input
                label="6-digit OTP"
                name="otp"
                value={form.otp}
                onChange={update}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
              />
              <Button loading={loading} type="submit" className="w-full rounded-full bg-[#001c64] py-3.5 hover:bg-[#003087]">
                Verify and open dashboard
              </Button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendCooldown > 0 || loading}
                className="w-full text-sm font-bold text-[#0070ba] disabled:text-slate-400"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={goNext} className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#0070ba]">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-[#001c64]">{current.label}</h2>
              </div>

              {current.id === 'business' && (
                <>
                  <Input label="Business / trade name" name="businessName" value={form.businessName} onChange={update} placeholder="As on GST certificate or shop board" />
                  <Input label="Legal name (if different)" name="legalName" value={form.legalName} onChange={update} placeholder="Registered legal name (optional)" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select label="Business category" name="businessType" value={form.businessType} onChange={update}>
                      {businessTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                    <Select label="Legal entity" name="legalEntity" value={form.legalEntity} onChange={update}>
                      {legalEntities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input label="Website (optional)" name="website" value={form.website} onChange={update} placeholder="https://" />
                </>
              )}

              {current.id === 'tax' && (
                <>
                  <div>
                    <Input label="GSTIN" name="gstin" value={form.gstin} onChange={update} placeholder="15-character GSTIN" maxLength={15} autoCapitalize="characters" />
                    <StatusNote status={gstinStatus} text={gstinMeta} idle="Required. GSTN checksum — state, PAN, and entity type decode from the number." />
                  </div>
                  <div>
                    <Input label="PAN" name="pan" value={form.pan} onChange={update} placeholder="ABCDE1234F" maxLength={10} autoCapitalize="characters" />
                    {panVerified ? (
                      <p className="mt-1.5 text-xs font-medium text-emerald-600">Verified{panMeta ? ` · ${panMeta}` : ''}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-400">Business or owner PAN. 4th letter shows holder type.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={verifyPan}
                    disabled={loading || panVerified}
                    className="text-sm font-bold text-[#0070ba] disabled:text-emerald-600"
                  >
                    {panVerified ? 'PAN verified' : 'Verify PAN'}
                  </button>
                </>
              )}

              {current.id === 'owner' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="First name" name="firstName" value={form.firstName} onChange={update} placeholder="First name" />
                    <Input label="Middle name" name="middleName" value={form.middleName} onChange={update} placeholder="Optional" />
                    <Input label="Last name" name="lastName" value={form.lastName} onChange={update} placeholder="Last name" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select label="Designation" name="designation" value={form.designation} onChange={update}>
                      {designations.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                    <Input label="Date of birth" name="dateOfBirth" value={form.dateOfBirth} onChange={update} placeholder="dd/mm/yyyy" inputMode="numeric" />
                  </div>
                  <Input label="Aadhaar number" name="aadhaar" value={form.aadhaar} onChange={update} placeholder="12-digit Aadhaar" inputMode="numeric" maxLength={12} />
                  <button type="button" onClick={sendAadhaarOtp} disabled={loading} className="text-sm font-bold text-[#0070ba]">
                    {aadhaarOtpSent ? 'Resend Aadhaar OTP' : 'Send OTP to Aadhaar-linked mobile'}
                  </button>
                  {aadhaarOtpSent ? (
                    <>
                      <p className="rounded-2xl bg-[#eef5ff] p-3 text-sm text-[#003087]">
                        Checksum passed. Demo OTP: <strong>{DEMO_AADHAAR_OTP}</strong>
                      </p>
                      <Input label="Aadhaar OTP" name="aadhaarOtp" value={form.aadhaarOtp} onChange={update} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} />
                      <button
                        type="button"
                        onClick={verifyAadhaar}
                        disabled={loading || aadhaarVerified}
                        className="text-sm font-bold text-[#0070ba] disabled:text-emerald-600"
                      >
                        {aadhaarVerified ? 'Aadhaar verified' : 'Verify Aadhaar'}
                      </button>
                    </>
                  ) : null}
                </>
              )}

              {current.id === 'address' && (
                <>
                  <Input label="Address line 1" name="addressLine1" value={form.addressLine1} onChange={update} placeholder="Shop / building, street" />
                  <Input label="Address line 2" name="addressLine2" value={form.addressLine2} onChange={update} placeholder="Landmark (optional)" />
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-[#2c2e2f]">PIN code</span>
                      <div className="relative">
                        <input
                          name="pinCode"
                          value={form.pinCode}
                          onChange={update}
                          placeholder="6-digit PIN"
                          inputMode="numeric"
                          className={`input-field pr-11 ${
                            pinStatus === 'error'
                              ? 'border-red-500'
                              : pinStatus === 'success'
                                ? 'border-emerald-500'
                                : ''
                          }`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {pinStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin text-[#0070ba]" /> : null}
                          {pinStatus === 'success' ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          ) : null}
                          {pinStatus === 'error' ? <CircleAlert className="h-5 w-5 text-red-500" /> : null}
                        </span>
                      </div>
                    </label>
                    <StatusNote status={pinStatus} text={pinMeta} idle="Live lookup via India Post. City and state auto-fill." />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="City" name="city" value={form.city} onChange={update} placeholder="Town / city" />
                    <Select label="State" name="state" value={form.state} onChange={update}>
                      {indianStates.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                </>
              )}

              {current.id === 'bank' && (
                <>
                  <p className="rounded-2xl bg-[#f7f8fa] px-4 py-3 text-sm text-slate-600">
                    Settlement must be to a bank account in the business name. Typical credit is instant after collect.
                  </p>
                  <Input label="Account holder name" name="accountHolder" value={form.accountHolder} onChange={update} placeholder="As per bank records" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Account number" name="accountNumber" value={form.accountNumber} onChange={update} placeholder="Account number" inputMode="numeric" />
                    <Input label="Confirm account number" name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={update} placeholder="Re-enter account number" inputMode="numeric" />
                  </div>
                  <div>
                    <Input label="IFSC" name="ifsc" value={form.ifsc} onChange={update} placeholder="HDFC0001234" maxLength={11} autoCapitalize="characters" />
                    <StatusNote status={ifscStatus} text={ifscMeta} idle="11-character IFSC. Bank name fills from the RBI directory." />
                  </div>
                  <Input label="Bank name" name="bankName" value={form.bankName} onChange={update} placeholder="Auto-filled from IFSC" />
                </>
              )}

              {current.id === 'login' && (
                <>
                  <Input label="Business mobile" name="mobile" value={form.mobile} onChange={update} placeholder="10-digit mobile" inputMode="numeric" />
                  <Input label="Business email" name="email" type="email" value={form.email} onChange={update} placeholder="accounts@yourbusiness.in" />
                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={update}
                      placeholder="Minimum 6 characters"
                      className="[&_input]:pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-[2.35rem] text-slate-400"
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
                      placeholder="Re-enter password"
                      className="[&_input]:pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-[2.35rem] text-slate-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                    <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={update} className="mt-0.5 h-4 w-4 accent-[#0070ba]" />
                    <span>
                      I agree to India Pay Now&apos;s{' '}
                      <Link to="/company/about-us" className="font-bold text-[#0070ba]">
                        User Agreement
                      </Link>{' '}
                      and{' '}
                      <Link to="/company/about-us" className="font-bold text-[#0070ba]">
                        Privacy Statement
                      </Link>
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                    <input type="checkbox" name="agreeMarketing" checked={form.agreeMarketing} onChange={update} className="mt-0.5 h-4 w-4 accent-[#0070ba]" />
                    <span>I agree to receive product updates. I can change this later.</span>
                  </label>
                </>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((value) => value - 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-[#001c64]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : null}
                <Button loading={loading} type="submit" className="rounded-full bg-[#001c64] px-6 py-3 hover:bg-[#003087]">
                  {current.id === 'login' ? 'Create business account' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          <p className="mt-8 text-sm text-slate-500">
            Already collecting?{' '}
            <Link to="/login?type=business" className="font-bold text-[#0070ba]">
              Business login
            </Link>
            <span className="mt-2 block">
              Personal wallet?{' '}
              <Link to="/register?type=personal" className="font-bold text-[#0070ba]">
                Personal signup
              </Link>
              {' · '}
              <Link to="/login" className="font-bold text-[#0070ba]">
                Personal login
              </Link>
            </span>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
