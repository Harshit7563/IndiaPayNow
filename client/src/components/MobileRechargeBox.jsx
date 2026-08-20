import { useMemo, useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/format';
import { mobilePlans, operators, planCategories } from '../data/recharge';
import { ServiceTabsBar } from './ServiceTabsBar';

export function MobileRechargeBox({
  account,
  amount,
  operator,
  mode,
  loading,
  fieldErrors = {},
  showAvailable = false,
  onAccountChange,
  onAmountChange,
  onOperatorChange,
  onModeChange,
  onPay,
  detectOperator,
  siblingTabs = null,
  brandLabel = 'Recharge',
  onServiceChange,
  activeService = 'mobile',
}) {
  const [category, setCategory] = useState('Popular');

  const plans = useMemo(
    () => mobilePlans.filter((p) => category === 'Popular' || p.type === category),
    [category]
  );

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#0070ba]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#5ba3d9]/15 blur-3xl" />

      {siblingTabs?.length ? (
        <ServiceTabsBar
          tabs={siblingTabs}
          activeId={activeService}
          brand={brandLabel}
          onChange={onServiceChange}
        />
      ) : null}

      <div className="relative space-y-4 p-4 sm:p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          {[
            ['prepaid', 'Prepaid'],
            ['postpaid', 'Postpaid'],
          ].map(([id, label]) => (
            <label key={id} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <span
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition ${
                  mode === id ? 'border-[#0070ba] bg-[#0070ba]' : 'border-slate-300 bg-white'
                }`}
              >
                {mode === id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <input
                type="radio"
                name="recharge-mode"
                value={id}
                checked={mode === id}
                onChange={() => onModeChange?.(id)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-stretch lg:gap-4">
          <div className="grid gap-px overflow-hidden rounded-2xl bg-slate-200/70 ring-1 ring-slate-200 sm:grid-cols-3">
            <SearchField label="Mobile number" error={fieldErrors.account}>
              <input
                value={account}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onAccountChange?.(value);
                  if (detectOperator) onOperatorChange?.(detectOperator(value));
                }}
                placeholder="10-digit number"
                inputMode="numeric"
                className="mt-1 w-full bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none placeholder:font-semibold placeholder:text-slate-300 sm:text-[18px]"
              />
            </SearchField>

            <SearchField label="Operator" chevron error={fieldErrors.operator}>
              <select
                value={operator}
                onChange={(e) => onOperatorChange?.(e.target.value)}
                className="mt-1 w-full appearance-none bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none sm:text-[18px]"
              >
                {operators.map((op) => (
                  <option key={op}>{op}</option>
                ))}
              </select>
            </SearchField>

            <SearchField label="Amount" error={fieldErrors.amount}>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`font-display text-[17px] font-extrabold sm:text-[18px] ${
                    fieldErrors.amount ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => onAmountChange?.(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent font-display text-[17px] font-extrabold tracking-tight text-[#111] outline-none placeholder:text-slate-300 sm:text-[18px]"
                />
              </div>
            </SearchField>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="rounded-2xl bg-[#00baf2] px-8 py-4 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,186,242,0.35)] transition hover:bg-[#00a7d9] disabled:opacity-60 lg:min-w-[160px]"
          >
            {loading ? 'Processing…' : amount ? `Pay ${formatINR(amount)}` : 'Recharge'}
          </button>
        </div>

        {!showAvailable ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-slate-500">Popular now</span>
            {plans.slice(0, 4).map((plan) => (
              <button
                key={plan.price + plan.data}
                type="button"
                onClick={() => onAmountChange?.(String(plan.price))}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  String(amount) === String(plan.price)
                    ? 'border-[#0070ba] bg-[#eef5ff] text-[#0070ba]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#0070ba]/40 hover:bg-[#eef5ff] hover:text-[#0070ba]'
                }`}
              >
                {plan.data} · {formatINR(plan.price)}
              </button>
            ))}
          </div>
        ) : (
          <div id="popular-plans" className="space-y-4 border-t border-slate-100 pt-4 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#111]">Popular recharges</p>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> {operator}
                </span>
              </div>
              <p className="text-xs text-slate-500">{account || 'Select a plan below'}</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {planCategories.map((item) => {
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      active ? 'bg-[#0070ba] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => {
                const selected = String(amount) === String(plan.price);
                return (
                  <button
                    key={plan.price + plan.data}
                    type="button"
                    onClick={() => onAmountChange?.(String(plan.price))}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected
                        ? 'border-[#0070ba] bg-[#eef5ff] shadow-[0_0_0_1px_#0070ba]'
                        : 'border-slate-100 bg-slate-50/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-lg font-extrabold text-[#111]">{plan.data}</p>
                          {selected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0070ba] px-2 py-0.5 text-[10px] font-bold text-white">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{plan.validity}</p>
                      </div>
                      <span className="rounded-xl bg-[#00baf2] px-2.5 py-1.5 text-sm font-extrabold text-white">
                        {formatINR(plan.price)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">{plan.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchField({ label, chevron, error, children }) {
  return (
    <label
      className={`group relative flex min-h-[88px] cursor-text flex-col items-start justify-center px-4 py-3 text-left transition sm:px-5 ${
        error ? 'bg-red-50 ring-2 ring-inset ring-red-400' : 'bg-white hover:bg-slate-50/80'
      }`}
    >
      <span
        className={`flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
          error ? 'text-red-600' : 'text-slate-400'
        }`}
      >
        {label}
        {error ? <span className="normal-case tracking-normal">· required</span> : null}
        {chevron ? (
          <ChevronDown className={`ml-auto h-3.5 w-3.5 ${error ? 'text-red-400' : 'text-slate-400'}`} />
        ) : null}
      </span>
      {children}
      {error ? <span className="mt-1 text-[11px] font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}
