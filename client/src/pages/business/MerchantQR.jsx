import { useEffect, useRef, useState } from 'react';
import { Download, Printer, QrCode, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button, Card, Input, PageHeader, Select, Textarea } from '../../components/ui';

export default function MerchantQR() {
  const [items, setItems] = useState([]), [form, setForm] = useState({ type: 'static', amount: '', description: '' }), [loading, setLoading] = useState(false);
  const qrRef = useRef(null);
  const load = () => api.get('/merchant/qr').then(({ data }) => setItems(data.data?.qrCodes || data.qrCodes || data.data || (data.id ? [data] : []))).catch(() => toast.error('Could not load QR codes'));
  useEffect(() => { load(); }, []);
  const create = async (e) => { e.preventDefault(); setLoading(true); try { await api.post('/merchant/qr', { ...form, amount: form.amount ? Number(form.amount) : undefined }); toast.success('QR code created'); load(); } catch (err) { toast.error(err.response?.data?.message || 'Could not create QR'); } finally { setLoading(false); } };
  const valueFor = (qr) => qr.qrData || qr.value || qr.url || qr.upiUrl || '';
  const download = (qr) => { const svg = qrRef.current?.querySelector('svg'); if (!svg) return; const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `india-pay-now-${qr.id || 'qr'}.svg`; a.click(); URL.revokeObjectURL(a.href); };
  const share = async (qr) => { const value = valueFor(qr); if (navigator.share) await navigator.share({ title: 'India Pay Now QR', text: value }); else { await navigator.clipboard.writeText(value); toast.success('QR payment data copied'); } };
  const active = items[0];
  return <div><PageHeader title="Merchant QR" subtitle="Create reusable or amount-specific payment QR codes" /><div className="grid gap-6 lg:grid-cols-2">
    <Card><h2 className="mb-4 font-display font-bold">Create QR</h2><form onSubmit={create} className="space-y-4"><Select label="QR type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="static">Static</option><option value="dynamic">Dynamic</option><option value="amount">Fixed amount</option></Select>{form.type !== 'static' && <Input required min="1" type="number" label="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />}<Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><Button loading={loading} type="submit"><QrCode className="h-4 w-4" /> Generate QR</Button></form></Card>
    <Card className="text-center">{active ? <div ref={qrRef}><div className="mx-auto inline-block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><QRCodeSVG value={valueFor(active)} size={220} level="H" fgColor="#0b1f3a" /></div><h3 className="mt-4 font-bold">{active.name || `${active.type || 'Merchant'} QR`}</h3><p className="mt-1 text-sm text-slate-500">{active.description || 'Scan with any UPI app'}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="secondary" onClick={() => download(active)}><Download className="h-4 w-4" /> Download</Button><Button variant="secondary" onClick={() => { window.print(); toast.success('Print dialog opened'); }}><Printer className="h-4 w-4" /> Print</Button><Button onClick={() => share(active)}><Share2 className="h-4 w-4" /> Share</Button></div></div> : <div className="py-16"><QrCode className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-3 text-slate-500">Create a QR code to preview it here.</p></div>}</Card>
  </div></div>;
}
