import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatINR } from '../../utils/format';
import { TravelBookingBox } from '../../components/TravelBookingBox';
import { BillPayBox, billPayServices } from '../../components/BillPayBox';
import { MobileRechargeBox } from '../../components/MobileRechargeBox';
import {
  billFields,
  detectOperator,
  relatedServices,
  shortcutServices,
} from '../../data/recharge';

const travelServices = new Set(['flight', 'train', 'bus', 'hotel']);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const service = params.get('service') || 'mobile';
  const meta = billFields[service] || billFields.mobile;
  const isMobile = service === 'mobile';
  const isTravel = travelServices.has(service);
  const isBillPay = billPayServices.has(service);

  const [mode, setMode] = useState('prepaid');
  const [account, setAccount] = useState(user?.mobile || '');
  const [operator, setOperator] = useState(detectOperator(user?.mobile || ''));
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [travelResults, setTravelResults] = useState(null);

  useEffect(() => {
    setTravelResults(null);
    setAmount('');
    if (!isMobile && !isTravel) setAccount('');
    if (isMobile) setAccount(user?.mobile || '');
  }, [service, isMobile, isTravel, user?.mobile]);

  const pay = async () => {
    if (!account.trim()) return toast.error(`Enter ${meta.account.toLowerCase()}`);
    if (!Number(amount) || Number(amount) < 1) return toast.error('Select or enter an amount');
    setLoading(true);
    try {
      const slug = shortcutServices.find((s) => s.id === service)?.slug || service;
      const { data } = await api.post('/services/pay', { service: slug, amount: Number(amount), account });
      toast.success(data.message || 'Payment successful');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (isTravel) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-[#002970]">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Search, compare, and pay securely from your India Pay Now wallet.</p>
        </div>

        <TravelBookingBox
          initialMode={service}
          onModeChange={(next) => navigate(`/app?service=${next}`, { replace: true })}
          onSearch={(query) => {
            const route = query.isHotel
              ? 'Goa hotels'
              : `${query.from.name} → ${query.to.name}`;
            setTravelResults(query);
            toast.success(`Showing ${query.mode} for ${route}`);
          }}
        />

        {travelResults && (
          <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-[#002970]">Available options</h2>
              <span className="text-xs font-bold text-[#002970]">India Pay Now Travel</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Morning Express', time: '06:30 → 08:45', price: 3499, tag: 'Best price' },
                { name: 'Day Saver', time: '11:15 → 13:40', price: 4120, tag: 'Non-stop' },
                { name: 'Evening Flex', time: '18:05 → 20:20', price: 3899, tag: 'Refundable' },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-[#0070ba]/30 hover:bg-[#f8fbff]"
                >
                  <div>
                    <p className="text-sm font-bold text-[#002970]">{row.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {travelResults.isHotel
                        ? `${travelResults.travellers} guest · Check-in ${travelResults.depart}`
                        : `${travelResults.from.code} → ${travelResults.to.code} · ${row.time}`}
                    </p>
                    <span className="mt-1 inline-block text-[11px] font-semibold text-[#0070ba]">{row.tag}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { data } = await api.post('/services/pay', {
                          service: service === 'hotel' ? 'hotel' : service,
                          amount: row.price,
                          account: travelResults.isHotel
                            ? 'Goa stay'
                            : `${travelResults.from.code}-${travelResults.to.code}`,
                        });
                        toast.success(data.message || 'Booking paid from wallet');
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Booking failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="rounded-lg bg-[#00baf2] px-4 py-2 text-sm font-bold text-white hover:bg-[#00a7d9] disabled:opacity-60"
                  >
                    {formatINR(row.price)}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-slate-400">Demo inventory for prototype. Live partner API can plug in later.</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-bold text-[#002970]">Related Services</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(relatedServices[service] || relatedServices.flight).map(([id, label]) => (
              <Link
                key={id}
                to={`/app?service=${id}`}
                className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#002970] shadow-sm transition hover:bg-sky-50 hover:text-[#00baf2]"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isBillPay) {
    return (
      <div className="mx-auto max-w-7xl">
        <BillPayBox
          service={service}
          account={account}
          amount={amount}
          loading={loading}
          onAccountChange={setAccount}
          onAmountChange={setAmount}
          onPay={pay}
        />

        <section className="mt-8">
          <h2 className="text-sm font-bold text-[#002970]">Related Services</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(relatedServices[service] || relatedServices.broadband).map(([id, label]) => (
              <Link
                key={id}
                to={`/app?service=${id}`}
                className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#002970] shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:text-[#00baf2]"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="mx-auto max-w-7xl">
        <MobileRechargeBox
          account={account}
          amount={amount}
          operator={operator}
          mode={mode}
          loading={loading}
          detectOperator={detectOperator}
          onAccountChange={setAccount}
          onAmountChange={setAmount}
          onOperatorChange={setOperator}
          onModeChange={setMode}
          onPay={pay}
        />

        <section className="mt-8">
          <h2 className="text-sm font-bold text-[#002970]">Related Services</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(relatedServices.mobile).map(([id, label]) => (
              <Link
                key={id}
                to={`/app?service=${id}`}
                className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#002970] shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:text-[#00baf2]"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <BillPayBox
        service={service}
        account={account}
        amount={amount}
        loading={loading}
        onAccountChange={setAccount}
        onAmountChange={setAmount}
        onPay={pay}
      />
      <section className="mt-8">
        <h2 className="text-sm font-bold text-[#002970]">Related Services</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(relatedServices[service] || relatedServices.mobile).map(([id, label]) => (
            <Link
              key={id}
              to={`/app?service=${id}`}
              className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#002970] shadow-sm transition hover:bg-sky-50 hover:text-[#00baf2]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
