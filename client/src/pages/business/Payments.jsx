import { useState } from 'react';
import { CreditCard, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui';

export default function Payments() {
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerMobile: '', amount: '', description: '', paymentMethod: 'upi' });
  const [loading, setLoading] = useState(false);
  const update = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create', { ...form, amount: Number(form.amount) });
      toast.success('Payment created');
      const url = data.data?.paymentUrl || data.paymentUrl;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      setForm({ customerName: '', customerEmail: '', customerMobile: '', amount: '', description: '', paymentMethod: 'upi' });
    } catch (err) { toast.error(err.response?.data?.message || 'Could not create payment'); }
    finally { setLoading(false); }
  };
  return (
    <div>
      <PageHeader title="Create payment" subtitle="Accept a secure payment from your customer" />
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CreditCard /></div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input required label="Customer name" name="customerName" value={form.customerName} onChange={update} />
          <Input required type="email" label="Email" name="customerEmail" value={form.customerEmail} onChange={update} />
          <Input required label="Mobile" name="customerMobile" value={form.customerMobile} onChange={update} />
          <Input required min="1" step="0.01" type="number" label="Amount (₹)" name="amount" value={form.amount} onChange={update} />
          <Select label="Preferred payment method" name="paymentMethod" value={form.paymentMethod} onChange={update}><option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Net banking</option><option value="wallet">Wallet</option></Select>
          <Textarea className="sm:col-span-2" label="Description" name="description" value={form.description} onChange={update} />
          <Button loading={loading} className="sm:col-span-2" type="submit"><Send className="h-4 w-4" /> Create payment</Button>
        </form>
      </Card>
    </div>
  );
}
