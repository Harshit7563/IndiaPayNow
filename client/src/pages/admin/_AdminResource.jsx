import { useCallback, useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatINR, statusColor } from '../../utils/format';
import { Badge, Card, EmptyState, PageHeader, Skeleton } from '../../components/ui';

const read = (row, key) => key.split('.').reduce((value, part) => value?.[part], row);
const display = (value, type) => {
  if (value == null || value === '') return '—';
  if (type === 'money') return formatINR(value);
  if (type === 'date') return formatDate(value);
  return String(value);
};

export default function AdminResource({ title, subtitle, endpoint, keys, columns, renderActions }) {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); api.get(endpoint).then(({ data }) => { const body = data.data || data; setItems(keys.reduce((found, key) => found || body?.[key], null) || (Array.isArray(body) ? body : [])); }).catch(() => toast.error(`Could not load ${title.toLowerCase()}`)).finally(() => setLoading(false)); }, [endpoint, keys, title]);
  useEffect(() => { load(); }, [load]);
  return <div><PageHeader title={title} subtitle={subtitle} /><Card className="overflow-x-auto">{loading ? <Skeleton className="h-72" /> : items.length ? <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-slate-500">{columns.map((c) => <th key={c.label} className="border-b border-slate-100 p-3 font-medium">{c.label}</th>)}{renderActions && <th className="border-b border-slate-100 p-3 font-medium">Action</th>}</tr></thead><tbody>{items.map((row, index) => <tr key={row.id || index} className="border-b border-slate-50">{columns.map((c) => { const raw = c.keys ? c.keys.map((k) => read(row, k)).find((v) => v != null) : read(row, c.key); const normalized = typeof raw === 'boolean' ? (raw ? 'active' : 'disabled') : raw; return <td key={c.label} className={`p-3 ${c.type === 'money' ? 'font-semibold' : ''}`}>{c.type === 'status' ? <Badge className={statusColor(normalized)}>{normalized || 'unknown'}</Badge> : display(raw, c.type)}</td>; })}{renderActions && <td className="p-3">{renderActions(row, load)}</td>}</tr>)}</tbody></table> : <EmptyState icon={Database} title={`No ${title.toLowerCase()} found`} />}</Card></div>;
}
