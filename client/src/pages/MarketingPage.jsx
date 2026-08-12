import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { marketingPages } from '../data/marketingPages';

export default function MarketingPage() {
  const { pathname } = useLocation();
  const page = marketingPages[pathname];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111111]">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 md:pb-10 md:pt-16">
        <p className="text-sm font-semibold text-[#5ba3d9]">{page.section}</p>
        <div className="mt-3 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{page.title}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.1rem]">
              {page.headline}
            </h1>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-slate-500 md:text-[15px]">{page.subtitle}</p>
            <Link
              to={page.cta.to}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition hover:bg-black"
            >
              {page.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {page.highlights.map(([value, label]) => (
            <div
              key={label}
              className="rounded-[1.25rem] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
            >
              <p className="font-display text-2xl font-extrabold tracking-tight text-[#111]">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {page.blocks.map((block, i) => (
            <div
              key={block.title}
              className={`rounded-[1.75rem] p-6 md:min-h-[220px] md:p-7 ${
                i === 0
                  ? 'bg-[#111] text-white'
                  : i === 1
                    ? 'bg-[#dcebff] text-slate-800'
                    : 'border border-slate-200 bg-white text-[#111]'
              }`}
            >
              <div
                className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${
                  i === 0 ? 'bg-white/10 text-white' : 'bg-white text-[#0070ba] shadow-sm'
                }`}
              >
                <Check className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold">{block.title}</h2>
              <p className={`mt-3 text-sm leading-relaxed ${i === 0 ? 'text-white/70' : 'text-slate-600'}`}>
                {block.text}
              </p>
            </div>
          ))}
        </div>

        {page.list?.length ? (
          <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-[#111]">{page.listTitle}</h3>
            </div>
            <ul>
              {page.list.map((item, idx) => (
                <li
                  key={item}
                  className={`flex items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-[#111] ${
                    idx < page.list.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <span>{item}</span>
                  <Link to="/register" className="text-[#0070ba] hover:underline">
                    Apply →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="bg-[#0a0a0a] px-4 py-16 text-center text-white md:py-20">
        <p className="text-sm font-semibold text-[#8ec4ef]">{page.section}</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Ready to experience {page.title}?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
          Join India Pay Now and manage payments with a cleaner, faster experience.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold text-[#111] transition hover:bg-slate-100"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="inline-flex rounded-full border border-white/30 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
