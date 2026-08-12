import { useEffect, useState } from 'react';
import { Building2, KeyRound, Laptop, MapPin, Plus, ShieldCheck, Trash2, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, Input, Modal, PageHeader, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatDate, statusColor } from '../../utils/format';

const tabs = [['profile', 'Profile'], ['security', 'Security'], ['banks', 'Bank Accounts'], ['preferences', 'Preferences']];

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
  const [bank, setBank] = useState({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', isDefault: false });
  const [preferences, setPreferences] = useState({ emailNotifications: true, smsNotifications: true, paymentNotifications: true, twoFaEnabled: false });

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

  useEffect(() => { loadAccountData(); }, []);

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/user/profile', profile);
      await refreshUser();
      toast.success(data.message || 'Profile updated');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (password.newPassword !== password.confirmPassword) return toast.error('New passwords do not match');
    setSaving(true);
    try {
      const { data } = await api.put('/user/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(data.message || 'Password changed');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not change password'); }
    finally { setSaving(false); }
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

  const addBank = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/user/bank-accounts', bank);
      toast.success(data.message || 'Bank account added');
      setBankOpen(false);
      setBank({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', isDefault: false });
      await loadAccountData();
    } catch (error) { toast.error(error.response?.data?.message || 'Could not add bank account'); }
    finally { setSaving(false); }
  };

  const removeBank = async (id) => {
    try {
      const { data } = await api.delete(`/user/bank-accounts/${id}`);
      setBanks((items) => items.filter((item) => item.id !== id));
      toast.success(data.message || 'Bank account removed');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not remove bank account'); }
  };

  return (
    <div className="fade-up">
      <PageHeader title="Profile & settings" subtitle="Manage your identity, security and payment preferences." />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === value ? 'bg-brand-500 text-white' : 'bg-white text-navy-800 shadow-sm'}`}>{label}</button>)}
      </div>

      {tab === 'profile' && (
        <Card className="max-w-2xl p-6">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><User className="h-8 w-8" /></span>
            <div><h2 className="font-display text-xl font-bold">{user?.fullName}</h2><p className="text-sm text-slate-500">{user?.upiId}</p><Badge className={`mt-1 ${statusColor(user?.kycStatus)}`}>{user?.kycStatus || 'unverified'} KYC</Badge></div>
          </div>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            <Input label="Mobile number" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
            <Input className="sm:col-span-2" label="Email address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <Button loading={saving} type="submit" className="sm:w-fit">Save changes</Button>
          </form>
        </Card>
      )}

      {tab === 'security' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><KeyRound className="h-5 w-5 text-brand-600" /> Change password</h2>
            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <Input label="Current password" type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} />
              <Input label="New password" type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />
              <Input label="Confirm new password" type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} />
              <Button loading={saving} type="submit">Update password</Button>
            </form>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><ShieldCheck className="h-5 w-5 text-brand-600" /> Two-factor authentication</h2>
            <p className="mt-2 text-sm text-slate-500">Require an OTP whenever you sign in.</p>
            <Toggle className="mt-5" label="Enable 2FA" checked={preferences.twoFaEnabled} onChange={(value) => updatePreference('twoFaEnabled', value)} />
          </Card>
          <Card>
            <h2 className="font-display text-lg font-bold">Active sessions</h2>
            <DataList loading={loading} items={sessions} empty="No active sessions" render={(item) => (
              <div key={item.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0"><Laptop className="mt-0.5 h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold">{item.device || 'Web Browser'}</p><p className="text-xs text-slate-500">{item.ip_address} • {formatDate(item.last_active || item.created_at)}</p></div></div>
            )} />
          </Card>
          <Card>
            <h2 className="font-display text-lg font-bold">Login history</h2>
            <DataList loading={loading} items={history} empty="No login history" render={(item) => (
              <div key={item.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0"><MapPin className="mt-0.5 h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold">{item.location || 'India'}</p><p className="max-w-sm truncate text-xs text-slate-500">{item.device} • {formatDate(item.created_at)}</p></div></div>
            )} />
          </Card>
        </div>
      )}

      {tab === 'banks' && (
        <div>
          <div className="mb-4 flex justify-end"><Button onClick={() => setBankOpen(true)}><Plus className="h-4 w-4" /> Add bank account</Button></div>
          {loading ? <Skeleton className="h-32" /> : banks.length ? <div className="grid gap-4 md:grid-cols-2">{banks.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Building2 /></span><div className="flex-1"><h3 className="font-display font-bold">{item.bank_name}</h3><p className="text-sm text-slate-500">{item.account_number}</p><p className="mt-1 text-xs text-slate-500">{item.account_holder} • {item.ifsc}</p>{item.is_default ? <Badge className="mt-2 border-brand-200 bg-brand-50 text-brand-700">Default</Badge> : null}</div><button onClick={() => removeBank(item.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Remove account"><Trash2 className="h-4 w-4" /></button></div>
            </Card>
          ))}</div> : <Card className="py-12 text-center text-sm text-slate-500">No bank accounts linked yet.</Card>}
        </div>
      )}

      {tab === 'preferences' && (
        <Card className="max-w-2xl">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Bell className="h-5 w-5 text-brand-600" /> Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Choose how India Pay Now keeps you informed.</p>
          <div className="mt-5 divide-y divide-slate-100">
            <Toggle label="Email notifications" hint="Statements, offers and account updates" checked={preferences.emailNotifications} onChange={(value) => updatePreference('emailNotifications', value)} />
            <Toggle label="SMS notifications" hint="Important security and service messages" checked={preferences.smsNotifications} onChange={(value) => updatePreference('smsNotifications', value)} />
            <Toggle label="Payment notifications" hint="Instant updates for payments and refunds" checked={preferences.paymentNotifications} onChange={(value) => updatePreference('paymentNotifications', value)} />
          </div>
        </Card>
      )}

      <Modal open={bankOpen} onClose={() => setBankOpen(false)} title="Add bank account">
        <form onSubmit={addBank} className="space-y-4">
          <Input label="Account holder name" required value={bank.accountHolder} onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })} />
          <Input label="Account number" required value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
          <Input label="IFSC code" required value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} />
          <Input label="Bank name" required value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bank.isDefault} onChange={(e) => setBank({ ...bank, isDefault: e.target.checked })} /> Make this my default account</label>
          <Button loading={saving} type="submit" className="w-full">Add account</Button>
        </form>
      </Modal>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, className = '' }) {
  return <div className={`flex items-center justify-between gap-4 py-4 ${className}`}><div><p className="text-sm font-semibold">{label}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} /></button></div>;
}

function DataList({ loading, items, empty, render }) {
  if (loading) return <div className="mt-4 space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>;
  if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>;
  return <div className="mt-3">{items.map(render)}</div>;
}
