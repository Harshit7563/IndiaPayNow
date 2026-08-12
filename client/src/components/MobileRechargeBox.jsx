import { useMemo, useState } from 'react';
import { Check, ChevronDown, Smartphone, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/format';
import { mobilePlans, operators, planCategories, quickLinks } from '../data/recharge';

const operatorTone = {
  Jio: { accent: '#0b5cff', soft: '#e8f0ff' },
  Airtel: { accent: '#ed1c24', soft: '#ffe8e9' },
  Vi: { accent: '#ee2a7b', soft: '#ffe8f2' },
  BSNL: { accent: '#0070ba', soft: '#eef5ff' },
};

export function MobileRechargeBox({
  account,
  amount,
  operator,
  mode,
  loading,
  onAccountChange,
  onAmountChange,
  onOperatorChange,
  onModeChange,
  onPay,
  detectOperator,
}) {
  const [tab, setTab] = useState('plans');
  const [category, setCategory] = useState('Popular');
  const tone = operatorTone[operator] || operatorTone.Jio;

  const plans = useMemo(
    () => mobilePlans.filter((p) => category === 'Popular' || p.type === category),
    [category]
  );

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
      <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{ background: `radial-gradient(ellipse at top right, ${tone.soft}, transparent 55%)` }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ background: tone.accent }}
            >
              <Smartphone className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">India Pay Now Recharge</p>
              <h2 className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-[#111]">
                {operator} {mode === 'prepaid' ? 'Prepaid' : 'Postpaid'}
              </h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Pick a plan in seconds and pay securely from your wallet.
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{ background: tone.soft, color: tone.accent }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Instant recharge
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
            {['prepaid', 'postpaid'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onModeChange?.(item)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition ${
                  mode === item ? 'bg-white text-[#111] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Mobile number</label>
            <div className="relative mt-1.5">
              <input
                value={account}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onAccountChange?.(value);
                  if (detectOperator) onOperatorChange?.(detectOperator(value));
                }}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold tracking-wide text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              />
              {account && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => onAccountChange?.('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Operator</label>
            <div className="relative mt-1.5">
              <select
                value={operator}
                onChange={(e) => onOperatorChange?.(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm font-semibold text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              >
                {operators.map((op) => (
                  <option key={op}>{op}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {operators.map((op) => {
                const t = operatorTone[op];
                const active = operator === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => onOperatorChange?.(op)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      active ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={active ? { background: t.accent } : undefined}
                  >
                    {op}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Amount</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => onAmountChange?.(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-3 font-display text-lg font-extrabold text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,112,186,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: tone.accent }}
          >
            {loading ? 'Processing…' : amount ? `Proceed to Recharge · ${formatINR(amount)}` : 'Proceed to Recharge'}
          </button>

          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Instant activation
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Secure wallet pay
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex gap-4 text-sm font-semibold">
              {[
                ['plans', 'Browse plans'],
                ['recents', 'Recents'],
                ['promo', 'Offers'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`pb-2 transition ${
                    tab === id ? 'border-b-2 text-[#111]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  style={tab === id ? { borderColor: tone.accent, color: tone.accent } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400">{operator} · All Circles</span>
          </div>

          {tab === 'plans' && (
            <>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {planCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      category === item ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={category === item ? { background: tone.accent } : undefined}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const selected = String(amount) === String(plan.price);
                  return (
                    <button
                      key={plan.price + plan.data}
                      type="button"
                      onClick={() => onAmountChange?.(String(plan.price))}
                      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                        selected ? 'border-transparent shadow-md' : 'border-slate-100 bg-slate-50/70 hover:bg-white'
                      }`}
                      style={selected ? { background: tone.soft, boxShadow: `0 0 0 1.5px ${tone.accent}` } : undefined}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-lg font-extrabold text-[#111]">{plan.data}</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-500">{plan.validity}</p>
                        </div>
                        <span
                          className="rounded-xl px-2.5 py-1.5 text-sm font-extrabold text-white"
                          style={{ background: tone.accent }}
                        >
                          {formatINR(plan.price)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">{plan.desc}</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">{plan.circle}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[11px] text-slate-400">
                Demo plans for prototype. Please verify with your operator before paying.
              </p>
            </>
          )}

          {tab === 'recents' && (
            <p className="mt-10 text-center text-sm text-slate-500">Your recent recharges will appear here.</p>
          )}

          {tab === 'promo' && (
            <div className="mt-4 space-y-3">
              {[
                { title: 'First recharge cashback', text: 'Get ₹20 back on recharges above ₹199.' },
                { title: 'Autopay reminder', text: 'Never miss validity — set a wallet autopay.' },
              ].map((offer) => (
                <div key={offer.title} className="rounded-2xl border border-slate-100 px-4 py-3.5" style={{ background: tone.soft }}>
                  <p className="text-sm font-bold text-[#111]">{offer.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{offer.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-xs font-bold text-slate-500">{operator} quick links</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => {
                setTab('plans');
                setCategory(
                  link.includes('Data') ? 'Data Packs' : link.includes('OTT') ? 'OTT & Entertainment' : link.includes('Unlimited') ? 'Unlimited' : 'Popular'
                );
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
