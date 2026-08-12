import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';
import { Badge, Card, EmptyState, PageHeader, Skeleton } from '../../components/ui';

export default function Refunds() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/refunds').then(({ data }) => setItems(data.data?.refunds || data.refunds || data.data || [])).catch(() => toast.error('Could not load refunds')).finally(() => setLoading(false)); }, []);
  return <div><PageHeader title="Refunds" subtitle="Track customer refund requests and payouts" /><Card className="overflow-x-auto">{loading ? <Skeleton className="h-72" /> : items.length ? <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-slate-500">{['Refund ID', 'Transaction', 'Date', 'Customer', 'Amount', 'Reason', 'Status'].map((h) => <th key={h} className="border-b border-slate-100 p-3 font-medium">{h}</th>)}</tr></thead><tbody>{items.map((r) => <tr key={r.id} className="border-b border-slate-50"><td className="p-3 font-medium">{r.refundId || r.id}</td><td className="p-3">{r.transactionId || r.transaction?.id || '—'}</td><td className="p-3">{formatDate(r.createdAt || r.created_at)}</td><td className="p-3">{r.customerName || r.customer?.name || '—'}</td><td className="p-3 font-semibold">{formatINR(r.amount)}</td><td className="max-w-52 truncate p-3">{r.reason || '—'}</td><td className="p-3"><Badge className={statusColor(r.status)}>{r.status}</Badge></td></tr>)}</tbody></table> : <EmptyState icon={RotateCcw} title="No refunds" description="Refunds you issue will appear here." />}</Card></div>;
}
