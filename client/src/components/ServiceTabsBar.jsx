import { Sparkles } from 'lucide-react';

export function ServiceTabsBar({ tabs = [], activeId, brand = 'Pay', onChange }) {
  return (
    <div className="relative flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange?.(id)}
              className={`relative flex min-w-[4.5rem] flex-col items-center gap-1.5 px-3 pb-3 pt-1 transition sm:min-w-[5.25rem] sm:px-4 ${
                active ? 'text-[#0070ba]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`h-5 w-5 transition ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.25 : 1.75} />
              <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight">{label}</span>
              <span
                className={`absolute inset-x-3 bottom-0 h-[2.5px] rounded-full bg-[#0070ba] transition duration-300 ${
                  active ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="mb-3 flex items-center gap-2 pr-1">
        <span className="hidden items-center gap-1.5 rounded-full bg-[#eef5ff] px-2.5 py-1 text-[11px] font-bold text-[#0070ba] sm:inline-flex">
          <Sparkles className="h-3 w-3" /> Instant pay
        </span>
        <p className="font-display text-sm font-extrabold tracking-tight text-[#111]">
          India Pay Now <span className="font-semibold text-[#0070ba]">{brand}</span>
        </p>
      </div>
    </div>
  );
}
