import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CROSS_BORDER = [
  {
    flag: '🇦🇪',
    place: 'Dubai, UAE',
    party: 'Al Noor Trading LLC',
    type: 'Received',
    currency: 'AED',
    foreignAmount: 800,
    ref: 'TXN-AE-2041',
    when: 'Today · 10:24 AM',
    status: 'Completed',
  },
  {
    flag: '🇺🇸',
    place: 'United States',
    party: 'Nova Labs Inc.',
    type: 'Sent',
    currency: 'USD',
    foreignAmount: 150,
    ref: 'TXN-US-1988',
    when: 'Yesterday · 6:12 PM',
    status: 'Sent',
  },
  {
    flag: '🇬🇧',
    place: 'United Kingdom',
    party: 'Bright Design Studio',
    type: 'Received',
    currency: 'GBP',
    foreignAmount: 95,
    ref: 'TXN-GB-1872',
    when: '12 Aug · 2:05 PM',
    status: 'Completed',
  },
  {
    flag: '🇸🇬',
    place: 'Singapore',
    party: 'Pacific Soft Pte Ltd',
    type: 'Received',
    currency: 'SGD',
    foreignAmount: 100,
    ref: 'TXN-SG-1755',
    when: '11 Aug · 9:40 AM',
    status: 'Completed',
  },
];

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatRate = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

const formatStamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
};

export function CrossBorderActivity() {
  const [fx, setFx] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/fx/rates')
      .then((res) => {
        if (!cancelled) setFx(res.data.data);
      })
      .catch(() => {
        if (!cancelled) {
          setFx({
            live: false,
            rates: { USD: 83.5, AED: 22.75, GBP: 106.2, SGD: 62.4 },
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rates = fx?.rates;
  const stamp = useMemo(() => formatStamp(fx?.updatedAt), [fx?.updatedAt]);

  return (
    <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white text-left shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:rounded-[1.75rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f8fafc] px-5 py-4 sm:px-7">
        <div>
          <p className="text-sm font-bold text-[#111]">Recent cross-border activity</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {fx?.live ? 'Live FX · last 7 days' : 'FX rates · last 7 days'}
            {stamp ? ` · updated ${stamp} IST` : ''}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {fx?.live ? 'Live rates' : '4 settled'}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-5 py-3 sm:px-7">
        {['USD', 'AED', 'GBP', 'SGD'].map((code) => (
          <span
            key={code}
            className="shrink-0 rounded-full bg-[#eef5ff] px-3 py-1 text-[11px] font-semibold text-[#003087]"
          >
            1 {code} = {rates?.[code] ? formatRate(rates[code]) : '…'}
          </span>
        ))}
      </div>

      <div className="hidden grid-cols-[1.4fr_1.1fr_1fr_auto] gap-4 border-b border-slate-100 px-7 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid">
        <span>Country / counterparty</span>
        <span>Type · live FX</span>
        <span>Reference</span>
        <span className="text-right">Amount (INR)</span>
      </div>

      {CROSS_BORDER.map((row, idx, arr) => {
        const rate = rates?.[row.currency];
        const inr = rate ? row.foreignAmount * rate : null;
        const credit = row.type === 'Received';
        return (
          <div
            key={row.ref}
            className={`grid grid-cols-1 items-center gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1.1fr_1fr_auto] sm:gap-4 sm:px-7 sm:py-5 ${
              idx < arr.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-xl">
                {row.flag}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111]">{row.place}</p>
                <p className="truncate text-xs text-slate-500">{row.party}</p>
              </div>
            </div>

            <div className="min-w-0 pl-14 sm:pl-0">
              <p className="text-sm font-medium text-[#111]">
                {row.type} · {row.currency} {row.foreignAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500">
                {rate ? `1 ${row.currency} = ${formatRate(rate)}` : 'Fetching live rate…'}
                <span className="text-slate-400"> · {row.when}</span>
              </p>
            </div>

            <div className="min-w-0 pl-14 sm:pl-0">
              <p className="font-mono text-xs font-semibold text-slate-600">{row.ref}</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  credit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {row.status}
              </span>
            </div>

            <p
              className={`pl-14 text-base font-extrabold tracking-tight sm:pl-0 sm:text-right ${
                credit ? 'text-emerald-600' : 'text-[#111]'
              }`}
            >
              {inr == null ? '—' : `${credit ? '+' : '-'}${formatInr(inr)}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
