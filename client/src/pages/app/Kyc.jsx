import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, CircleAlert, Loader2 } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Verification failed';

export default function Kyc() {
  const { user, refreshUser } = useAuth();
  const isBusiness = user?.role === 'merchant';
  const [form, setForm] = useState({ pan: '', aadhaar: '', gstin: '', pinCode: '' });
  const [loading, setLoading] = useState(false);
  const [panInfo, setPanInfo] = useState(null);
  const [aadhaarInfo, setAadhaarInfo] = useState(null);
  const [gstinInfo, setGstinInfo] = useState(null);
  const [pinInfo, setPinInfo] = useState(null);
  const [pinStatus, setPinStatus] = useState('idle');
  const pinRequestRef = useRef(0);

  useEffect(() => {
    const pin = form.pinCode;
    if (pin.length < 6) {
      setPinStatus('idle');
      setPinInfo(null);
      return undefined;
    }
    const requestId = ++pinRequestRef.current;
    setPinStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/kyc/pincode/${pin}`);
        if (requestId !== pinRequestRef.current) return;
        setPinInfo(data.data);
        setPinStatus('success');
      } catch (error) {
        if (requestId !== pinRequestRef.current) return;
        setPinInfo(null);
        setPinStatus('error');
        toast.error(errorMessage(error));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.pinCode]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isBusiness && form.gstin) {
        await api.post('/kyc/gstin', { gstin: form.gstin });
      }
      const { data } = await api.post('/kyc', { pan: form.pan, aadhaar: form.aadhaar });
      await refreshUser();
      toast.success(data.message || 'KYC verified');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const checkPan = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/kyc/pan', {
        pan: form.pan,
        intent: isBusiness ? 'business' : 'personal',
      });
      setPanInfo(data.data);
      toast.success(data.message);
      if (data.data?.warning) toast(data.data.warning);
    } catch (error) {
      setPanInfo(null);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const checkAadhaar = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/kyc/aadhaar', { aadhaar: form.aadhaar });
      setAadhaarInfo(data.data);
      toast.success(data.message);
    } catch (error) {
      setAadhaarInfo(null);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const checkGstin = async () => {
    if (!form.gstin) return;
    setLoading(true);
    try {
      const { data } = await api.post('/kyc/gstin', { gstin: form.gstin });
      setGstinInfo(data.data);
      toast.success(data.message);
    } catch (error) {
      setGstinInfo(null);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader
        title={isBusiness ? 'Business KYC' : 'Aadhaar / PAN KYC'}
        subtitle={`Current status: ${user?.kycStatus || 'pending'}`}
      />
      <Card>
        <p className="text-sm leading-relaxed text-slate-500">
          Free government-format checks: India Post PIN, Income Tax PAN structure, GSTN checksum, and UIDAI
          Aadhaar checksum. Live UIDAI OTP needs a licensed AUA — we never use unofficial Aadhaar APIs.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <Input
              label="PIN code"
              value={form.pinCode}
              onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              placeholder="6-digit PIN"
              inputMode="numeric"
              maxLength={6}
            />
            {pinStatus === 'loading' ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0070ba]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Looking up India Post…
              </p>
            ) : null}
            {pinStatus === 'success' && pinInfo ? (
              <p className="mt-1.5 text-xs font-medium text-emerald-600">
                {pinInfo.postOffice} · {pinInfo.district}, {pinInfo.state}
              </p>
            ) : null}
            {pinStatus === 'error' ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <CircleAlert className="h-3.5 w-3.5" /> Invalid PIN
              </p>
            ) : null}
          </div>

          <Input
            label="PAN"
            value={form.pan}
            onChange={(e) => {
              setPanInfo(null);
              setForm({ ...form, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) });
            }}
              placeholder="ABCPE1234F"
            maxLength={10}
            autoCapitalize="characters"
          />
          {panInfo?.valid ? (
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> {panInfo.holderType} · {panInfo.pan}
            </p>
          ) : (
            <button type="button" onClick={checkPan} className="text-sm font-bold text-[#0070ba] hover:underline">
              Verify PAN format
            </button>
          )}

          <Input
            label="Aadhaar"
            value={form.aadhaar}
            onChange={(e) => {
              setAadhaarInfo(null);
              setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) });
            }}
            placeholder="12-digit Aadhaar"
            inputMode="numeric"
            maxLength={12}
          />
          {aadhaarInfo?.valid ? (
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Checksum valid · last 4 {aadhaarInfo.last4}
            </p>
          ) : (
            <button type="button" onClick={checkAadhaar} className="text-sm font-bold text-[#0070ba] hover:underline">
              Verify Aadhaar checksum
            </button>
          )}

          {isBusiness ? (
            <>
              <Input
                label="GSTIN (optional)"
                value={form.gstin}
                onChange={(e) => {
                  setGstinInfo(null);
                  setForm({
                    ...form,
                    gstin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15),
                  });
                }}
                placeholder="15-character GSTIN"
                maxLength={15}
                autoCapitalize="characters"
              />
              {gstinInfo?.valid && !gstinInfo.empty ? (
                <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> {gstinInfo.state} · PAN {gstinInfo.pan}
                </p>
              ) : (
                <button type="button" onClick={checkGstin} className="text-sm font-bold text-[#0070ba] hover:underline">
                  Verify GSTIN
                </button>
              )}
            </>
          ) : null}

          <Button loading={loading} type="submit" className="w-full">
            Submit KYC
          </Button>
        </form>
      </Card>
    </div>
  );
}
