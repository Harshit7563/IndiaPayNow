import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Printer, QrCode, Share2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import { downloadBrandedQr, printBrandedQr } from '../../utils/downloadBrandedQr';
import { BrandedQrCard } from '../../components/BrandedQrCard';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui';

const BUSINESS_FOOTER = 'UPI · Cash Point · GPay · PhonePe · Paytm · BHIM';
const CASH_POINT_MAX = 5000;

const typeLabelFor = (type) => {
  if (type === 'cashpoint') return 'UPI Cash Point';
  if (type === 'amount') return 'Fixed amount QR';
  if (type === 'dynamic') return 'Dynamic QR';
  return 'Static QR';
};

const normalizeQr = (qr) => {
  if (!qr) return null;
  const payload = qr.upi_payload || qr.payload || qr.qrData || qr.value || qr.url || qr.upiUrl || '';
  return {
    ...qr,
    payload,
    type: qr.type || 'static',
    amount: qr.amount != null && qr.amount !== '' ? Number(qr.amount) : null,
    description: qr.description || qr.label || '',
  };
};

export default function MerchantQR() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'cashpoint' ? 'cashpoint' : 'dynamic';
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const [businessName, setBusinessName] = useState(user?.businessName || user?.fullName || 'Merchant');
  const [form, setForm] = useState({ type: initialType, amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('type') === 'cashpoint') {
      setForm((current) => ({ ...current, type: 'cashpoint' }));
    }
  }, [searchParams]);

  const load = async () => {
    try {
      const [{ data: qrData }, profile] = await Promise.all([
        api.get('/merchant/qr'),
        api.get('/merchant/profile').catch(() => null),
      ]);
      const business = profile?.data?.data || profile?.data;
      if (business?.businessName || business?.name) {
        setBusinessName(business.businessName || business.name);
      }
      const payload = qrData.data || qrData;
      const list = Array.isArray(payload?.codes)
        ? payload.codes
        : Array.isArray(payload?.qrCodes)
          ? payload.qrCodes
          : Array.isArray(payload)
            ? payload
            : [];
      const normalized = list.map(normalizeQr).filter((item) => item?.payload);
      setItems(normalized);
      setPreview((current) => current || normalized[0] || null);
    } catch {
      toast.error('Could not load QR codes');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const needsAmount = form.type !== 'static';
  const isCashPoint = form.type === 'cashpoint';

  const create = async (event) => {
    event.preventDefault();
    if (needsAmount && (!Number(form.amount) || Number(form.amount) < 1)) {
      toast.error(isCashPoint ? 'Enter cash amount for UPI Cash Point' : 'Enter a valid amount for dynamic QR');
      return;
    }
    if (isCashPoint && Number(form.amount) > CASH_POINT_MAX) {
      toast.error(`UPI Cash Point max is ₹${CASH_POINT_MAX} per transaction`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/merchant/qr', {
        type: form.type,
        amount: form.type === 'static' ? undefined : Number(form.amount),
        label: form.description || (isCashPoint ? 'UPI Cash Point' : undefined),
        description: form.description || (isCashPoint ? 'UPI Cash Point' : undefined),
      });
      const created = normalizeQr(data.data || data);
      if (!created?.payload) {
        toast.error('QR created but payload missing');
        await load();
        return;
      }
      setPreview(created);
      setItems((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      toast.success(isCashPoint ? 'UPI Cash Point QR ready' : form.type === 'dynamic' ? 'Dynamic QR ready' : 'QR code created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create QR');
    } finally {
      setLoading(false);
    }
  };

  const active = preview;
  const activeIsCashPoint = active?.type === 'cashpoint';
  const cardMeta = useMemo(
    () => ({
      headline: activeIsCashPoint ? 'UPI Cash Point' : 'Scan & Pay',
      typeLabel: typeLabelFor(active?.type),
      note: active?.description || (activeIsCashPoint ? 'Customer scans → you hand over cash' : ''),
      footerApps: BUSINESS_FOOTER,
    }),
    [active?.description, active?.type, activeIsCashPoint]
  );

  const download = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !preview) return toast.error('QR code is not ready');
    try {
      await downloadBrandedQr({
        qrSvg: svg,
        businessName,
        amountLabel: preview.amount ? formatINR(preview.amount) : '',
        note: cardMeta.note,
        typeLabel: cardMeta.typeLabel,
        headline: activeIsCashPoint ? 'UPI CASH POINT' : 'SCAN & PAY',
        footerApps: BUSINESS_FOOTER,
        fileName: `india-pay-now-${preview.id || 'qr'}`,
        format: 'png',
      });
      toast.success('Branded QR downloaded');
    } catch {
      toast.error('Could not download QR');
    }
  };

  const share = async () => {
    if (!preview?.payload) return;
    if (navigator.share) {
      await navigator.share({ title: 'India Pay Now QR', text: preview.payload });
      return;
    }
    await navigator.clipboard.writeText(preview.payload);
    toast.success('QR payment data copied');
  };

  return (
    <div>
      <PageHeader
        title="Merchant QR"
        subtitle="Payment QR, amount QR, and UPI Cash Point for counter cash-out"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display font-bold">Create QR</h2>
          <form onSubmit={create} className="space-y-4">
            <Select
              label="QR type"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="static">Static</option>
              <option value="dynamic">Dynamic</option>
              <option value="amount">Fixed amount</option>
              <option value="cashpoint">UPI Cash Point</option>
            </Select>
            {isCashPoint ? (
              <p className="rounded-xl bg-[#eef5ff] px-3 py-2 text-xs text-[#003087]">
                Customer scans this QR, pays via any UPI app, and you hand over cash. Max ₹{CASH_POINT_MAX.toLocaleString('en-IN')} per txn.
              </p>
            ) : null}
            {needsAmount ? (
              <Input
                required
                min="1"
                max={isCashPoint ? String(CASH_POINT_MAX) : undefined}
                type="number"
                label={isCashPoint ? 'Cash amount (₹)' : 'Amount (₹)'}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            ) : null}
            <Textarea
              label="Description"
              value={form.description}
              placeholder={isCashPoint ? 'UPI Cash Point' : ''}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Button loading={loading} type="submit">
              <QrCode className="h-4 w-4" /> {isCashPoint ? 'Generate Cash Point QR' : 'Generate QR'}
            </Button>
          </form>
        </Card>

        <Card className="text-center">
          {active?.payload ? (
            <div>
              <BrandedQrCard
                qrRef={qrRef}
                value={active.payload}
                businessName={businessName}
                amountLabel={active.amount ? formatINR(active.amount) : ''}
                note={cardMeta.note}
                typeLabel={cardMeta.typeLabel}
                headline={cardMeta.headline}
                footerApps={cardMeta.footerApps}
              />
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" type="button" onClick={download}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    const svg = qrRef.current?.querySelector('svg');
                    if (!svg || !preview) return toast.error('QR code is not ready');
                    try {
                      printBrandedQr({
                        qrSvg: svg,
                        businessName,
                        amountLabel: preview.amount ? formatINR(preview.amount) : '',
                        note: cardMeta.note,
                        typeLabel: cardMeta.typeLabel,
                        headline: activeIsCashPoint ? 'UPI CASH POINT' : 'SCAN & PAY',
                        footerApps: BUSINESS_FOOTER,
                      });
                    } catch {
                      toast.error('Allow popups to print the QR card');
                    }
                  }}
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button type="button" onClick={share}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-16">
              <QrCode className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">Create a QR code to preview it here.</p>
            </div>
          )}
        </Card>
      </div>

      {items.length > 1 ? (
        <Card className="mt-6">
          <h2 className="mb-4 font-display font-bold">Recent QR codes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreview(item)}
                className={`rounded-2xl border p-4 text-left transition hover:border-[#0070ba]/40 ${
                  active?.id === item.id ? 'border-[#0070ba] bg-[#f0f7ff]' : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-sm font-bold capitalize text-[#001c64]">{typeLabelFor(item.type)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.amount ? formatINR(item.amount) : 'Any amount'} · {item.description || 'No note'}
                </p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
