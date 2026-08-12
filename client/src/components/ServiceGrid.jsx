import { Link } from 'react-router-dom';
import { serviceCatalog } from '../data/services';

export function ServiceGrid({ toPrefix = '/app/bills' }) {
  return (
    <div className="space-y-12">
      {serviceCatalog.map((group) => (
        <div key={group.id} id={group.id}>
          <h3 className="font-display text-xl font-extrabold text-[#001c64] md:text-2xl">{group.title}</h3>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {group.items.map(([slug, label, Icon]) => (
              <Link
                key={slug}
                to={`${toPrefix}/${slug}`}
                className="group flex flex-col items-center rounded-2xl border border-transparent bg-white p-3 text-center transition hover:border-brand-100 hover:bg-brand-50/40 hover:shadow-sm"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-2.5 text-[12px] font-semibold leading-tight text-[#001c64]">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
