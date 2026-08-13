import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  KeyRound,
  Play,
  Plus,
  RefreshCcw,
  Search,
  Terminal,
  Trash2,
  Webhook,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { copyText, formatDate, statusColor } from '../../utils/format';
import { Badge, Button, Input, Modal } from '../../components/ui';
import {
  WEBHOOK_EVENTS,
  buildCurl,
  developerApiCatalog,
  findApiById,
  flattenApis,
} from '../../data/developerApiCatalog';

const TABS = [
  { id: 'reference', label: 'API Reference', icon: BookOpen },
  { id: 'console', label: 'Console', icon: Terminal },
  { id: 'credentials', label: 'Credentials', icon: KeyRound },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'logs', label: 'Logs', icon: Zap },
];

const METHOD_COLOR = {
  GET: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  POST: 'text-[#0070ba] bg-[#eef5ff] border-[#cfe3ff]',
  PUT: 'text-amber-700 bg-amber-50 border-amber-200',
  DELETE: 'text-rose-700 bg-rose-50 border-rose-200',
};

const ALL_APIS = flattenApis();
const DEFAULT_API_ID = ALL_APIS[0]?.id || 'list-api-keys';

function makeInitialUi() {
  return {
    tab: 'reference',
    mode: 'test',
    query: '',
    openCats: Object.fromEntries(developerApiCatalog.map((c) => [c.id, true])),
    selectedId: DEFAULT_API_ID,
    pathOverrides: {},
    bodyText: '',
    consoleStatus: null,
    consoleResult: null,
    sending: false,
    pulse: false,
    name: '',
    hookUrl: '',
    loading: false,
  };
}

function uiReducer(state, action) {
  const current = state || makeInitialUi();
  if (action.type === 'toggleCat') {
    return {
      ...current,
      openCats: {
        ...(current.openCats || {}),
        [action.id]: !current.openCats?.[action.id],
      },
    };
  }
  if (action.type === 'set') {
    return { ...current, ...(action.payload || {}) };
  }
  return current;
}

function MethodBadge({ method }) {
  return (
    <span
      className={`inline-flex min-w-[3.25rem] justify-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${
        METHOD_COLOR[method] || 'text-slate-600 bg-slate-50 border-slate-200'
      }`}
    >
      {method}
    </span>
  );
}

function JsonBlock({ value, label }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0070ba]">{label}</span>
        <button
          type="button"
          onClick={() => copyText(text).then(() => toast.success('Copied'))}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#001c64]"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <pre className="max-h-64 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-[#0b1f3a]">{text}</pre>
    </div>
  );
}

function ParamTable({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h4>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Required</th>
              <th className="px-3 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 text-slate-700">
                <td className="px-3 py-2 font-mono text-[#0070ba]">{row.name}</td>
                <td className="px-3 py-2">{row.type}</td>
                <td className="px-3 py-2">{row.required ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-slate-400">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DEVELOPER_PIN = '7563';
const DEVELOPER_UNLOCK_KEY = 'ipn_dev_unlocked';

function DeveloperPinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (pin === DEVELOPER_PIN) {
      sessionStorage.setItem(DEVELOPER_UNLOCK_KEY, '1');
      onUnlock();
      toast.success('Developers unlocked');
      return;
    }
    setError('Incorrect PIN');
    setShake(true);
    setPin('');
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#f7f9fa] px-4 lg:left-64 lg:top-16">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0070ba]">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-extrabold text-[#001c64]">
          Enter developer PIN
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Developers tools are protected. Enter your PIN to continue.
        </p>

        <form onSubmit={submit} className={`mt-8 space-y-4 ${shake ? 'animate-pulse' : ''}`}>
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
              setError('');
            }}
            placeholder="••••"
            className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-[0.4em]"
            autoFocus
          />
          {error ? <p className="text-center text-sm font-semibold text-rose-600">{error}</p> : null}
          <Button type="submit" className="w-full py-3.5">
            Unlock Developers
          </Button>
        </form>
      </div>
    </div>
  );
}

function DeveloperConsoleApp() {
  const [ui, dispatch] = useReducer(uiReducer, undefined, makeInitialUi);
  const [keys, setKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [docs, setDocs] = useState(null);
  const [secret, setSecret] = useState(null);

  const setUi = useCallback((payload) => dispatch({ type: 'set', payload }), []);

  const selected = findApiById(ui.selectedId) || ALL_APIS[0] || null;
  const baseUrl = docs?.baseUrlAbsolute || `${window.location.origin}/api`;

  useEffect(() => {
    const api = findApiById(ui.selectedId) || ALL_APIS[0];
    if (!api) return;
    setUi({
      bodyText: api.sampleRequest ? JSON.stringify(api.sampleRequest, null, 2) : '',
      consoleResult: null,
      consoleStatus: null,
      pathOverrides: {},
    });
  }, [ui.selectedId, setUi]);

  const load = useCallback(async () => {
    const params = { mode: ui.mode };
    const results = await Promise.allSettled([
      api.get('/developer/api-keys', { params }),
      api.get('/developer/docs'),
      api.get('/developer/logs', { params }),
      api.get('/developer/webhooks', { params }),
    ]);
    const value = (i) =>
      results[i].status === 'fulfilled' ? results[i].value.data.data || results[i].value.data : null;
    const k = value(0);
    const l = value(2);
    const w = value(3);
    setKeys(Array.isArray(k) ? k : k?.apiKeys || k?.keys || []);
    setDocs(value(1));
    setLogs(Array.isArray(l) ? l : l?.logs || []);
    setWebhooks(Array.isArray(w) ? w : w?.webhooks || []);
  }, [ui.mode]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCatalog = useMemo(() => {
    const q = ui.query.trim().toLowerCase();
    if (!q) return developerApiCatalog;
    return developerApiCatalog
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories
          .map((sub) => ({
            ...sub,
            apis: sub.apis.filter(
              (a) =>
                a.name.toLowerCase().includes(q) ||
                a.path.toLowerCase().includes(q) ||
                a.method.toLowerCase().includes(q) ||
                a.summary.toLowerCase().includes(q)
            ),
          }))
          .filter((sub) => sub.apis.length),
      }))
      .filter((cat) => cat.subcategories.length);
  }, [ui.query]);

  const resolvedPath = useMemo(() => {
    if (!selected) return '';
    let path = selected.path;
    for (const p of selected.pathParams || []) {
      const val = ui.pathOverrides[p.name] || `:${p.name}`;
      path = path.replace(`:${p.name}`, encodeURIComponent(String(val).replace(/^:/, '')));
    }
    return path;
  }, [selected, ui.pathOverrides]);

  const curlSnippet = useMemo(() => {
    if (!selected) return '';
    let body = null;
    try {
      body = ui.bodyText.trim() ? JSON.parse(ui.bodyText) : null;
    } catch {
      body = selected.sampleRequest;
    }
    return buildCurl({
      method: selected.method,
      path: resolvedPath,
      body,
      baseUrl,
      token: 'YOUR_TOKEN',
    });
  }, [selected, resolvedPath, ui.bodyText, baseUrl]);

  const create = async (e) => {
    e.preventDefault();
    setUi({ loading: true });
    try {
      const { data } = await api.post('/developer/api-keys', { name: ui.name, mode: ui.mode });
      const created = data.data || data;
      setSecret(created.secret || created.apiSecret || created.key?.secret || null);
      setUi({ name: '', loading: false });
      toast.success('API key created');
      load();
    } catch (err) {
      setUi({ loading: false });
      toast.error(err.response?.data?.message || 'Could not create key');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/developer/api-keys/${id}`);
      toast.success('API key deleted');
      load();
    } catch {
      toast.error('Could not delete key');
    }
  };

  const regenerate = async (id) => {
    try {
      const { data } = await api.post(`/developer/api-keys/${id}/regenerate`);
      const result = data.data || data;
      setSecret(result.secret || result.apiSecret || null);
      toast.success('Secret regenerated');
      load();
    } catch {
      toast.error('Could not regenerate secret');
    }
  };

  const addWebhook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/developer/webhooks', { url: ui.hookUrl, mode: ui.mode });
      toast.success('Webhook added');
      setUi({ hookUrl: '' });
      load();
    } catch {
      toast.error('Could not add webhook');
    }
  };

  const sendRequest = async () => {
    if (!selected?.callable) {
      toast.error('This endpoint is documentation-only');
      return;
    }
    let body;
    if (selected.method !== 'GET' && selected.method !== 'DELETE' && ui.bodyText.trim()) {
      try {
        body = JSON.parse(ui.bodyText);
      } catch {
        toast.error('Request body must be valid JSON');
        return;
      }
    }

    setUi({ sending: true, consoleResult: null, consoleStatus: null });
    const started = performance.now();
    try {
      const response = await api.request({
        method: selected.method.toLowerCase(),
        url: resolvedPath,
        data: body,
      });
      const ms = Math.round(performance.now() - started);
      setUi({
        consoleStatus: { ok: true, code: response.status, ms },
        consoleResult: response.data,
        pulse: true,
        sending: false,
      });
      setTimeout(() => setUi({ pulse: false }), 700);
      toast.success(`OK ${response.status} · ${ms}ms`);
      load();
    } catch (err) {
      const ms = Math.round(performance.now() - started);
      const code = err.response?.status || 0;
      setUi({
        consoleStatus: { ok: false, code, ms },
        consoleResult: err.response?.data || { message: err.message },
        sending: false,
      });
      toast.error(`Failed ${code || ''}`.trim());
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f9fa] text-[#0b1f3a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 40% at 10% 0%, rgba(0,112,186,0.08), transparent), linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)',
          backgroundSize: 'auto, 28px 28px, 28px 28px',
        }}
      />

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0070ba] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0070ba]" />
              </span>
              <h1 className="font-display text-lg font-extrabold tracking-tight text-[#001c64] sm:text-xl">
                Developer API Console
              </h1>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
              {baseUrl} · {docs?.auth || 'Bearer token'} · mode{' '}
              <span className="font-semibold text-[#0070ba]">{ui.mode}</span>
            </p>
          </div>
          <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1">
            {['test', 'live'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setUi({ mode: v })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  ui.mode === v
                    ? 'bg-[#0070ba] text-white shadow-sm'
                    : 'text-slate-500 hover:text-[#001c64]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 sm:px-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setUi({ tab: id })}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                ui.tab === id
                  ? 'bg-[#eef5ff] text-[#0070ba] ring-1 ring-[#cfe3ff]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#001c64]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
          {(ui.tab === 'reference' || ui.tab === 'console') && (
            <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
              <div className="border-b border-slate-100 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={ui.query}
                    onChange={(e) => setUi({ query: e.target.value })}
                    placeholder="Search APIs…"
                    className="w-full rounded-lg border border-slate-200 bg-[#f7f9fa] py-2 pl-9 pr-3 text-sm text-[#0b1f3a] outline-none placeholder:text-slate-400 focus:border-[#0070ba]"
                  />
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-2">
                {filteredCatalog.map((cat) => (
                  <div key={cat.id} className="mb-1">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'toggleCat', id: cat.id })}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-[#001c64]"
                    >
                      {cat.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition ${ui.openCats?.[cat.id] ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {ui.openCats?.[cat.id] &&
                      cat.subcategories.map((sub) => (
                        <div key={sub.id} className="mb-2 ml-1 border-l border-slate-200 pl-2">
                          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {sub.label}
                          </p>
                          {sub.apis.map((endpoint) => (
                            <button
                              key={endpoint.id}
                              type="button"
                              onClick={() => setUi({ selectedId: endpoint.id })}
                              className={`mb-0.5 flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition ${
                                selected?.id === endpoint.id
                                  ? 'bg-[#eef5ff] ring-1 ring-[#cfe3ff]'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <MethodBadge method={endpoint.method} />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-[#0b1f3a]">
                                  {endpoint.name}
                                </span>
                                <span className="block truncate font-mono text-[10px] text-slate-500">
                                  {endpoint.path}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}
                  </div>
                ))}
                {!filteredCatalog.length && (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">No APIs match your search.</p>
                )}
              </nav>
            </aside>
          )}

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {ui.tab === 'reference' && selected && (
              <div key={selected.id} className="fade-up mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0070ba]">
                      {selected.categoryLabel} / {selected.subcategoryLabel}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-[#001c64]">{selected.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">{selected.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUi({ selectedId: selected.id, tab: 'console' })}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0070ba] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#005ea6]"
                  >
                    <Play className="h-4 w-4" /> Try in Console
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm">
                  <MethodBadge method={selected.method} />
                  <code className="text-[#0070ba]">{selected.path}</code>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-500">
                    {selected.auth}
                  </span>
                </div>

                <ParamTable title="Path parameters" rows={selected.pathParams} />
                <ParamTable title="Query parameters" rows={selected.query} />
                <ParamTable title="Request body" rows={selected.body} />

                <div className="grid gap-4 lg:grid-cols-2">
                  {selected.sampleRequest ? <JsonBlock label="Sample request" value={selected.sampleRequest} /> : null}
                  {selected.sampleResponse ? <JsonBlock label="Sample response" value={selected.sampleResponse} /> : null}
                </div>

                {selected.events?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#001c64]">Webhook events</h3>
                    {selected.events.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="font-mono text-sm font-semibold text-[#0070ba]">{ev.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{ev.description}</p>
                        <div className="mt-3">
                          <JsonBlock label="Payload" value={ev.sample} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <JsonBlock label="cURL" value={curlSnippet} />
              </div>
            )}

            {ui.tab === 'console' && selected && (
              <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-[#001c64]">Request</h2>
                    {ui.consoleStatus && (
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${
                          ui.consoleStatus.ok
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        } ${ui.pulse ? 'animate-pulse' : ''}`}
                      >
                        {ui.consoleStatus.code} · {ui.consoleStatus.ms}ms
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-[#f7f9fa] p-2">
                    <MethodBadge method={selected.method} />
                    <input
                      value={resolvedPath}
                      readOnly
                      className="min-w-0 flex-1 bg-transparent font-mono text-sm text-[#0b1f3a] outline-none"
                    />
                  </div>

                  {(selected.pathParams || []).map((p) => (
                    <label key={p.name} className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-400">:{p.name}</span>
                      <input
                        value={ui.pathOverrides[p.name] || ''}
                        onChange={(e) =>
                          setUi({
                            pathOverrides: { ...ui.pathOverrides, [p.name]: e.target.value },
                          })
                        }
                        placeholder={p.description}
                        className="w-full rounded-lg border border-slate-200 bg-[#f7f9fa] px-3 py-2 font-mono text-sm text-[#0b1f3a] outline-none focus:border-[#0070ba]"
                      />
                    </label>
                  ))}

                  {selected.method !== 'GET' && selected.method !== 'DELETE' && (
                    <label className="block text-xs">
                      <span className="mb-1 block font-semibold text-slate-400">JSON body</span>
                      <textarea
                        value={ui.bodyText}
                        onChange={(e) => setUi({ bodyText: e.target.value })}
                        rows={12}
                        spellCheck={false}
                        className="w-full rounded-xl border border-slate-200 bg-[#f7f9fa] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#0b1f3a] outline-none focus:border-[#0070ba]"
                      />
                    </label>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={sendRequest}
                      disabled={ui.sending}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0070ba] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005ea6] disabled:opacity-60 sm:flex-none"
                    >
                      <Play className="h-4 w-4" />
                      {ui.sending ? 'Sending…' : 'Send request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(curlSnippet).then(() => toast.success('cURL copied'))}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0b1f3a] hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4" /> Copy cURL
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sends with your logged-in session Bearer token against{' '}
                    <code className="text-[#0070ba]">{baseUrl}</code>.
                  </p>
                </div>

                <div className="space-y-4">
                  <JsonBlock label="cURL preview" value={curlSnippet} />
                  <div
                    className={`overflow-hidden rounded-xl border bg-white ${
                      ui.consoleStatus?.ok
                        ? 'border-emerald-300'
                        : ui.consoleStatus
                          ? 'border-rose-300'
                          : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0070ba]">
                        Response
                      </span>
                      {ui.consoleResult && (
                        <button
                          type="button"
                          onClick={() =>
                            copyText(JSON.stringify(ui.consoleResult, null, 2)).then(() =>
                              toast.success('Copied')
                            )
                          }
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-[#001c64]"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <pre className="max-h-[28rem] min-h-[12rem] overflow-auto p-3 font-mono text-[11px] leading-relaxed text-[#0b1f3a]">
                      {ui.consoleResult
                        ? JSON.stringify(ui.consoleResult, null, 2)
                        : '// Hit Send to execute against your merchant session'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {ui.tab === 'credentials' && (
              <div className="mx-auto max-w-3xl space-y-6">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-[#001c64]">API credentials</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Create and rotate keys for {ui.mode} mode. Secrets are shown only once.
                  </p>
                </div>
                <form
                  onSubmit={create}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
                >
                  <Input
                    required
                    aria-label="Key name"
                    placeholder="Key name"
                    value={ui.name}
                    onChange={(e) => setUi({ name: e.target.value })}
                    className="flex-1"
                  />
                  <Button loading={ui.loading} type="submit">
                    <Plus className="h-4 w-4" /> Create
                  </Button>
                </form>
                <div className="space-y-3">
                  {keys.length ? (
                    keys.map((key) => (
                      <div key={key.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#001c64]">{key.name}</p>
                            <code className="text-xs text-[#0070ba]">
                              {key.prefix || key.key_prefix || key.publicKey || key.key || '••••••••'}
                            </code>
                          </div>
                          <Badge className={statusColor(key.status || (key.is_active ? 'active' : 'revoked'))}>
                            {key.status || (key.is_active ? 'active' : 'revoked')}
                          </Badge>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-2 text-xs"
                            onClick={() => regenerate(key.id)}
                          >
                            <RefreshCcw className="h-3.5 w-3.5" /> Regenerate
                          </Button>
                          <Button variant="danger" className="!px-3 !py-2 text-xs" onClick={() => remove(key.id)}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                      <KeyRound className="mx-auto h-8 w-8 text-slate-500" />
                      <p className="mt-3 text-sm font-semibold text-slate-600">No {ui.mode} keys yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {ui.tab === 'webhooks' && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-[#001c64]">Webhooks</h2>
                  <p className="mt-1 text-sm text-slate-400">Receive realtime payment events on your HTTPS endpoint.</p>
                </div>
                <form
                  onSubmit={addWebhook}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
                >
                  <Input
                    required
                    type="url"
                    aria-label="Webhook URL"
                    placeholder="https://example.com/webhook"
                    value={ui.hookUrl}
                    onChange={(e) => setUi({ hookUrl: e.target.value })}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </form>
                <div className="space-y-3">
                  {webhooks.length ? (
                    webhooks.map((hook) => (
                      <div
                        key={hook.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#001c64]">{hook.url}</p>
                          <p className="text-xs text-slate-500">{hook.events?.join(', ') || 'All payment events'}</p>
                        </div>
                        <Badge className={statusColor(hook.status || 'active')}>{hook.status || 'active'}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                      <Webhook className="mx-auto h-8 w-8 text-slate-500" />
                      <p className="mt-3 text-sm font-semibold text-slate-600">No webhooks yet</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-[#001c64]">Event catalog</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {WEBHOOK_EVENTS.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#0070ba]" />
                          <code className="text-sm font-semibold text-[#0070ba]">{ev.label}</code>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {ui.tab === 'logs' && (
              <div className="mx-auto max-w-5xl space-y-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-[#001c64]">API logs</h2>
                  <p className="mt-1 text-sm text-slate-400">Recent developer API activity for {ui.mode} mode.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white font-mono text-[11px]">
                  <div className="grid grid-cols-[7rem_4rem_1fr_4rem] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-slate-500">
                    <span>TIME</span>
                    <span>METHOD</span>
                    <span>ENDPOINT</span>
                    <span>STATUS</span>
                  </div>
                  <div className="max-h-[28rem] overflow-y-auto">
                    {logs.length ? (
                      logs.map((log) => {
                        const code = Number(log.statusCode || log.status || 0);
                        const ok = code >= 200 && code < 300;
                        return (
                          <div
                            key={log.id}
                            className="grid grid-cols-[7rem_4rem_1fr_4rem] gap-2 border-t border-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <span className="truncate text-slate-500">
                              {formatDate(log.createdAt || log.created_at)}
                            </span>
                            <span className="font-bold text-[#0070ba]">{log.method}</span>
                            <span className="truncate">{log.endpoint || log.path}</span>
                            <span className={ok ? 'text-emerald-400' : 'text-rose-400'}>{code || '—'}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="px-3 py-10 text-center text-sm text-slate-500">No API logs yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Modal open={!!secret} onClose={() => setSecret(null)} title="Save your API secret">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This secret is shown only once. Store it securely.
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 p-3">
          <code className="min-w-0 flex-1 break-all text-sm">{secret}</code>
          <Button
            variant="secondary"
            className="!p-2"
            onClick={() => copyText(secret).then(() => toast.success('Secret copied'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function DeveloperConsole() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(DEVELOPER_UNLOCK_KEY) === '1');

  if (!unlocked) {
    return <DeveloperPinGate onUnlock={() => setUnlocked(true)} />;
  }

  return <DeveloperConsoleApp />;
}
