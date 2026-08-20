import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, QrCode, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandedQrCard } from '../../components/BrandedQrCard';
import { Button, Card, PageHeader, Skeleton } from '../../components/ui';
import api from '../../services/api';
import { copyText } from '../../utils/format';
import { downloadBrandedQr } from '../../utils/downloadBrandedQr';

export default function ReceiveMoney() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    api
      .get('/user/qr')
      .then(({ data }) => setQr(data.data))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load your QR code'))
      .finally(() => setLoading(false));
  }, []);

  const copyUpi = async () => {
    try {
      await copyText(qr.upiId);
      toast.success('UPI ID copied');
    } catch {
      toast.error('Could not copy UPI ID');
    }
  };

  const share = async () => {
    const shareData = {
      title: 'Pay me on India Pay Now',
      text: `Pay ${qr.name} using UPI ID ${qr.upiId}`,
      url: qr.payload,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await copyText(qr.payload);
        toast.success('Payment link copied');
      }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Could not share payment link');
    }
  };

  const download = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !qr) return toast.error('QR code is not ready');
    try {
      await downloadBrandedQr({
        qrSvg: svg,
        businessName: qr.name || 'India Pay Now',
        note: qr.upiId || 'Scan with any UPI app',
        typeLabel: 'Personal payment QR',
        fileName: 'india-pay-now-qr',
        format: 'png',
      });
      toast.success('Branded QR downloaded');
    } catch {
      toast.error('Could not download QR');
    }
  };

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="Receive money" subtitle="Let anyone scan or use your UPI ID to pay you." />
      <Card className="overflow-hidden p-0">
        <div className="p-6 text-center sm:p-8">
          {loading ? (
            <Skeleton className="mx-auto h-80 w-72" />
          ) : qr ? (
            <>
              <BrandedQrCard
                qrRef={qrRef}
                value={qr.payload}
                businessName={qr.name || 'India Pay Now'}
                note={qr.upiId || ''}
                typeLabel="Personal payment QR"
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button variant="secondary" onClick={copyUpi}>
                  <Copy className="h-4 w-4" /> Copy UPI
                </Button>
                <Button variant="secondary" onClick={share}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button onClick={download}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Check className="h-3.5 w-3.5 text-green-600" /> Verified India Pay Now account
              </p>
            </>
          ) : (
            <p className="py-16 text-sm text-slate-500">QR code unavailable.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
