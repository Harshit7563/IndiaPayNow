import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import { Card, EmptyState, PageHeader, Skeleton } from '../../components/ui';

export default function Reports() {
  const [data, setData] = useState({}), [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/reports').then(({ data: res }) => setData(res.data || res)).catch(() => toast.error('Could not load reports')).finally(() => setLoading(false)); }, []);
  const rows = data.daily || data.report || data.rows || (Array.isArray(data) ? data : []);
  return <div><PageHeader title="Reports" subtitle="Daily payment performance and collection trends" />{loading ? <Skeleton className="h-80" /> : <><Card><h2 className="font-display font-bold">Daily collection</h2><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => formatINR(v)} /><Bar dataKey="amount" fill="#1b6ef3" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card className="mt-6 overflow-x-auto">{rows.length ? <table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="text-slate-500">{['Date', 'Transactions', 'Successful', 'Failed', 'Gross collection', 'Fees', 'Net'].map((h) => <th key={h} className="border-b border-slate-100 p-3 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.date || i} className="border-b border-slate-50"><td className="p-3 font-medium">{r.date}</td><td className="p-3">{r.transactions ?? r.count ?? 0}</td><td className="p-3 text-green-700">{r.successful ?? 0}</td><td className="p-3 text-red-700">{r.failed ?? 0}</td><td className="p-3">{formatINR(r.amount || r.gross)}</td><td className="p-3">{formatINR(r.fees)}</td><td className="p-3 font-semibold">{formatINR(r.net ?? (Number(r.amount || r.gross || 0) - Number(r.fees || 0)))}</td></tr>)}</tbody></table> : <EmptyState icon={BarChart3} title="No report data" />}</Card></>}</div>;
}
