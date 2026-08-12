import { useRef, useState } from 'react';
import { Camera, Check, ImageUp, QrCode, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader } from '../../components/ui';
import api from '../../services/api';
import { formatINR } from '../../utils/format';

export default function ScanPay() {
  const [stage, setStage] = useState('scan');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const fileRef = useRef(null);

  const continueToPay = () => {
    if (!upiId.trim() || !upiId.includes('@')) return toast.error('Enter a valid UPI ID');
    setStage('confirm');
  };

  const upload = (event) => {
    if (!event.target.files?.[0]) return;
    setUpiId('merchant@indpaynow');
    toast.success('QR detected. Please verify the UPI ID.');
  };

  const pay = async () => {
    if (!Number(amount) || Number(amount) < 1) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipient: upiId, recipientType: 'upi', amount: Number(amount),
        note: 'Scan & Pay', paymentMethod: 'wallet', otp: '123456',
      });
      setTransactionId(data.data?.transactionId);
      setStage('success');
      toast.success(data.message || 'Payment successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  if (stage === 'success') return (
    <Card className="mx-auto max-w-xl py-12 text-center fade-up">
      <span className="success-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-10 w-10" /></span>
      <h1 className="mt-5 font-display text-2xl font-bold">Payment complete</h1>
      <p className="mt-2 text-slate-500">{formatINR(amount)} paid to {upiId}</p>
      <p className="mt-1 text-xs text-slate-400">{transactionId}</p>
      <Button className="mt-7" onClick={() => { setStage('scan'); setUpiId(''); setAmount(''); }}>Scan another QR</Button>
    </Card>
  );

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="Scan & Pay" subtitle="Scan any UPI QR and pay securely." />
      <Card className="p-6">
        {stage === 'scan' ? (
          <>
            <div className="relative flex aspect-square max-h-96 items-center justify-center overflow-hidden rounded-3xl bg-navy-900 text-white">
              <div className="absolute inset-8 rounded-3xl border-2 border-white/60">
                <i className="absolute -left-1 -top-1 h-10 w-10 border-l-4 border-t-4 border-brand-400" />
                <i className="absolute -right-1 -top-1 h-10 w-10 border-r-4 border-t-4 border-brand-400" />
                <i className="absolute -bottom-1 -left-1 h-10 w-10 border-b-4 border-l-4 border-brand-400" />
                <i className="absolute -bottom-1 -right-1 h-10 w-10 border-b-4 border-r-4 border-brand-400" />
              </div>
              <div className="text-center text-white/70"><Camera className="mx-auto h-12 w-12" /><p className="mt-3 text-sm">Position QR code inside the frame</p></div>
              <span className="absolute left-10 right-10 top-1/2 h-0.5 bg-brand-400 shadow-[0_0_15px_#60a5fa]" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            <Button variant="secondary" className="mt-4 w-full" onClick={() => fileRef.current?.click()}><ImageUp className="h-4 w-4" /> Upload QR image</Button>
            <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
            <Input label="Enter UPI ID manually" placeholder="merchant@bank" value={upiId} onChange={(event) => setUpiId(event.target.value)} />
            <Button className="mt-4 w-full" onClick={continueToPay}><ScanLine className="h-4 w-4" /> Continue</Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><QrCode /></span>
              <p className="mt-3 text-sm text-slate-500">Paying to</p>
              <h2 className="font-display text-xl font-bold">{upiId}</h2>
            </div>
            <div className="relative mt-6"><span className="absolute left-4 top-3.5 text-xl font-bold">₹</span><input autoFocus type="number" min="1" className="input-field pl-10 text-2xl font-bold" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
            <Button loading={loading} className="mt-5 w-full" onClick={pay}>Pay {amount ? formatINR(amount) : 'now'}</Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setStage('scan')}>Cancel</Button>
          </>
        )}
      </Card>
    </div>
  );
}
