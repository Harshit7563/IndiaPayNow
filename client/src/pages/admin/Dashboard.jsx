import { useEffect, useState } from 'react';
import { Activity, Building2, IndianRupee, Receipt, RotateCcw, ShieldCheck, Users, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import { PageHeader, Skeleton, StatCard } from '../../components/ui';

const pretty = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then(({ data }) => setStats((data.data || data).stats || data.data || data)).catch(() => toast.error('Could not load admin dashboard')); }, []);
  const iconFor = (key) => key.includes('merchant') ? Building2 : key.includes('user') ? Users : key.includes('refund') ? RotateCcw : key.includes('settlement') ? Wallet : key.includes('kyc') ? ShieldCheck : key.includes('transaction') ? Receipt : key.includes('amount') || key.includes('revenue') || key.includes('collection') ? IndianRupee : Activity;
  const isMoney = (key) => /amount|revenue|collection|volume|settlement/i.test(key);
  return <div><PageHeader title="Admin dashboard" subtitle="Platform health and operational overview" />{!stats ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(stats).filter(([, v]) => ['number', 'string'].includes(typeof v)).map(([key, value], i) => <StatCard key={key} label={pretty(key)} value={isMoney(key) ? formatINR(value) : value} icon={iconFor(key.toLowerCase())} tone={i % 4 === 1 ? 'green' : i % 4 === 2 ? 'amber' : 'blue'} />)}</div>}</div>;
}
