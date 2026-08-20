import { useEffect, useRef, useState } from 'react';
import { Download, Printer, QrCode, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import { Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui';

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
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ type: 'dynamic', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/merchant/qr');
      const payload = data.data || data;
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

  const create = async (event) => {
    event.preventDefault();
    if (form.type !== 'static' && (!Number(form.amount) || Number(form.amount) < 1)) {
      toast.error('Enter a valid amount for dynamic QR');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/merchant/qr', {
        type: form.type,
        amount: form.type === 'static' ? undefined : Number(form.amount),
        label: form.description || undefined,
        description: form.description || undefined,
      });
      const created = normalizeQr(data.data || data);
      if (!created?.payload) {
        toast.error('QR created but payload missing');
        await load();
        return;
      }
      setPreview(created);
      setItems((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      toast.success(form.type === 'dynamic' ? 'Dynamic QR ready' : 'QR code created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create QR');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !preview) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `india-pay-now-${preview.id || 'qr'}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
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

  const active = preview;

  return (
    <div>
      <PageHeader title="Merchant QR" subtitle="Create reusable or amount-specific payment QR codes" />
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
            </Select>
            {form.type !== 'static' ? (
              <Input
                required
                min="1"
                type="number"
                label="Amount (₹)"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            ) : null}
            <Textarea
              label="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Button loading={loading} type="submit">
              <QrCode className="h-4 w-4" /> Generate QR
            </Button>
          </form>
        </Card>

        <Card className="text-center">
          {active?.payload ? (
            <div ref={qrRef}>
              <div className="mx-auto inline-block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <QRCodeSVG value={active.payload} size={220} level="H" fgColor="#0b1f3a" includeMargin />
              </div>
              <h3 className="mt-4 font-bold capitalize">{active.type || 'Merchant'} QR</h3>
              {active.amount ? (
                <p className="mt-1 font-display text-2xl font-extrabold text-[#001c64]">{formatINR(active.amount)}</p>
              ) : null}
              <p className="mt-1 text-sm text-slate-500">{active.description || 'Scan with any UPI app'}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" type="button" onClick={download}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    window.print();
                    toast.success('Print dialog opened');
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
                <p className="text-sm font-bold capitalize text-[#001c64]">{item.type} QR</p>
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
