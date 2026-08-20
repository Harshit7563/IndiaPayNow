import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  KeyRound,
  Laptop,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BankLogo } from '../../components/BankLogo';
import { Badge, Button, Card, Input, Modal, PageHeader, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { findBankByIfsc, findBankByName, indianBanks } from '../../data/indianBanks';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';

const tabs = [
  ['profile', 'Profile'],
  ['security', 'Security'],
  ['banks', 'Bank Accounts'],
  ['preferences', 'Preferences'],
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: '', email: '', mobile: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [banks, setBanks] = useState([]);
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankStep, setBankStep] = useState('pick');
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [bank, setBank] = useState({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', isDefault: false });
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [twoFaTarget, setTwoFaTarget] = useState(true);
  const [twoFaOtp, setTwoFaOtp] = useState('');
  const [twoFaMobile, setTwoFaMobile] = useState('');
  const [twoFaSending, setTwoFaSending] = useState(false);
  const [twoFaVerifying, setTwoFaVerifying] = useState(false);
  const [twoFaCooldown, setTwoFaCooldown] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    paymentNotifications: true,
    twoFaEnabled: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.fullName || '', email: user.email || '', mobile: user.mobile || '' });
      setPreferences({
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? true,
        paymentNotifications: user.paymentNotifications ?? true,
        twoFaEnabled: user.twoFaEnabled ?? false,
      });
    }
  }, [user]);

  const loadAccountData = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.get('/user/bank-accounts'),
      api.get('/user/login-history'),
      api.get('/user/sessions'),
    ]);
    if (results[0].status === 'fulfilled') setBanks(results[0].value.data.data || []);
    if (results[1].status === 'fulfilled') setHistory(results[1].value.data.data || []);
    if (results[2].status === 'fulfilled') setSessions(results[2].value.data.data || []);
    if (results.some((item) => item.status === 'rejected')) toast.error('Some account data could not be loaded');
    setLoading(false);
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  useEffect(() => {
    if (twoFaCooldown <= 0) return undefined;
    const timer = setTimeout(() => setTwoFaCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [twoFaCooldown]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', profile);
      await refreshUser();
      toast.success(data.message || 'Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (password.newPassword !== password.confirmPassword) return toast.error('New passwords do not match');
    setSaving(true);
    try {
      const { data } = await api.put('/user/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(data.message || 'Password changed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key, value) => {
    const previous = preferences;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    try {
      const { data } = await api.put('/user/preferences', { [key]: value });
      await refreshUser();
      toast.success(data.message || 'Preference updated');
    } catch (error) {
      setPreferences(previous);
      toast.error(error.response?.data?.message || 'Could not update preference');
    }
  };

  const sendTwoFaOtp = async (enable) => {
    setTwoFaSending(true);
    try {
      const { data } = await api.post('/user/2fa/request-otp', { enable });
      setTwoFaMobile(data.data?.mobile || user?.mobile || '');
      setTwoFaCooldown(30);
      toast.success(data.message || 'OTP sent to your mobile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send OTP');
      throw error;
    } finally {
      setTwoFaSending(false);
    }
  };

  const openTwoFaModal = async (enable) => {
    setTwoFaTarget(enable);
    setTwoFaOtp('');
    setTwoFaMobile(user?.mobile || '');
    setTwoFaOpen(true);
    try {
      await sendTwoFaOtp(enable);
    } catch {
      setTwoFaOpen(false);
    }
  };

  const closeTwoFaModal = () => {
    setTwoFaOpen(false);
    setTwoFaOtp('');
    setTwoFaCooldown(0);
  };

  const verifyTwoFa = async (event) => {
    event.preventDefault();
    if (twoFaOtp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setTwoFaVerifying(true);
    try {
      const { data } = await api.post('/user/2fa/confirm', {
        enable: twoFaTarget,
        code: twoFaOtp,
      });
      setPreferences((current) => ({ ...current, twoFaEnabled: twoFaTarget }));
      await refreshUser();
      toast.success(data.message || (twoFaTarget ? '2FA enabled' : '2FA disabled'));
      closeTwoFaModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setTwoFaVerifying(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Choose an image file');
    if (file.size > 2 * 1024 * 1024) return toast.error('Photo must be under 2 MB');

    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    try {
      const { data } = await api.post('/user/avatar', formData);
      await refreshUser();
      toast.success(data.message || 'Profile photo updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatarPhoto = async () => {
    setAvatarUploading(true);
    try {
      const { data } = await api.delete('/user/avatar');
      await refreshUser();
      toast.success(data.message || 'Profile photo removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const addBank = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/user/bank-accounts', bank);
      toast.success(data.message || 'Bank account added');
      closeBankModal();
      await loadAccountData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add bank account');
    } finally {
      setSaving(false);
    }
  };

  const openBankModal = () => {
    setBankStep('pick');
    setBankSearch('');
    setSelectedBank(null);
    setBank({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', isDefault: false });
    setBankOpen(true);
  };

  const closeBankModal = () => {
    setBankOpen(false);
    setBankStep('pick');
    setBankSearch('');
    setSelectedBank(null);
    setBank({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', isDefault: false });
  };

  const chooseBank = (item) => {
    setSelectedBank(item);
    setBank((current) => ({
      ...current,
      bankName: item.name,
      ifsc: current.ifsc?.startsWith(item.ifscPrefix) ? current.ifsc : item.ifscPrefix,
    }));
    setBankStep('details');
  };

  const filteredBanks = (() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return indianBanks;
    return indianBanks.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.ifscPrefix.toLowerCase().includes(q)
    );
  })();

  const popularBanks = indianBanks.filter((item) => item.popular);

  const removeBank = async (id) => {
    try {
      const { data } = await api.delete(`/user/bank-accounts/${id}`);
      setBanks((items) => items.filter((item) => item.id !== id));
      toast.success(data.message || 'Bank account removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove bank account');
    }
  };

  const initials =
    (user?.fullName || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const kycPending = !user?.kycStatus || user.kycStatus === 'pending' || user.kycStatus === 'unverified';

  return (
    <div className="mx-auto max-w-6xl fade-up">
      <PageHeader title="Profile & settings" subtitle="Manage your identity, security and payment preferences." />

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/80">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === value
                ? 'bg-[#0070ba] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#002970]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="relative overflow-hidden p-0">
            <div className="bg-[linear-gradient(145deg,#0070ba_0%,#003087_55%,#001c64_100%)] px-6 pb-8 pt-6 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                    className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-lg font-extrabold text-[#003087] shadow-sm"
                    title="Upload profile photo"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-[#001c64]/55 opacity-0 transition group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                    </span>
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={uploadAvatar}
                  />
                  {user?.avatarUrl ? (
                    <button
                      type="button"
                      disabled={avatarUploading}
                      onClick={removeAvatarPhoto}
                      className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 text-red-500 shadow ring-1 ring-slate-200 hover:bg-red-50"
                      title="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-extrabold tracking-tight">{user?.fullName}</h2>
                  <p className="mt-1 truncate text-sm text-white/75">{user?.upiId}</p>
                  <Badge className={`mt-2 border-0 ${statusColor(user?.kycStatus)}`}>
                    {user?.kycStatus || 'unverified'} KYC
                  </Badge>
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur hover:bg-white/25 disabled:opacity-60"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {avatarUploading ? 'Uploading…' : user?.avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0070ba]">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Wallet balance</p>
                    <p className="font-display text-lg font-extrabold text-[#111]">
                      {formatINR(user?.walletBalance ?? 0)}
                    </p>
                  </div>
                </div>
                <Link to="/app/add-money" className="text-xs font-bold text-[#0070ba] hover:underline">
                  Add money
                </Link>
              </div>

              <Link
                to="/app/kyc"
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-[#0070ba]/30 hover:bg-[#f8fbff]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#111]">
                      {kycPending ? 'Complete KYC' : 'KYC verified'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {kycPending ? 'Verify PAN & Aadhaar to unlock higher limits' : 'Identity checks are up to date'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mobile</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#111]">{user?.mobile || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Member since</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#111]">
                    {user?.createdAt ? formatDate(user.createdAt).split(',')[0] : '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0070ba]">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#111]">Personal details</h2>
                <p className="text-sm text-slate-500">Update the info linked to your India Pay Now account.</p>
              </div>
            </div>
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
              <Input
                label="Mobile number"
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              />
              <Input
                className="sm:col-span-2"
                label="Email address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                <Button loading={saving} type="submit">
                  Save changes
                </Button>
                <p className="text-xs text-slate-400">Changes apply to login and UPI profile.</p>
              </div>
            </form>
          </Card>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#111]">
              <KeyRound className="h-5 w-5 text-[#0070ba]" /> Change password
            </h2>
            <p className="mt-1 text-sm text-slate-500">Use a strong password you don’t reuse elsewhere.</p>
            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <Input
                label="Current password"
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
              />
              <Input
                label="New password"
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
              />
              <Button loading={saving} type="submit">
                Update password
              </Button>
            </form>
          </Card>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#111]">
              <ShieldCheck className="h-5 w-5 text-[#0070ba]" /> Two-factor authentication
            </h2>
            <p className="mt-2 text-sm text-slate-500">Require an OTP whenever you sign in.</p>
            <Toggle
              className="mt-5"
              label="Enable 2FA"
              hint="OTP verification required to turn on or off"
              checked={preferences.twoFaEnabled}
              onChange={(value) => openTwoFaModal(value)}
            />
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-lg font-extrabold text-[#111]">Active sessions</h2>
            <DataList
              loading={loading}
              items={sessions}
              empty="No active sessions"
              render={(item) => (
                <div key={item.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
                  <Laptop className="mt-0.5 h-5 w-5 text-[#0070ba]" />
                  <div>
                    <p className="text-sm font-semibold">{item.device || 'Web Browser'}</p>
                    <p className="text-xs text-slate-500">
                      {item.ip_address} • {formatDate(item.last_active || item.created_at)}
                    </p>
                  </div>
                </div>
              )}
            />
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-lg font-extrabold text-[#111]">Login history</h2>
            <DataList
              loading={loading}
              items={history}
              empty="No login history"
              render={(item) => (
                <div key={item.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#0070ba]" />
                  <div>
                    <p className="text-sm font-semibold">{item.location || 'India'}</p>
                    <p className="max-w-sm truncate text-xs text-slate-500">
                      {item.device} • {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {tab === 'banks' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#111]">Linked banks</h2>
              <p className="text-sm text-slate-500">Used for settlements and withdrawals.</p>
            </div>
            <Button onClick={openBankModal}>
              <Plus className="h-4 w-4" /> Add bank account
            </Button>
          </div>
          {loading ? (
            <Skeleton className="h-32" />
          ) : banks.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {banks.map((item) => {
                const meta = findBankByName(item.bank_name) || findBankByIfsc(item.ifsc);
                return (
                  <Card key={item.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <BankLogo bank={meta || { name: item.bank_name, shortName: item.bank_name, color: '#0070ba' }} />
                      <div className="flex-1">
                        <h3 className="font-display font-bold">{item.bank_name}</h3>
                        <p className="text-sm text-slate-500">{item.account_number}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.account_holder} • {item.ifsc}
                        </p>
                        {item.is_default ? (
                          <Badge className="mt-2 border-brand-200 bg-brand-50 text-brand-700">Default</Badge>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBank(item.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        title="Remove account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="flex flex-col items-center py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Building2 className="h-7 w-7" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#111]">No bank accounts linked yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add an account with IFSC to withdraw or settle funds faster.
              </p>
              <Button className="mt-5" onClick={openBankModal}>
                <Plus className="h-4 w-4" /> Add bank account
              </Button>
            </Card>
          )}
        </div>
      )}

      {tab === 'preferences' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#111]">
              <Bell className="h-5 w-5 text-[#0070ba]" /> Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">Choose how India Pay Now keeps you informed.</p>
            <div className="mt-5 divide-y divide-slate-100">
              <Toggle
                label="Email notifications"
                hint="Statements, offers and account updates"
                checked={preferences.emailNotifications}
                onChange={(value) => updatePreference('emailNotifications', value)}
              />
              <Toggle
                label="SMS notifications"
                hint="Important security and service messages"
                checked={preferences.smsNotifications}
                onChange={(value) => updatePreference('smsNotifications', value)}
              />
              <Toggle
                label="Payment notifications"
                hint="Instant updates for payments and refunds"
                checked={preferences.paymentNotifications}
                onChange={(value) => updatePreference('paymentNotifications', value)}
              />
            </div>
          </Card>
          <Card className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0070ba]/10 blur-2xl" />
            <h2 className="relative font-display text-lg font-extrabold text-[#111]">Stay in control</h2>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-500">
              You can change these anytime. Critical security alerts are always sent even if marketing SMS is off.
            </p>
            <ul className="relative mt-5 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00baf2]" /> Login & OTP alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00baf2]" /> Payment confirmations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00baf2]" /> KYC & limit updates
              </li>
            </ul>
          </Card>
        </div>
      )}

      <Modal
        open={bankOpen}
        onClose={closeBankModal}
        wide
        title={bankStep === 'pick' ? 'Select your bank' : 'Add bank account'}
      >
        {bankStep === 'pick' ? (
          <div className="space-y-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search bank name or IFSC prefix"
                className="input-field w-full !rounded-2xl !border-slate-200 !py-3 !pl-11"
              />
            </div>

            {!bankSearch.trim() && (
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Popular banks</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {popularBanks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseBank(item)}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-3.5 text-center transition hover:border-[#0070ba]/35 hover:bg-[#f0f7ff]"
                    >
                      <BankLogo bank={item} size="md" />
                      <span className="line-clamp-1 text-[11px] font-bold leading-tight text-[#111]">
                        {item.shortName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {bankSearch.trim() ? `Results (${filteredBanks.length})` : `All banks (${indianBanks.length})`}
              </p>
              <div className="max-h-[min(48vh,400px)] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                {filteredBanks.length ? (
                  filteredBanks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseBank(item)}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-[#f0f7ff]"
                    >
                      <BankLogo bank={item} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#111]">{item.name}</p>
                        <p className="text-xs text-slate-500">IFSC · {item.ifscPrefix}XXXXXXX</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-slate-500">No banks match “{bankSearch}”</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={addBank} className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <BankLogo bank={selectedBank} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-extrabold text-[#111]">
                  {selectedBank?.name || bank.bankName}
                </p>
                <p className="text-xs text-slate-500">IFSC prefix {selectedBank?.ifscPrefix}</p>
              </div>
              <button
                type="button"
                onClick={() => setBankStep('pick')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0070ba] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change
              </button>
            </div>
            <Input
              label="Account holder name"
              required
              value={bank.accountHolder}
              onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
            />
            <Input
              label="Account number"
              required
              value={bank.accountNumber}
              onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
            />
            <Input
              label="IFSC code"
              required
              value={bank.ifsc}
              onChange={async (e) => {
                const ifsc = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                setBank((current) => ({ ...current, ifsc }));
                if (ifsc.length === 11) {
                  try {
                    const { data } = await api.get(`/kyc/ifsc/${ifsc}`);
                    const info = data.data;
                    const matched = findBankByIfsc(ifsc) || findBankByName(info.bank);
                    if (matched) setSelectedBank(matched);
                    setBank((current) => ({
                      ...current,
                      ifsc,
                      bankName: info.bank || matched?.name || current.bankName,
                    }));
                    toast.success(`${info.bank} · ${info.branch}`);
                  } catch {
                    /* user can still continue */
                  }
                }
              }}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bank.isDefault}
                onChange={(e) => setBank({ ...bank, isDefault: e.target.checked })}
              />{' '}
              Make this my default account
            </label>
            <Button loading={saving} type="submit" className="w-full">
              Add account
            </Button>
          </form>
        )}
      </Modal>

      <Modal
        open={twoFaOpen}
        onClose={closeTwoFaModal}
        title={twoFaTarget ? 'Enable two-factor authentication' : 'Disable two-factor authentication'}
      >
        <form onSubmit={verifyTwoFa} className="space-y-4">
          <p className="text-sm text-slate-500">
            {twoFaTarget
              ? 'We sent an OTP to your registered mobile. Verify to turn 2FA on.'
              : 'Confirm with OTP on your registered mobile to turn 2FA off.'}
          </p>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mobile number</p>
            <p className="mt-1 font-display text-lg font-extrabold text-[#111]">
              {twoFaMobile || user?.mobile || '—'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">From your India Pay Now account · not editable here</p>
          </div>
          <Input
            label="Enter OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={twoFaOtp}
            onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={twoFaSending || twoFaCooldown > 0}
              onClick={() => sendTwoFaOtp(twoFaTarget)}
              className="text-sm font-bold text-[#0070ba] disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {twoFaSending
                ? 'Sending…'
                : twoFaCooldown > 0
                  ? `Resend in ${twoFaCooldown}s`
                  : 'Resend OTP'}
            </button>
            <Button loading={twoFaVerifying} type="submit">
              {twoFaTarget ? 'Verify & enable 2FA' : 'Verify & disable 2FA'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-4 ${className}`}>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-[#0070ba]' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function DataList({ loading, items, empty, render }) {
  if (loading)
    return (
      <div className="mt-4 space-y-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>;
  return <div className="mt-3">{items.map(render)}</div>;
}
