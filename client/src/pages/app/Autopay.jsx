import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, EmptyState, Input, PageHeader, Select, Badge } from '../../components/ui';
import api from '../../services/api';
import { formatINR, statusColor } from '../../utils/format';
import { RefreshCw } from 'lucide-react';

export default function Autopay() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ biller: '', amount: '', frequency: 'monthly' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/mandates').then(({ data }) => setList(data.data || [])).catch(() => toast.error('Could not load mandates'));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/mandates', { ...form, amount: Number(form.amount) });
      toast.success('Autopay mandate created');
      setForm({ biller: '', amount: '', frequency: 'monthly' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl fade-up">
      <PageHeader title="Autopay Mandates" subtitle="Set up automatic bill payments." />
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Biller / merchant" value={form.biller} onChange={(e) => setForm({ ...form, biller: e.target.value })} placeholder="e.g. BESCOM, Netflix" />
          <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <Button loading={loading} type="submit" className="w-full">Create mandate</Button>
        </form>
      </Card>
      <Card className="p-0">
        {list.length ? list.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0">
            <div>
              <p className="font-bold text-[#001c64]">{m.biller}</p>
              <p className="text-xs text-slate-500">{m.frequency} · Next {m.next_debit || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-bold">{formatINR(m.amount)}</p>
              <Badge className={statusColor(m.status)}>{m.status}</Badge>
              {m.status === 'active' && (
                <button className="text-xs font-bold text-red-600" onClick={async () => { await api.delete(`/mandates/${m.id}`); load(); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )) : <EmptyState icon={RefreshCw} title="No mandates yet" />}
      </Card>
    </div>
  );
}
