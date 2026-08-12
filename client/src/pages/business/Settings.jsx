import { useEffect, useState } from 'react';
import { Building2, ChevronRight, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Card, PageHeader, Skeleton } from '../../components/ui';

export default function Settings() {
  const [business, setBusiness] = useState(null);
  useEffect(() => { api.get('/merchant/profile').then(({ data }) => setBusiness(data.data || data)).catch(() => toast.error('Could not load business information')); }, []);
  return <div><PageHeader title="Settings" subtitle="Manage your merchant profile and business preferences" /><div className="grid gap-6 lg:grid-cols-2"><Card><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><Building2 /></div><div><h2 className="font-display font-bold">Business information</h2><p className="text-sm text-slate-500">Registered merchant details</p></div></div>{business ? <dl className="mt-5 space-y-4">{[['Business name', business.businessName || business.name], ['Merchant ID', business.merchantId || business.id], ['Email', business.email], ['Phone', business.mobile || business.phone], ['GSTIN', business.gstin || business.gstNumber], ['Address', business.address]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-slate-50 pb-3 text-sm"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-navy-900">{v || '—'}</dd></div>)}</dl> : <Skeleton className="mt-5 h-64" />}</Card><Card><h2 className="font-display font-bold">Account settings</h2><Link to="/app/profile" className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"><div className="flex items-center gap-3"><UserRound className="text-brand-600" /><div><p className="font-semibold">Profile settings</p><p className="text-sm text-slate-500">Personal details, password and security</p></div></div><ChevronRight className="h-5 w-5 text-slate-400" /></Link></Card></div></div>;
}
