import { useEffect, useState } from 'react';
import { Building2, ChevronRight, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Card, PageHeader, Skeleton } from '../../components/ui';

export default function Settings() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/merchant/profile')
      .then(({ data }) => setBusiness(data.data || data))
      .catch(() => toast.error('Could not load business information'))
      .finally(() => setLoading(false));
  }, []);

  const rows = [
    ['Business name', business?.businessName || business?.name],
    ['Merchant ID', business?.merchantId || business?.id],
    ['Email', business?.email],
    ['Phone', business?.mobile || business?.phone],
    ['GSTIN', business?.gstin || business?.gstNumber],
    ['Settlement', business?.settlementCycle || 'T+1'],
    ['Bank', business?.address],
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your merchant profile and business preferences" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600">
              <Building2 />
            </div>
            <div>
              <h2 className="font-display font-bold">Business information</h2>
              <p className="text-sm text-slate-500">Registered merchant details</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="mt-5 h-64" />
          ) : business ? (
            <dl className="mt-5 space-y-4">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-50 pb-3 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-navy-900">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Business profile could not be loaded. Try again after refreshing.
            </p>
          )}
        </Card>
        <Card>
          <h2 className="font-display font-bold">Account settings</h2>
          <Link
            to="/app/profile"
            className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <UserRound className="text-brand-600" />
              <div>
                <p className="font-semibold">Profile settings</p>
                <p className="text-sm text-slate-500">Personal details, password and security</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </Link>
          <Link
            to="/business/kyc"
            className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <UserRound className="text-brand-600" />
              <div>
                <p className="font-semibold">Business KYC</p>
                <p className="text-sm text-slate-500">Free PAN, Aadhaar, GSTIN and PIN checks</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
