import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, IndianRupee, Wallet, XCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';
import { Badge, Card, EmptyState, PageHeader, Skeleton, StatCard } from '../../components/ui';

const rows = (value, keys = []) => keys.reduce((found, key) => found || value?.[key], null) || value || [];

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/merchant/overview').then(({ data: res }) => setData(res.data || res)).catch(() => setError('Unable to load dashboard.'));
  }, []);
  if (!data && !error) return <><PageHeader title="Overview" subtitle="Your business at a glance" /><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div></>;
  if (error) return <Card><EmptyState icon={Activity} title={error} description="Please refresh and try again." /></Card>;

  const stats = data.stats || data;
  const chart = rows(data.revenueChart || data.revenue || data.dailyRevenue);
  const methods = rows(data.methodBreakdown || data.paymentMethods);
  const transactions = rows(data.recentTransactions || data.transactions);
  const statItems = [
    ['Total Transactions', stats.totalTransactions, Activity, 'blue'],
    ['Total Collection', formatINR(stats.totalCollection), IndianRupee, 'green'],
    ['Successful', stats.successfulTransactions ?? stats.successful, CheckCircle2, 'green'],
    ['Failed', stats.failedTransactions ?? stats.failed, XCircle, 'red'],
    ['Pending', stats.pendingTransactions ?? stats.pending, Clock, 'amber'],
    ['Available Settlement', formatINR(stats.availableSettlement), Wallet, 'blue'],
    ["Today's Collection", formatINR(stats.todayCollection), IndianRupee, 'green'],
  ];
  return (
    <div>
      <PageHeader title="Overview" subtitle="Monitor collections, payments and settlements" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map(([label, value, icon, tone]) => <StatCard key={label} label={label} value={value ?? 0} icon={icon} tone={tone} />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display font-bold text-navy-900">Revenue</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs><linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1b6ef3" stopOpacity={0.3} /><stop offset="95%" stopColor="#1b6ef3" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Area type="monotone" dataKey="amount" stroke="#1b6ef3" strokeWidth={2.5} fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="font-display font-bold text-navy-900">Payment methods</h2>
          <div className="mt-5 space-y-4">{methods.length ? methods.map((item, i) => {
            const total = methods.reduce((sum, m) => sum + Number(m.amount || m.value || 0), 0);
            const value = Number(item.amount || item.value || 0);
            return <div key={item.method || item.name || i}><div className="flex justify-between text-sm"><span className="font-medium text-navy-800">{item.method || item.name}</span><span>{formatINR(value)}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${total ? value / total * 100 : 0}%` }} /></div></div>;
          }) : <p className="text-sm text-slate-500">No method data yet.</p>}</div>
        </Card>
      </div>
      <Card className="mt-6 overflow-x-auto">
        <h2 className="mb-4 font-display font-bold text-navy-900">Recent transactions</h2>
        {transactions.length ? <table className="w-full min-w-[680px] text-left text-sm"><thead className="text-slate-500"><tr>{['ID', 'Date', 'Customer', 'Amount', 'Method', 'Status'].map((h) => <th key={h} className="border-b border-slate-100 px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{transactions.map((tx) => <tr key={tx.id} className="border-b border-slate-50"><td className="px-3 py-3 font-medium">{tx.transactionId || tx.id}</td><td className="px-3 py-3">{formatDate(tx.createdAt || tx.created_at || tx.date)}</td><td className="px-3 py-3">{tx.customerName || tx.customer?.name || '—'}</td><td className="px-3 py-3 font-semibold">{formatINR(tx.amount)}</td><td className="px-3 py-3 uppercase">{tx.paymentMethod || tx.method || '—'}</td><td className="px-3 py-3"><Badge className={statusColor(tx.status)}>{tx.status}</Badge></td></tr>)}</tbody></table> : <EmptyState title="No transactions yet" description="New payments will appear here." />}</Card>
    </div>
  );
}
