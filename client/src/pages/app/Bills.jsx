import { serviceLabels } from '../../data/services';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ReceiptText, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader } from '../../components/ui';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import PnrStatus from './PnrStatus';

export default function Bills() {
  const { service } = useParams();

  if (service === 'pnr-status') {
    return <PnrStatus />;
  }

  return <BillPaymentForm service={service} />;
}

function BillPaymentForm({ service }) {
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [title, accountLabel] = serviceLabels[service] || ['Service Payment', 'Account / customer number'];

  const submit = async (event) => {
    event.preventDefault();
    if (!account.trim()) return toast.error(`Enter your ${accountLabel.toLowerCase()}`);
    if (!Number(amount) || Number(amount) < 1) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const { data } = await api.post('/services/pay', { service, amount: Number(amount), account });
      setResult(data.data);
      toast.success(data.message || 'Payment successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card className="mx-auto max-w-xl py-12 text-center fade-up">
        <span className="success-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-10 w-10" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">{title} paid</h1>
        <p className="mt-2 text-slate-500">
          {formatINR(amount)} paid successfully for {account}.
        </p>
        <p className="mt-1 text-xs text-slate-400">Transaction ID: {result.transactionId}</p>
        <Button
          className="mt-7"
          onClick={() => {
            setResult(null);
            setAccount('');
            setAmount('');
          }}
        >
          Make another payment
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title={title} subtitle="Pay securely from your India Pay Now wallet." />
      <Card className="p-6">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ReceiptText className="h-7 w-7" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label={accountLabel}
            placeholder={`Enter ${accountLabel.toLowerCase()}`}
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          />
          <Input
            label="Amount"
            type="number"
            min="1"
            placeholder="₹ 0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-700">
            <ShieldCheck className="h-4 w-4" /> Safe and secure payment from wallet
          </div>
          <Button loading={loading} type="submit" className="w-full">
            Pay {amount ? formatINR(amount) : 'now'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
