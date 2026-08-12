import { useEffect, useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatINR } from '../../utils/format';
import { Card, EmptyState, PageHeader, Skeleton } from '../../components/ui';

export default function Customers() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/merchant/customers').then(({ data }) => setItems(data.data?.customers || data.customers || data.data || [])).catch(() => toast.error('Could not load customers')).finally(() => setLoading(false)); }, []);
  return <div><PageHeader title="Customers" subtitle="People who have paid your business" /><Card className="overflow-x-auto">{loading ? <Skeleton className="h-72" /> : items.length ? <table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="text-slate-500">{['Customer', 'Contact', 'Transactions', 'Total spent', 'Last payment'].map((h) => <th key={h} className="border-b border-slate-100 p-3 font-medium">{h}</th>)}</tr></thead><tbody>{items.map((c) => <tr key={c.id || c.email} className="border-b border-slate-50"><td className="p-3 font-semibold text-navy-900">{c.name || c.fullName}</td><td className="p-3"><div>{c.email || '—'}</div><div className="text-xs text-slate-500">{c.mobile || c.phone}</div></td><td className="p-3">{c.transactionCount ?? c.transactions ?? 0}</td><td className="p-3 font-semibold">{formatINR(c.totalSpent || c.totalAmount)}</td><td className="p-3">{c.lastPaymentAt || c.lastTransaction ? formatDate(c.lastPaymentAt || c.lastTransaction) : '—'}</td></tr>)}</tbody></table> : <EmptyState icon={UsersIcon} title="No customers yet" description="Customers appear after their first payment." />}</Card></div>;
}
