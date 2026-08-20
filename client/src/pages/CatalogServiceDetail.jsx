import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { ServiceWorkspace } from '../components/ServiceWorkspace';
import {
  appServiceFromCatalog,
  catalogPathForAppService,
  findCatalogService,
} from '../data/services';

export default function CatalogServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const service = findCatalogService(slug);
  const appService = appServiceFromCatalog(slug);

  useEffect(() => {
    if (!service) return undefined;
    window.scrollTo(0, 0);
    document.title = `${service.label} — ${service.nav} — India Pay Now`;
    return () => {
      document.title = 'India Pay Now';
    };
  }, [service]);

  if (!service) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111]">
      <SiteHeader />

      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <nav className="text-[13px] text-slate-400">
            <Link to="/" className="hover:text-[#111]">
              Home
            </Link>
            <span> / </span>
            <span className="text-slate-500">{service.nav}</span>
            <span> / </span>
            <span className="font-semibold text-slate-600">{service.label}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <ServiceWorkspace
          service={appService}
          onServiceChange={(id) => navigate(catalogPathForAppService(id))}
          hrefFor={(id) => catalogPathForAppService(id)}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
