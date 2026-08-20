import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import {
  categoryGroups,
  findCategory,
  listingCount,
  servicePath,
} from '../data/verificationCategories';

function CategoryCarousel({ group, categoryId }) {
  const scroller = useRef(null);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const amount = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section id={`section-${group.id}`} className="scroll-mt-28">
      <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-[#111] md:text-[2rem]">
        {group.label}
      </h2>
      <p className="mt-1 text-sm text-slate-400">{group.items.length} Categories</p>

      <div className="relative mt-6">
        <button
          type="button"
          aria-label={`Previous ${group.label}`}
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={`Next ${group.label}`}
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {group.items.map((item) => {
            const Icon = item.icon;
            const on = item.id === categoryId;
            const count = listingCount(item);
            const [time, fields] = item.stats;
            return (
              <article
                key={item.id}
                id={`category-${item.id}`}
                data-card
                className={`w-[min(100%,300px)] shrink-0 scroll-mt-28 rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:w-[300px] ${
                  on ? 'border-[#00baf2] ring-1 ring-[#00baf2]/25' : 'border-slate-200'
                }`}
              >
                <Link to={servicePath(item.id)} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="h-8 w-8 text-[#111]" strokeWidth={1.5} />
                    <span className="rounded-md bg-[#00baf2] px-2 py-0.5 text-[11px] font-bold text-white">
                      {count} Services
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-[#111]">{item.label}</h3>
                  <p className="mt-1.5 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex text-sm font-bold text-[#111]">View details →</span>
                </Link>
                <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <dt className="text-xs text-slate-400">{time[0]}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-[#111]">{time[1]}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">{fields[0]}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-[#111]">{fields[1]}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function VerificationCategories() {
  const [params, setParams] = useSearchParams();
  const sectionId = params.get('page-section-id') || categoryGroups[0].id;
  const categoryId = params.get('category') || '';
  const { item: selected } = findCategory(sectionId, categoryId || undefined);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categoryGroups;
    return categoryGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  useEffect(() => {
    document.title = `${selected.label} — Categories — India Pay Now`;
    const node = document.getElementById(categoryId ? `category-${categoryId}` : `section-${sectionId}`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return () => {
      document.title = 'India Pay Now';
    };
  }, [sectionId, categoryId, selected.label]);

  const setSection = (id) => {
    const first = categoryGroups.find((g) => g.id === id)?.items[0];
    setParams({ 'page-section-id': id, category: first?.id || '' });
  };

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <div className="sticky top-14 z-20 border-b border-slate-200 bg-white sm:top-16">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryGroups.map((g) => {
            const on = g.id === sectionId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSection(g.id)}
                className={`shrink-0 px-4 py-4 text-sm font-semibold transition ${
                  on
                    ? 'border-b-[3px] border-[#00baf2] text-[#111]'
                    : 'border-b-[3px] border-transparent text-slate-400 hover:text-[#111]'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-[#111] outline-none ring-[#00baf2]/25 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 md:px-8 md:pb-28">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-[#111]">No results found</h2>
            <p className="mt-2 text-sm text-slate-500">Please try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-14 md:space-y-16">
            {filtered.map((g) => (
              <CategoryCarousel key={g.id} group={g} categoryId={categoryId} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
