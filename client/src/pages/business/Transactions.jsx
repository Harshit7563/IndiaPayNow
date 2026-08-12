import { useCallback, useEffect, useState } from 'react';
import { Eye, RefreshCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select, Skeleton, Textarea } from '../../components/ui';

export default function Transactions() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', paymentMethod: '', q: '' });
  const [selected, setSelected] = useState(null), [refund, setRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' }), [submitting, setSubmitting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/transactions', { params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }); setItems(data.data?.transactions || data.transactions || data.data || []); }
    catch { toast.error('Could not load transactions'); } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);
  const submitRefund = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post(`/payments/${refund.id}/refund`, { amount: Number(refundForm.amount), reason: refundForm.reason }); toast.success('Refund requested'); setRefund(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Refund failed'); } finally { setSubmitting(false); }
  };
  return <div>
    <PageHeader title="Transactions" subtitle="Search, inspect and manage all business payments" actions={<Button variant="secondary" onClick={load}><RefreshCcw className="h-4 w-4" /> Refresh</Button>} />
    <Card className="mb-5"><div className="grid gap-3 md:grid-cols-3"><Input aria-label="Search" placeholder="Search ID or customer..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /><Select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></Select><Select aria-label="Method" value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}><option value="">All methods</option><option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Net banking</option><option value="wallet">Wallet</option></Select></div></Card>
    <Card className="overflow-x-auto">{loading ? <Skeleton className="h-72" /> : items.length ? <table className="w-full min-w-[960px] text-left text-sm"><thead><tr className="text-slate-500">{['ID', 'Date', 'Customer', 'Amount', 'Method', 'Status', 'Settlement', 'Action'].map((h) => <th key={h} className="border-b border-slate-100 px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{items.map((tx) => <tr key={tx.id} className="border-b border-slate-50"><td className="px-3 py-3 font-medium">{tx.transactionId || tx.id}</td><td className="px-3 py-3">{formatDate(tx.createdAt || tx.created_at || tx.date)}</td><td className="px-3 py-3">{tx.customerName || tx.customer?.name || '—'}</td><td className="px-3 py-3 font-semibold">{formatINR(tx.amount)}</td><td className="px-3 py-3 uppercase">{tx.paymentMethod || tx.method || '—'}</td><td className="px-3 py-3"><Badge className={statusColor(tx.status)}>{tx.status}</Badge></td><td className="px-3 py-3"><Badge className={statusColor(tx.settlementStatus || 'pending')}>{tx.settlementStatus || 'pending'}</Badge></td><td className="px-3 py-3"><div className="flex gap-1"><Button variant="ghost" className="!px-2" onClick={() => setSelected(tx)}><Eye className="h-4 w-4" /></Button>{['success', 'completed', 'paid'].includes(tx.status) && <Button variant="soft" className="!px-3 !py-2 text-xs" onClick={() => { setRefund(tx); setRefundForm({ amount: tx.amount, reason: '' }); }}>Refund</Button>}</div></td></tr>)}</tbody></table> : <EmptyState icon={Search} title="No transactions found" description="Try changing your filters." />}</Card>
    <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction details"><div className="grid grid-cols-2 gap-4 text-sm">{selected && Object.entries({ ID: selected.transactionId || selected.id, Customer: selected.customerName || selected.customer?.name, Email: selected.customerEmail || selected.customer?.email, Amount: formatINR(selected.amount), Method: selected.paymentMethod || selected.method, Status: selected.status, Date: formatDate(selected.createdAt || selected.created_at) }).map(([k, v]) => <div key={k}><p className="text-slate-500">{k}</p><p className="mt-1 font-semibold text-navy-900">{v || '—'}</p></div>)}</div></Modal>
    <Modal open={!!refund} onClose={() => setRefund(null)} title="Issue refund"><form onSubmit={submitRefund} className="space-y-4"><Input required min="1" max={refund?.amount} step="0.01" type="number" label="Refund amount" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} /><Textarea required label="Reason" value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} /><Button loading={submitting} type="submit" variant="danger">Confirm refund</Button></form></Modal>
  </div>;
}
