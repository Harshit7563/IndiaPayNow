import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, CreditCard, Send, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader, Textarea } from '../../components/ui';
import api from '../../services/api';
import { formatINR } from '../../utils/format';

const recipientTabs = [
  ['mobile', 'Mobile'],
  ['upi', 'UPI ID'],
  ['bank', 'Bank Account'],
  ['contact', 'Saved Contacts'],
];

export default function SendMoney() {
  const [step, setStep] = useState(0);
  const [recipientType, setRecipientType] = useState('mobile');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [otp, setOtp] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/user/contacts')
      .then(({ data }) => setContacts(data.data || []))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load saved contacts'));
  }, []);

  const fee = useMemo(() => Number(amount) > 10000 ? Number(amount) * 0.001 : 0, [amount]);
  const total = Number(amount || 0) + fee;

  const next = () => {
    if (step === 0 && !recipient.trim()) return toast.error('Select or enter a recipient');
    if (step === 1 && (!Number(amount) || Number(amount) < 1)) return toast.error('Enter a valid amount');
    setStep((current) => current + 1);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipient,
        recipientType: recipientType === 'contact' ? (recipient.includes('@') ? 'upi' : 'mobile') : recipientType,
        amount: Number(amount),
        note,
        paymentMethod,
        otp,
      });
      setResult(data.data);
      setStep(5);
      toast.success(data.message || 'Money sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setRecipient(''); setAmount(''); setNote(''); setOtp(''); setResult(null);
  };

  if (step === 5) return (
    <Card className="mx-auto max-w-xl py-12 text-center fade-up">
      <div className="success-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="h-10 w-10" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold text-navy-900">Payment successful</h1>
      <p className="mt-2 text-slate-500">{formatINR(result?.amount || amount)} sent to {recipient}</p>
      <p className="mt-1 text-xs text-slate-400">Transaction ID: {result?.transactionId}</p>
      <Button className="mt-7" onClick={reset}>Make another payment</Button>
    </Card>
  );

  return (
    <div className="mx-auto max-w-2xl fade-up">
      <PageHeader title="Send money" subtitle="Fast, secure transfers to anyone in India." />
      <div className="mb-5 flex items-center gap-2">
        {['Recipient', 'Amount', 'Method', 'Confirm', 'OTP'].map((label, index) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <span className={`h-1.5 rounded-full ${index <= step ? 'bg-brand-500' : 'bg-slate-200'}`} />
            <span className="hidden text-[10px] text-slate-500 sm:block">{label}</span>
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <>
            <h2 className="font-display text-xl font-bold">Who are you paying?</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {recipientTabs.map(([value, label]) => (
                <button key={value} onClick={() => { setRecipientType(value); setRecipient(''); }} className={`rounded-xl px-3 py-2 text-sm font-semibold ${recipientType === value ? 'bg-brand-500 text-white' : 'bg-slate-100 text-navy-800'}`}>{label}</button>
              ))}
            </div>
            <div className="mt-5">
              {recipientType === 'contact' ? (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <button key={contact.id} onClick={() => setRecipient(contact.upi_id || contact.mobile)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${recipient === (contact.upi_id || contact.mobile) ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{contact.name?.[0]}</span>
                      <span><b className="block text-sm">{contact.name}</b><small className="text-slate-500">{contact.upi_id || contact.mobile}</small></span>
                    </button>
                  ))}
                  {!contacts.length && <p className="py-6 text-center text-sm text-slate-500">No saved contacts found.</p>}
                </div>
              ) : (
                <Input
                  label={recipientType === 'mobile' ? 'Mobile number' : recipientType === 'upi' ? 'UPI ID' : 'Account number'}
                  placeholder={recipientType === 'mobile' ? '98765 43210' : recipientType === 'upi' ? 'name@bank' : 'Enter bank account number'}
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                />
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-xl font-bold">Enter amount</h2>
            <div className="relative mt-5">
              <span className="absolute left-4 top-3.5 text-xl font-bold">₹</span>
              <input className="input-field pl-10 text-2xl font-bold" type="number" min="1" max="100000" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus />
            </div>
            <Textarea className="mt-4" label="Note (optional)" placeholder="What is this for?" value={note} onChange={(event) => setNote(event.target.value)} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-xl font-bold">Choose payment method</h2>
            <div className="mt-5 space-y-3">
              {[
                ['wallet', 'India Pay Now Wallet', Wallet, 'Instant payment'],
                ['upi', 'UPI', Smartphone, 'Pay with any UPI app'],
                ['card', 'Debit / Credit Card', CreditCard, 'Visa, Mastercard or RuPay'],
              ].map(([value, label, Icon, hint]) => (
                <button key={value} onClick={() => setPaymentMethod(value)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${paymentMethod === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <Icon className="h-5 w-5 text-brand-600" />
                  <span className="flex-1"><b className="block text-sm">{label}</b><small className="text-slate-500">{hint}</small></span>
                  <span className={`h-4 w-4 rounded-full border-4 ${paymentMethod === value ? 'border-brand-500' : 'border-slate-300'}`} />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-xl font-bold">Confirm transfer</h2>
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <Row label="Recipient" value={recipient} />
              <Row label="Amount" value={formatINR(amount)} />
              <Row label="Transfer fee" value={fee ? formatINR(fee) : 'Free'} />
              <Row label="Payment method" value={paymentMethod.toUpperCase()} />
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
          </>
        )}

        {step === 4 && (
          <form onSubmit={submit}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><ShieldCheck /></div>
            <h2 className="mt-4 text-center font-display text-xl font-bold">Verify your payment</h2>
            <p className="mt-1 text-center text-sm text-slate-500">Enter the OTP sent to your registered mobile. Demo OTP: 123456</p>
            <Input className="mx-auto mt-5 max-w-xs" inputMode="numeric" maxLength="6" placeholder="• • • • • •" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} />
            <Button loading={loading} type="submit" className="mt-5 w-full">Pay {formatINR(total)}</Button>
          </form>
        )}

        {step < 4 && (
          <div className="mt-7 flex justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ChevronLeft className="h-4 w-4" /> Back</Button>
            <Button onClick={next}>{step === 3 ? 'Confirm & get OTP' : 'Continue'} <Send className="h-4 w-4" /></Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="mb-3 flex justify-between gap-4 text-sm"><span className="text-slate-500">{label}</span><span className="break-all text-right font-semibold text-navy-900">{value}</span></div>;
}
