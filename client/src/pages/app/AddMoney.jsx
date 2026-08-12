import { useState } from 'react';
import { Check, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, PageHeader } from '../../components/ui';
import api from '../../services/api';
import { formatINR } from '../../utils/format';

export default function AddMoney() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value < 1 || value > 100000) return toast.error('Enter an amount between ₹1 and ₹1,00,000');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/add-money', { amount: value, paymentMethod });
      setResult(data.data);
      toast.success(data.message || 'Money added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add money');
    } finally { setLoading(false); }
  };

  if (result) return (
    <Card className="mx-auto max-w-xl py-12 text-center fade-up">
      <span className="success-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-10 w-10" /></span>
      <h1 className="mt-5 font-display text-2xl font-bold">Money added</h1>
      <p className="mt-2 text-slate-500">{formatINR(amount)} was added to your wallet.</p>
      <p className="mt-1 text-sm font-semibold text-navy-900">New balance: {formatINR(result.balance)}</p>
      <Button className="mt-7" onClick={() => { setResult(null); setAmount(''); }}>Add more money</Button>
    </Card>
  );

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="Add money" subtitle="Top up your India Pay Now wallet instantly." />
      <Card className="p-6">
        <form onSubmit={submit}>
          <label className="text-sm font-medium text-navy-800">Amount</label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-3.5 text-xl font-bold">₹</span>
            <input className="input-field pl-10 text-2xl font-bold" type="number" min="1" max="100000" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[500, 1000, 2000, 5000].map((value) => <button type="button" key={value} onClick={() => setAmount(String(value))} className="rounded-xl bg-brand-50 py-2 text-xs font-semibold text-brand-700">+₹{value}</button>)}
          </div>

          <p className="mt-7 text-sm font-medium text-navy-800">Pay using</p>
          <div className="mt-2 space-y-2">
            {[
              ['upi', 'UPI', Smartphone, 'Any UPI app'],
              ['card', 'Debit / Credit Card', CreditCard, 'Visa, Mastercard or RuPay'],
              ['netbanking', 'Net banking', Landmark, 'All major Indian banks'],
            ].map(([value, label, Icon, hint]) => (
              <button type="button" key={value} onClick={() => setPaymentMethod(value)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${paymentMethod === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                <Icon className="h-5 w-5 text-brand-600" />
                <span className="flex-1"><b className="block text-sm">{label}</b><small className="text-slate-500">{hint}</small></span>
                <span className={`h-4 w-4 rounded-full border-4 ${paymentMethod === value ? 'border-brand-500' : 'border-slate-300'}`} />
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-700"><Wallet className="h-4 w-4" /> No convenience fee. Funds arrive instantly.</div>
          <Button loading={loading} type="submit" className="mt-5 w-full">Add {amount ? formatINR(amount) : 'money'}</Button>
        </form>
      </Card>
    </div>
  );
}
