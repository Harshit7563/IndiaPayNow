import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import {
  categoryPath,
  findByCategoryParam,
  getServiceStory,
  listingCount,
  servicePath,
} from '../data/verificationCategories';
import {
  buildCurl,
  getVerificationApi,
  methodColors,
  relatedApiEndpoints,
} from '../data/verificationApiCatalog';
import { copyText } from '../utils/format';

function MethodBadge({ method }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${methodColors[method] || 'bg-slate-100 text-slate-700 ring-slate-300'}`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ title, code, onCopy }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <button
          type="button"
          onClick={() => onCopy(code)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function VerificationServiceDetail() {
  const { serviceId } = useParams();
  const { group, item } = findByCategoryParam(serviceId || '');
  const story = useMemo(() => getServiceStory(item, group), [item, group]);
  const api = useMemo(() => getVerificationApi(item), [item]);
  const endpoints = useMemo(() => relatedApiEndpoints(item), [item]);
  const curl = useMemo(() => buildCurl(api, api.sampleRequest), [api]);
  const related = group.items.filter((i) => i.id !== item.id).slice(0, 4);
  const [openFaq, setOpenFaq] = useState(0);
  const Icon = item.icon;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${item.label} — ${group.label} — India Pay Now`;
    return () => {
      document.title = 'India Pay Now';
    };
  }, [item.label, group.label]);

  const handleCopy = async (text) => {
    try {
      await copyText(text);
      toast.success('Copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  if (!serviceId) return <Navigate to="/verification/categories" replace />;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <div className="border-b border-slate-100 bg-[#f7f8fa]">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <nav className="text-[13px] text-slate-400">
            <Link to="/" className="hover:text-[#111]">
              Home
            </Link>
            <span> / </span>
            <Link to="/verification" className="hover:text-[#111]">
              Verification
            </Link>
            <span> / </span>
            <Link to={categoryPath(group.id, item.id)} className="hover:text-[#111]">
              {group.label}
            </Link>
            <span> / </span>
            <span className="text-slate-600">{item.label}</span>
          </nav>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0070ba]">{group.label}</p>
            <div className="mt-4 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0f9ff] text-[#001c64] ring-1 ring-[#00baf2]/20">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#111] md:text-[2.75rem]">
                  {item.label}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">{item.description}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/app/kyc"
                className="inline-flex items-center gap-2 rounded-full bg-[#001c64] px-6 py-3 text-sm font-bold text-white"
              >
                Try {item.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/verification#inquire"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-[#111] hover:bg-slate-50"
              >
                Inquire
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {story.highlights.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-[#f7f8fa] px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1.5 font-display text-lg font-bold text-[#111]">{value}</dd>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live directory</dt>
              <dd className="mt-1.5 text-sm font-semibold text-[#111]">
                {listingCount(item)} services · {api.method} {api.path}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-[#f7f8fa] px-4 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#0070ba]">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Three steps to a verified result</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {story.steps.map((step) => (
              <article key={step.n} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="font-display text-sm font-bold text-[#00baf2]">{step.n}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-[#111]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-[#0070ba]">Where it is used</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Built for Indian KYC flows</h2>
            <ul className="mt-6 space-y-3">
              {story.uses.map((use) => (
                <li key={use} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00baf2]" />
                  {use}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[#f7f8fa] p-6">
            <h3 className="font-display text-lg font-bold text-[#111]">Auth & limits</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <dt className="text-slate-500">Authentication</dt>
                <dd className="text-right font-semibold text-[#111]">{api.auth}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <dt className="text-slate-500">Latency</dt>
                <dd className="font-semibold text-[#111]">{api.latency}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <dt className="text-slate-500">Rate limit</dt>
                <dd className="text-right font-semibold text-[#111]">{api.rateLimit}</dd>
              </div>
              {api.webhook ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Webhook</dt>
                  <dd className="break-all text-right font-mono text-xs font-semibold text-[#111]">{api.webhook}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#f7f8fa] px-4 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#0070ba]">API</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{item.label} Verification API</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{api.summary}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <MethodBadge method={api.method} />
                <code className="break-all text-sm font-semibold text-[#111]">{api.path}</code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(api.path)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy path
              </button>
            </div>
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
                <h3 className="text-sm font-bold text-[#111]">Request parameters</h3>
                <table className="mt-3 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400">
                      <th className="pb-2 pr-4 font-semibold">Field</th>
                      <th className="pb-2 pr-4 font-semibold">Type</th>
                      <th className="pb-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {api.requestFields.map((field) => (
                      <tr key={field.name} className="border-b border-slate-50 align-top">
                        <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-[#111]">
                          {field.name}
                          {field.required ? <span className="text-red-500"> *</span> : null}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-slate-500">{field.type}</td>
                        <td className="py-2.5 text-xs text-slate-600">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4 p-5">
                {api.sampleRequest ? (
                  <CodeBlock title="Sample request" code={JSON.stringify(api.sampleRequest, null, 2)} onCopy={handleCopy} />
                ) : (
                  <p className="text-sm text-slate-500">No request body — use path parameters.</p>
                )}
                <CodeBlock title="Sample response" code={JSON.stringify(api.sampleResponse, null, 2)} onCopy={handleCopy} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <CodeBlock title="cURL" code={curl} onCopy={handleCopy} />
          </div>

          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[13px] font-semibold text-slate-500">
                  <th className="px-5 py-3">Related endpoint</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Path</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((row) => (
                  <tr key={`${row.method}-${row.path}`} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#111]">{row.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{row.description}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <MethodBadge method={row.method} />
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-semibold text-[#111]">{row.path}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">FAQs</h2>
        <div className="mt-6">
          {story.faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={faq.q} className="border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg font-bold">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#0070ba] transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? <p className="pb-5 pr-10 text-sm leading-relaxed text-slate-600">{faq.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-slate-100 bg-[#f7f8fa] px-4 py-14 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#0070ba]">More in {group.label}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">Related services</h2>
              </div>
              <Link to={categoryPath(group.id, item.id)} className="text-sm font-semibold text-[#0070ba]">
                View category →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel) => {
                const RelIcon = rel.icon;
                return (
                  <Link
                    key={rel.id}
                    to={servicePath(rel.id)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#00baf2]/40"
                  >
                    <RelIcon className="h-6 w-6 text-[#111]" strokeWidth={1.5} />
                    <h3 className="mt-4 font-display text-base font-bold text-[#111]">{rel.label}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{rel.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </div>
  );
}
