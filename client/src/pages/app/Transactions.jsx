import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Card, EmptyState, Modal, PageHeader, Select, Skeleton } from '../../components/ui';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';

const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/transactions', { params: { status: status || undefined, q: search || undefined } })
        .then(({ data }) => setTransactions(data.data || []))
        .catch((error) => toast.error(error.response?.data?.message || 'Could not load transactions'))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [status, search]);

  const openTransaction = async (id) => {
    setDetail({ id }); setDetailLoading(true);
    try {
      const { data } = await api.get(`/transactions/${id}`);
      setDetail(data.data);
    } catch (error) {
      setDetail(null);
      toast.error(error.response?.data?.message || 'Could not load transaction details');
    } finally { setDetailLoading(false); }
  };

  return (
    <div className="fade-up">
      <PageHeader title="Transactions" subtitle="Search and review every wallet activity." />
      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input className="input-field pl-10" placeholder="Search ID or recipient" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {loading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-16" />)}</div> :
          transactions.length ? transactions.map((txn) => {
            const incoming = txn.type === 'add_money';
            return (
              <button key={txn.id} onClick={() => openTransaction(txn.id)} className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition last:border-0 hover:bg-slate-50">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${incoming ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                  {incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">{txn.note || txn.recipient || titleCase(txn.type)}</p>
                  <p className="text-xs text-slate-500">{formatDate(txn.created_at)} • {txn.payment_method?.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${incoming ? 'text-green-600' : 'text-navy-900'}`}>{incoming ? '+' : '-'}{formatINR(txn.amount)}</p>
                  <Badge className={statusColor(txn.status)}>{txn.status}</Badge>
                </div>
              </button>
            );
          }) : <EmptyState icon={ReceiptText} title="No matching transactions" description="Try changing your filters or search term." />}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Transaction details">
        {detailLoading ? <div className="space-y-3">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-10" />)}</div> : detail && (
          <div>
            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">{titleCase(detail.type)}</p>
              <p className="mt-1 font-display text-3xl font-bold">{formatINR(detail.amount)}</p>
              <Badge className={`mt-2 ${statusColor(detail.status)}`}>{detail.status}</Badge>
            </div>
            <div className="mt-5 space-y-3">
              <DetailRow label="Transaction ID" value={detail.id} />
              <DetailRow label="Recipient" value={detail.recipient || 'India Pay Now Wallet'} />
              <DetailRow label="Payment method" value={detail.payment_method?.toUpperCase()} />
              <DetailRow label="Fee" value={formatINR(detail.fee)} />
              <DetailRow label="Total" value={formatINR(detail.total_amount)} />
              <DetailRow label="Date" value={formatDate(detail.created_at)} />
              {detail.note && <DetailRow label="Note" value={detail.note} />}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return <div className="flex justify-between gap-5 border-b border-slate-100 pb-3 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="break-all text-right font-semibold text-navy-900">{value || '—'}</span></div>;
}
