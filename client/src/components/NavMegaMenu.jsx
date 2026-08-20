import { Link } from 'react-router-dom';

import { catalogServicePath } from '../data/services';

function ServiceItem({ slug, label, Icon, onNavigate }) {
  const to = catalogServicePath(slug);
  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={label}
      className="flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-slate-50"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-black">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-black">{label}</span>
    </Link>
  );
}

function columnLayout(col, multi) {
  // Up-to-down columns: 4, then 4, then 3
  if (col.gridCols === 4 || (!col.gridCols && col.items.length >= 8 && multi)) {
    return {
      width: 'w-[560px] max-w-[72vw]',
      grid: 'grid grid-flow-col grid-rows-4 gap-x-3 gap-y-0.5',
    };
  }
  if (col.gridCols === 2 || (!multi && col.items.length > 4)) {
    return { width: multi ? 'w-[360px]' : 'w-[460px]', grid: 'grid grid-cols-2 gap-x-2' };
  }
  return { width: multi ? 'w-[200px] shrink-0' : 'w-[240px]', grid: 'flex flex-col' };
}

export function NavMegaMenu({ menu, onNavigate, align = 'left' }) {
  const columns = menu.columns || [];
  const multi = columns.length > 1;
  const hasWideGrid = columns.some((col) => col.gridCols === 4 || col.items.length >= 8);

  return (
    <div
      className={`absolute top-full z-50 pt-2 ${
        align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
      }`}
    >
      <div
        className={`absolute top-[3px] z-10 h-3 w-3 rotate-45 bg-white shadow-[-1px_-1px_2px_rgba(0,0,0,0.06)] ${
          align === 'right' ? 'right-8' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8'
        }`}
      />

      <div className="relative max-h-[75vh] overflow-y-auto rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/90">
        {columns.length > 0 && (
          <div className={`gap-6 px-5 py-5 ${multi ? 'flex items-start' : 'block'} ${hasWideGrid ? 'min-w-0' : ''}`}>
            {columns.map((col) => {
              const layout = columnLayout(col, multi);
              return (
                <div key={col.title} className={layout.width}>
                  <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
                    {col.title}
                  </p>
                  <div className={layout.grid}>
                    {col.items.map(([slug, label, Icon]) => (
                      <ServiceItem
                        key={slug}
                        slug={slug}
                        label={label}
                        Icon={Icon}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {menu.links && (
          <div className="grid w-[280px] grid-cols-1 gap-0.5 px-3 py-3">
            {menu.links.map((item) => {
              const [label, href, Icon] = item;
              const content = (
                <>
                  {Icon ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-black">
                      <Icon className="h-4 w-4" />
                    </span>
                  ) : null}
                  <span className="truncate">{label}</span>
                </>
              );
              const className =
                'flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-black transition hover:bg-slate-50';

              return href.startsWith('/') ? (
                <Link key={label} to={href} onClick={onNavigate} className={className}>
                  {content}
                </Link>
              ) : (
                <a key={label} href={href} onClick={onNavigate} className={className}>
                  {content}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
