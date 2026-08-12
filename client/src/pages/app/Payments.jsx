import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { appModules } from '../../data/appModules';

const tones = [
  'bg-[#e8f4ff] text-[#0070ba]',
  'bg-[#ecfdf5] text-[#059669]',
  'bg-[#fff1e6] text-[#d97706]',
  'bg-[#eef2ff] text-[#4f46e5]',
  'bg-[#e0f2fe] text-[#0284c7]',
  'bg-[#fef9c3] text-[#ca8a04]',
  'bg-[#ffe4e6] text-[#e11d48]',
  'bg-[#f1f5f9] text-[#475569]',
];

const featured = [
  { label: 'Loan EMI', to: '/app?service=loan', hint: 'Pay before due' },
  { label: 'Insurance / LIC', to: '/app?service=insurance', hint: 'Keep cover active' },
  { label: 'Water Bill', to: '/app?service=water', hint: 'Utilities' },
  { label: 'Broadband', to: '/app?service=broadband', hint: 'Fiber & landline' },
];

export default function Payments() {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appModules
      .filter((group) => activeGroup === 'all' || group.id === activeGroup)
      .map((group) => ({
        ...group,
        items: group.items.filter(([label]) => !q || label.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, activeGroup]);

  return (
    <div className="fade-up mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 sm:p-7 md:rounded-[2rem]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0070ba]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#5ba3d9]/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0070ba]">
              <Sparkles className="h-3.5 w-3.5" /> All services
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#111]">More on India Pay Now</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Recharges, bills, travel, finance and everyday payments — search once, pay from your wallet.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[#0070ba] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
            />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className="group rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#0070ba]/30 hover:bg-white hover:shadow-md"
            >
              <p className="text-sm font-bold text-[#111] group-hover:text-[#0070ba]">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              <span className={`mt-3 inline-flex h-1.5 w-10 rounded-full ${tones[i].split(' ')[0]}`} />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
            activeGroup === 'all' ? 'bg-[#111] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {appModules.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActiveGroup(group.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
              activeGroup === group.id
                ? 'bg-[#111] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {group.title.replace(/^\d+\.\s*/, '')}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl bg-white py-16 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
          No services match “{query}”.
        </div>
      )}

      {filtered.map((group) => (
        <section key={group.id} className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold text-[#111]">{group.title}</h2>
            <span className="text-xs font-semibold text-slate-400">{group.items.length} services</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {group.items.map(([label, to, Icon], index) => (
              <Link
                key={label}
                to={to}
                className="group flex min-h-[118px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-white p-3 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-[#0070ba]/25"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[index % tones.length]} transition group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[12px] font-semibold leading-tight text-[#111]">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
