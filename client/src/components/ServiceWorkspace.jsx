import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatINR } from '../utils/format';
import { TravelBookingBox } from './TravelBookingBox';
import { BillPayBox, billPayServices } from './BillPayBox';
import { MobileRechargeBox } from './MobileRechargeBox';
import { Button, Input } from './ui';
import { showAppToast, showPickPlanToast } from './RouteHintToast';
import {
  billFields,
  detectOperator,
  relatedServices,
  shortcutServices,
} from '../data/recharge';
import { getServiceGroup } from '../data/serviceGroups';
import { findCatalogService, serviceLabels } from '../data/services';

const travelServices = new Set(['flight', 'train', 'bus', 'hotel']);

function RelatedServices({ service, fallback = 'mobile', hrefFor }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-[#002970]">Related Services</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(relatedServices[service] || relatedServices[fallback]).map(([id, label]) => (
          <Link
            key={id}
            to={hrefFor(id)}
            className="rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#002970] shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:text-[#00baf2]"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-xl font-bold text-[#002970]">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export function ServiceWorkspace({ service, onServiceChange, hrefFor = (id) => `/app?service=${id}` }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const catalog = findCatalogService(service);
  const meta = billFields[service] || {
    title: catalog?.label || serviceLabels[service]?.[0] || 'Pay this service',
    account: catalog?.accountLabel || serviceLabels[service]?.[1] || 'Account / customer number',
    placeholder: catalog?.accountLabel || 'Enter details',
  };
  const group = getServiceGroup(service);
  const isMobile = service === 'mobile';
  const isTravel = travelServices.has(service);
  const isBillPay = billPayServices.has(service);

  const [mode, setMode] = useState('prepaid');
  const [account, setAccount] = useState(user?.mobile || '');
  const [operator, setOperator] = useState(detectOperator(user?.mobile || ''));
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [travelResults, setTravelResults] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPopular, setShowPopular] = useState(false);

  useEffect(() => {
    setTravelResults(null);
    setAmount('');
    setFieldErrors({});
    setShowPopular(false);
    if (!isMobile && !isTravel) setAccount('');
    if (isMobile) setAccount(user?.mobile || '');
  }, [service, isMobile, isTravel, user?.mobile]);

  const goService = (id) => onServiceChange?.(id);

  const requireWallet = () => {
    if (user) return true;
    const next = `${location.pathname}${location.search}`;
    toast.error('Log in to pay from your wallet');
    navigate(`/login?redirect=${encodeURIComponent(next)}`);
    return false;
  };

  const clearFieldError = (key) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const setAccountValue = (value) => {
    setAccount(value);
    clearFieldError('account');
  };

  const setAmountValue = (value) => {
    setAmount(value);
    clearFieldError('amount');
  };

  const setOperatorValue = (value) => {
    setOperator(value);
    clearFieldError('operator');
  };

  const pay = async () => {
    const nextErrors = {};

    if (isMobile) {
      if (!/^[6-9]\d{9}$/.test(String(account || '').trim())) {
        nextErrors.account = 'Enter a valid 10-digit mobile number';
      }
      if (!operator) nextErrors.operator = 'Select an operator';
    } else if (!String(account || '').trim()) {
      nextErrors.account = `Enter ${meta.account.toLowerCase()}`;
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      showAppToast({
        kind: 'error',
        title: 'Missing details',
        message: Object.values(nextErrors)[0],
      });
      return;
    }

    setShowPopular(true);

    if (!Number(amount) || Number(amount) < 1) {
      setFieldErrors({ amount: 'Select an option below' });
      showPickPlanToast({
        isMobile,
        onViewPlans: () => {
          document.getElementById('popular-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
      });
      return;
    }

    if (!requireWallet()) return;

    setFieldErrors({});
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

  const boxProps = {
    siblingTabs: group.tabs,
    brandLabel: group.brand,
    onServiceChange: goService,
  };

  const relatedFallback = isTravel ? 'flight' : isBillPay ? 'broadband' : 'mobile';

  if (isTravel) {
    return (
      <div>
        <SectionHeader title={meta.title} subtitle={group.subtitle} />
        <TravelBookingBox
          initialMode={service}
          onModeChange={goService}
          onSearch={(query) => {
            const route = query.isHotel ? 'Goa hotels' : `${query.from.name} → ${query.to.name}`;
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
                      if (!requireWallet()) return;
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
        <RelatedServices service={service} fallback={relatedFallback} hrefFor={hrefFor} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div>
        <SectionHeader title={meta.title} subtitle={group.subtitle} />
        <MobileRechargeBox
          account={account}
          amount={amount}
          operator={operator}
          mode={mode}
          loading={loading}
          fieldErrors={fieldErrors}
          showAvailable={showPopular}
          detectOperator={detectOperator}
          onAccountChange={setAccountValue}
          onAmountChange={setAmountValue}
          onOperatorChange={setOperatorValue}
          onModeChange={setMode}
          onPay={pay}
          activeService={service}
          {...boxProps}
        />
        <RelatedServices service={service} fallback={relatedFallback} hrefFor={hrefFor} />
      </div>
    );
  }

  if (isBillPay) {
    return (
      <div>
        <SectionHeader title={meta.title} subtitle={group.subtitle} />
        <BillPayBox
          service={service}
          account={account}
          amount={amount}
          loading={loading}
          fieldErrors={fieldErrors}
          showAvailable={showPopular}
          onAccountChange={setAccountValue}
          onAmountChange={setAmountValue}
          onPay={pay}
          {...boxProps}
        />
        <RelatedServices service={service} fallback={relatedFallback} hrefFor={hrefFor} />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title={meta.title} subtitle={group.subtitle} />
      <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 sm:p-6">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            pay();
          }}
        >
          <Input
            label={meta.account}
            placeholder={meta.placeholder}
            value={account}
            onChange={(event) => setAccountValue(event.target.value)}
          />
          {fieldErrors.account ? <p className="text-xs font-medium text-red-600">{fieldErrors.account}</p> : null}
          <Input
            label="Amount"
            type="number"
            min="1"
            placeholder="₹ 0"
            value={amount}
            onChange={(event) => setAmountValue(event.target.value)}
          />
          <Button loading={loading} type="submit" className="w-full rounded-full bg-[#00baf2] py-3.5 hover:bg-[#00a7d9]">
            Pay {amount ? formatINR(amount) : 'now'}
          </Button>
        </form>
      </div>
      <RelatedServices service={service} fallback={relatedFallback} hrefFor={hrefFor} />
    </div>
  );
}
