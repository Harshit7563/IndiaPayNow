import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, QrCode, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Button, Card, PageHeader, Skeleton } from '../../components/ui';
import api from '../../services/api';
import { copyText } from '../../utils/format';

export default function ReceiveMoney() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    api.get('/user/qr')
      .then(({ data }) => setQr(data.data))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load your QR code'))
      .finally(() => setLoading(false));
  }, []);

  const copyUpi = async () => {
    try { await copyText(qr.upiId); toast.success('UPI ID copied'); }
    catch { toast.error('Could not copy UPI ID'); }
  };

  const share = async () => {
    const shareData = { title: 'Pay me on India Pay Now', text: `Pay ${qr.name} using UPI ID ${qr.upiId}`, url: qr.payload };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await copyText(qr.payload); toast.success('Payment link copied'); }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Could not share payment link');
    }
  };

  const download = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return toast.error('QR code is not ready');
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'india-pay-now-qr.svg'; link.click();
    URL.revokeObjectURL(url);
    toast.success('QR code downloaded');
  };

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="Receive money" subtitle="Let anyone scan or use your UPI ID to pay you." />
      <Card className="overflow-hidden p-0">
        <div className="gradient-card px-6 py-7 text-center text-white">
          <QrCode className="mx-auto h-7 w-7" />
          <p className="mt-2 font-display text-lg font-bold">Your personal payment QR</p>
          <p className="text-sm text-blue-100">Money goes directly to your wallet</p>
        </div>
        <div className="p-6 text-center sm:p-8">
          {loading ? <Skeleton className="mx-auto h-64 w-64" /> : qr ? (
            <>
              <div ref={qrRef} className="mx-auto w-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-lg">
                <QRCodeSVG value={qr.payload} size={220} level="H" fgColor="#0b1f3a" />
              </div>
              <p className="mt-5 font-display text-lg font-bold text-navy-900">{qr.name}</p>
              <button onClick={copyUpi} className="mx-auto mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                {qr.upiId} <Copy className="h-3.5 w-3.5" />
              </button>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button variant="secondary" onClick={copyUpi}><Copy className="h-4 w-4" /> Copy UPI</Button>
                <Button variant="secondary" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
                <Button onClick={download}><Download className="h-4 w-4" /> Download</Button>
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-green-600" /> Verified India Pay Now account</p>
            </>
          ) : <p className="py-16 text-sm text-slate-500">QR code unavailable.</p>}
        </div>
      </Card>
    </div>
  );
}
