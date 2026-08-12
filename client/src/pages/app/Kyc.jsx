import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Kyc() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ pan: '', aadhaar: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/kyc', form);
      await refreshUser();
      toast.success(data.message || 'KYC submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="Aadhaar / PAN KYC" subtitle={`Current status: ${user?.kycStatus || 'pending'}`} />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Input label="PAN" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" maxLength={10} />
          <Input label="Aadhaar" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} placeholder="12-digit Aadhaar" />
          <Button loading={loading} type="submit" className="w-full">Submit KYC</Button>
        </form>
      </Card>
    </div>
  );
}
