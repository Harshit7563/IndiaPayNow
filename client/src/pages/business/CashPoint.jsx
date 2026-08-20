import { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  Download,
  MapPin,
  Printer,
  QrCode,
  ScanLine,
  Share2,
  ShieldCheck,
  Store,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandedQrCard } from '../../components/BrandedQrCard';
import { Button, Card, Input, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { downloadBrandedQr, printBrandedQr } from '../../utils/downloadBrandedQr';
import { formatINR } from '../../utils/format';

const CASH_POINT_MAX = 5000;
const FOOTER = 'UPI · Cash Point · GPay · PhonePe · Paytm · BHIM';

const customerSteps = [
  {
    icon: Store,
    title: 'Visit a Store',
    text: 'Go to a local participating retailer or neighbourhood shop offering the service.',
  },
  {
    icon: Banknote,
    title: 'Request Cash',
    text: 'Tell the shopkeeper the exact cash amount you want to withdraw.',
  },
  {
    icon: QrCode,
    title: 'Scan QR Code',
    text: 'The shopkeeper generates a dynamic QR code on their partner app.',
  },
  {
    icon: ShieldCheck,
    title: 'Authorize Payment',
    text: 'Scan the QR with any UPI app and enter your UPI PIN.',
  },
  {
    icon: ScanLine,
    title: 'Collect Money',
    text: 'Once payment is confirmed, the shopkeeper hands over the cash.',
  },
];

const merchantSteps = [
  'Ask the customer how much cash they need (max ₹5,000).',
  'Enter that amount below and generate the Cash Point QR.',
  'Ask them to scan with GPay, PhonePe, Paytm, BHIM, or any UPI app.',
  'When the payment succeeds, hand them the same amount in cash.',
];

export default function CashPoint() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName || user?.fullName || 'Merchant');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    api
      .get('/merchant/profile')
      .then(({ data }) => {
        const business = data.data || data;
        if (business?.businessName || business?.name) {
          setBusinessName(business.businessName || business.name);
        }
      })
      .catch(() => {});
  }, []);

  const generate = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value < 1) {
      toast.error('Enter the cash amount the customer wants');
      return;
    }
    if (value > CASH_POINT_MAX) {
      toast.error(`UPI Cash Point max is ₹${CASH_POINT_MAX.toLocaleString('en-IN')} per transaction`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/merchant/qr', {
        type: 'cashpoint',
        amount: value,
        label: 'UPI Cash Point',
        description: 'UPI Cash Point',
      });
      const created = data.data || data;
      const payload = created.upi_payload || created.payload;
      if (!payload) {
        toast.error('QR created but payload missing');
        return;
      }
      setPreview({
        id: created.id,
        amount: created.amount ?? value,
        payload,
        type: 'cashpoint',
      });
      toast.success('Cash Point QR ready — ask customer to scan');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create Cash Point QR');
    } finally {
      setLoading(false);
    }
  };

  const brandedProps = {
    businessName,
    amountLabel: preview?.amount ? formatINR(preview.amount) : '',
    note: 'Customer scans → you hand over cash',
    typeLabel: 'UPI Cash Point',
    headline: 'UPI Cash Point',
    footerApps: FOOTER,
  };

  const download = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !preview) return toast.error('Generate a Cash Point QR first');
    try {
      await downloadBrandedQr({
        qrSvg: svg,
        ...brandedProps,
        headline: 'UPI CASH POINT',
        fileName: `india-pay-now-cashpoint-${preview.id || 'qr'}`,
        format: 'png',
      });
      toast.success('Cash Point QR downloaded');
    } catch {
      toast.error('Could not download QR');
    }
  };

  const printCard = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !preview) return toast.error('Generate a Cash Point QR first');
    try {
      printBrandedQr({
        qrSvg: svg,
        ...brandedProps,
        headline: 'UPI CASH POINT',
      });
    } catch {
      toast.error('Allow popups to print the QR card');
    }
  };

  const share = async () => {
    if (!preview?.payload) return;
    if (navigator.share) {
      await navigator.share({ title: 'UPI Cash Point', text: preview.payload });
      return;
    }
    await navigator.clipboard.writeText(preview.payload);
    toast.success('Cash Point payment data copied');
  };

  return (
    <div>
      <PageHeader
        title="UPI Cash Point"
        subtitle="Turn your shop into a neighbourhood cash point — customer pays on UPI, you hand over cash"
      />

      <Card className="mb-6 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-[#0070ba] to-[#003087] px-5 py-6 text-white sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">How it works for customers</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">Cash without an ATM</h2>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Customers visit your store, scan your dynamic QR with any UPI app, authorize with their PIN, and collect cash from you.
          </p>
        </div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
          {customerSteps.map((step, index) => (
            <div
              key={step.title}
              className="border-t border-slate-100 px-5 py-5 sm:border-t-0 sm:border-l sm:first:border-l-0"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0070ba]">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {index + 1}</p>
              <h3 className="mt-1 font-display text-base font-bold text-[#001c64]">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#ecfdf5] p-3 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#001c64]">Your action at the counter</h2>
              <p className="mt-1 text-sm text-slate-500">Generate a dynamic QR for the exact cash amount.</p>
            </div>
          </div>

          <ol className="mt-5 space-y-3">
            {merchantSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#001c64] text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <form onSubmit={generate} className="mt-6 space-y-4">
            <Input
              required
              min="1"
              max={String(CASH_POINT_MAX)}
              type="number"
              label={`Cash amount (₹) · max ${formatINR(CASH_POINT_MAX)}`}
              value={amount}
              placeholder="e.g. 2000"
              onChange={(event) => setAmount(event.target.value)}
            />
            <Button loading={loading} type="submit" className="w-full sm:w-auto">
              <QrCode className="h-4 w-4" /> Generate Cash Point QR
            </Button>
          </form>
        </Card>

        <Card className="text-center">
          {preview?.payload ? (
            <div>
              <BrandedQrCard qrRef={qrRef} value={preview.payload} {...brandedProps} />
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" type="button" onClick={download}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button variant="secondary" type="button" onClick={printCard}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button type="button" onClick={share}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Wait for payment success on your dashboard, then hand over {formatINR(preview.amount)} in cash.
              </p>
            </div>
          ) : (
            <div className="py-16">
              <QrCode className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-display font-bold text-[#001c64]">No Cash Point QR yet</p>
              <p className="mt-1 text-sm text-slate-500">Enter the cash amount and generate a dynamic QR for the customer to scan.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
