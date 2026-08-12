import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, EmptyState, PageHeader, Badge } from '../../components/ui';
import api from '../../services/api';
import { Gift } from 'lucide-react';

export default function Rewards() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/rewards').then(({ data }) => setItems(data.data || [])).catch(() => toast.error('Could not load rewards'));
  }, []);

  return (
    <div className="mx-auto max-w-2xl fade-up">
      <PageHeader title="Wallet & Rewards" subtitle="Gift cards, cashback, coupons, loyalty and offers." />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.length ? items.map((r) => (
          <Card key={r.id}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{r.type}</p>
            <p className="mt-1 font-display text-lg font-bold text-[#001c64]">{r.title}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand-600">{r.value}</p>
            <Badge className="mt-3 bg-green-50 text-green-700 border-green-200">{r.status}</Badge>
          </Card>
        )) : <EmptyState icon={Gift} title="No rewards yet" />}
      </div>
    </div>
  );
}
