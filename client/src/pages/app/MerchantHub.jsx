import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const tools = [
  ['Payment Links', '/business/payment-links'],
  ['Merchant QR', '/business/qr'],
  ['Settlements', '/business/settlements'],
  ['Refunds', '/business/refunds'],
  ['Reports', '/business/reports'],
  ['Developer APIs', '/business/developers'],
];

export default function MerchantHub() {
  const { user, refreshUser, login } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const payload = amount
    ? `upi://pay?pa=${user?.upiId}&pn=${encodeURIComponent(user?.fullName || 'India Pay Now')}&am=${amount}&cu=INR`
    : `upi://pay?pa=${user?.upiId}&pn=${encodeURIComponent(user?.fullName || 'India Pay Now')}&cu=INR`;

  const activate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/merchant/activate');
      if (data.data?.token) login(data.data.token, data.data.user);
      else await refreshUser();
      toast.success(data.message || 'Business tools enabled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not enable business tools');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl fade-up">
      <PageHeader
        title="Merchant Services"
        subtitle="Static/dynamic QR, payment links, gateway, soundbox, settlements, refunds, reports and split settlement."
      />
      <Card className="mb-6 text-center">
        <p className="text-sm text-slate-500">{amount ? 'Dynamic QR' : 'Static QR'}</p>
        <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-4">
          <QRCodeSVG value={payload} size={180} />
        </div>
        <p className="mt-3 font-bold text-[#001c64]">{user?.upiId}</p>
        <input
          className="input-field mx-auto mt-4 max-w-xs"
          placeholder="Amount for dynamic QR (optional)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Card>

      {user?.role === 'merchant' || user?.role === 'admin' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map(([label, to]) => (
            <Link key={label} to={to} className="card p-4 font-semibold text-[#001c64] hover:border-brand-200">
              {label} →
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">
            Enable business tools for payment links, gateway, soundbox, sub-merchant onboarding, split settlement and reports.
          </p>
          <Button loading={loading} className="mt-4" onClick={activate}>
            Enable merchant dashboard
          </Button>
        </Card>
      )}
    </div>
  );
}
