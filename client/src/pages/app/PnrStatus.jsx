import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Check,
  Loader2,
  Search,
  Sparkles,
  TrainFront,
  Users,
} from 'lucide-react';
import api from '../../services/api';

export default function PnrStatus() {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const check = async (event) => {
    event?.preventDefault();
    const value = pnr.replace(/\D/g, '');
    if (!/^\d{10}$/.test(value)) return toast.error('Enter a valid 10-digit PNR');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/services/pnr', { pnr: value });
      setResult(data.data);
      if (data.data?.live) toast.success('Live PNR status fetched');
      else toast.success('Sample PNR preview loaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not fetch PNR status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl fade-up">
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
        <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e8f4ff,_transparent_55%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0070ba] text-white shadow-sm">
                <TrainFront className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">India Pay Now Travel</p>
                <h1 className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-[#111]">PNR Status</h1>
                <p className="mt-1 text-sm text-slate-500">Check Indian Railways booking status with RapidAPI.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-1.5 text-[11px] font-bold text-[#0070ba]">
              <Sparkles className="h-3.5 w-3.5" /> India Pay Now Travel
            </span>
          </div>
        </div>

        <form onSubmit={check} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">10-digit PNR</label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={pnr}
                onChange={(e) => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 1234567890"
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-10 pr-3 font-display text-lg font-extrabold tracking-[0.18em] text-[#111] outline-none transition focus:border-[#0070ba] focus:shadow-[0_0_0_3px_rgba(0,112,186,0.12)]"
              />
            </div>
            <button
              type="button"
              onClick={() => setPnr('1234567890')}
              className="mt-2 text-xs font-semibold text-[#0070ba] hover:underline"
            >
              Use sample PNR 1234567890
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0070ba] py-3.5 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,112,186,0.28)] transition hover:-translate-y-0.5 hover:bg-[#005ea6] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </>
            ) : (
              'Check PNR Status'
            )}
          </button>
        </form>

        {result && (
          <div className="border-t border-slate-100 px-5 pb-6 sm:px-6">
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">PNR</p>
                <p className="font-display text-2xl font-extrabold tracking-wide text-[#111]">{result.pnr}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  result.live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {result.live ? 'Live · RapidAPI' : 'Demo mode'}
              </span>
            </div>

            {result.rawHint && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{result.rawHint}</p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Train" value={`${result.trainNumber} · ${result.trainName}`} />
              <Info label="Class" value={result.class} />
              <Info label="From → To" value={`${result.from} → ${result.to}`} />
              <Info label="Journey date" value={result.journeyDate} />
              <Info label="Chart" value={result.chartStatus} />
              <Info label="Boarding" value={result.boardingPoint || result.from} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#111]">
                <Users className="h-4 w-4 text-[#0070ba]" /> Passengers
              </div>
              <div className="space-y-2">
                {(result.passengers || []).map((p) => (
                  <div
                    key={`${p.number}-${p.name}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#111]">
                        {p.number}. {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Booking: {p.bookingStatus}
                        {p.coach ? ` · Coach ${p.coach}` : ''}
                        {p.berth ? ` · Berth ${p.berth}` : ''}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" /> {p.currentStatus}
                    </span>
                  </div>
                ))}
                {!result.passengers?.length && (
                  <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    No passenger rows in this response.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#111]">{value || '—'}</p>
    </div>
  );
}
