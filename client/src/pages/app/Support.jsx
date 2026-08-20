import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, EmptyState, Input, PageHeader, Textarea, Badge } from '../../components/ui';
import api from '../../services/api';
import { formatDate, statusColor } from '../../utils/format';
import { CONTACT_EMAIL } from '../../data/siteConfig';
import { Headphones } from 'lucide-react';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/support').then(({ data }) => setTickets(data.data || [])).catch(() => toast.error('Could not load tickets'));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/support', form);
      toast.success('Support ticket created');
      setForm({ subject: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl fade-up">
      <PageHeader title="Customer Support" subtitle="Disputes, chargebacks, fraud alerts and help." />
      <p className="mb-4 text-sm text-slate-600">
        Or email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#0070ba] hover:underline">
          {CONTACT_EMAIL}
        </a>
      </p>
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Payment failed / refund / fraud" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button loading={loading} type="submit" className="w-full">Raise ticket</Button>
        </form>
      </Card>
      <Card className="p-0">
        {tickets.length ? tickets.map((t) => (
          <div key={t.id} className="border-b border-slate-100 px-5 py-4 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-[#001c64]">{t.subject}</p>
              <Badge className={statusColor(t.status)}>{t.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{t.description}</p>
            <p className="mt-1 text-xs text-slate-400">{formatDate(t.created_at)}</p>
          </div>
        )) : <EmptyState icon={Headphones} title="No tickets yet" />}
      </Card>
    </div>
  );
}
