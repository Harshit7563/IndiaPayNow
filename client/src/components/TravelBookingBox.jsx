import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Bus,
  CalendarDays,
  ChevronDown,
  Globe2,
  Hotel,
  Plane,
  TrainFront,
  Users,
} from 'lucide-react';
import { ServiceTabsBar } from './ServiceTabsBar';

const modes = [
  { id: 'flights', label: 'Flights', Icon: Plane, service: 'flight' },
  { id: 'bus', label: 'Bus', Icon: Bus, service: 'bus' },
  { id: 'trains', label: 'Trains', Icon: TrainFront, service: 'train' },
  { id: 'hotels', label: 'Hotels', Icon: Hotel, service: 'hotel' },
];

const serviceToMode = {
  flight: 'flights',
  flights: 'flights',
  bus: 'bus',
  train: 'trains',
  trains: 'trains',
  hotel: 'hotels',
  hotels: 'hotels',
};

const cities = {
  flights: [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'BLR', name: 'Bengaluru' },
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'MAA', name: 'Chennai' },
    { code: 'CCU', name: 'Kolkata' },
  ],
  bus: [
    { code: 'DEL', name: 'Delhi' },
    { code: 'JAI', name: 'Jaipur' },
    { code: 'AGR', name: 'Agra' },
    { code: 'LKO', name: 'Lucknow' },
    { code: 'CHD', name: 'Chandigarh' },
  ],
  trains: [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'CSTM', name: 'Mumbai CST' },
    { code: 'SBC', name: 'Bengaluru' },
    { code: 'HWH', name: 'Howrah' },
    { code: 'MAS', name: 'Chennai Central' },
  ],
};

const specialFares = [
  { id: 'armed', title: 'Armed Forces', hint: 'Up to ₹600 off' },
  { id: 'student', title: 'Student', hint: 'Extra baggage' },
  { id: 'senior', title: 'Senior Citizen', hint: 'Up to ₹600 off' },
];

const popularRoutes = [
  'Delhi → Mumbai',
  'Bengaluru → Goa',
  'Hyderabad → Chennai',
  'Delhi → Jaipur',
];

function formatDepartLabel(dateStr) {
  if (!dateStr) return 'Select date';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function TravelBookingBox({ initialMode = 'flights', onModeChange, onSearch }) {
  const [mode, setMode] = useState(serviceToMode[initialMode] || initialMode || 'flights');
  const [trip, setTrip] = useState('oneway');
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [depart, setDepart] = useState(tomorrowISO());
  const [returnDate, setReturnDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [cabin, setCabin] = useState('Economy');
  const [fare, setFare] = useState(null);
  const [swapping, setSwapping] = useState(false);
  const [openField, setOpenField] = useState(null);

  useEffect(() => {
    const next = serviceToMode[initialMode] || initialMode;
    if (next && next !== mode) setMode(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode]);

  const list = cities[mode] || cities.flights;
  const from = list[fromIdx % list.length];
  const to = list[toIdx % list.length];
  const isHotel = mode === 'hotels';

  const searchLabel = useMemo(() => {
    if (mode === 'flights') return 'Search Flights';
    if (mode === 'bus') return 'Search Buses';
    if (mode === 'trains') return 'Search Trains';
    return 'Search Hotels';
  }, [mode]);

  const selectMode = (id) => {
    setMode(id);
    setFromIdx(0);
    setToIdx(1);
    setOpenField(null);
    const meta = modes.find((m) => m.id === id);
    onModeChange?.(meta?.service || id);
  };

  const handleSearch = () => {
    onSearch?.({
      mode,
      trip,
      from,
      to,
      depart,
      returnDate,
      travellers,
      cabin,
      fare,
      isHotel,
    });
  };

  const swap = () => {
    if (isHotel) return;
    setSwapping(true);
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    window.setTimeout(() => setSwapping(false), 320);
  };

  const cycleCity = (which) => {
    const len = list.length;
    if (which === 'from') setFromIdx((v) => (v + 1) % len);
    else setToIdx((v) => (v + 1) % len);
  };

  return (
    <div className="travel-box relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 md:rounded-[2rem]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#0070ba]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#5ba3d9]/15 blur-3xl" />

      <ServiceTabsBar
        tabs={modes.map(({ service, label, Icon }) => ({ id: service, label, Icon }))}
        activeId={modes.find((m) => m.id === mode)?.service || 'flight'}
        brand="Travel"
        onChange={(serviceId) => {
          const meta = modes.find((m) => m.service === serviceId);
          if (meta) selectMode(meta.id);
        }}
      />

      <div className="relative space-y-4 p-4 sm:p-5 md:p-6">
        {!isHotel && (
          <div className="flex flex-wrap items-center gap-4">
            {[
              ['oneway', 'One Way'],
              ['round', 'Round Trip'],
            ].map(([id, label]) => (
              <label key={id} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition ${
                    trip === id ? 'border-[#0070ba] bg-[#0070ba]' : 'border-slate-300 bg-white'
                  }`}
                >
                  {trip === id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <input
                  type="radio"
                  name="trip"
                  value={id}
                  checked={trip === id}
                  onChange={() => {
                    setTrip(id);
                    if (id === 'oneway') setReturnDate('');
                  }}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        )}

        {/* Search grid */}
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-stretch lg:gap-4">
          <div
            className={`grid gap-px overflow-hidden rounded-2xl bg-slate-200/70 ring-1 ring-slate-200 ${
              isHotel ? 'sm:grid-cols-3' : 'sm:grid-cols-[1fr_auto_1fr_1fr_1fr_1.1fr]'
            }`}
          >
            {isHotel ? (
              <>
                <Field
                  label="City / Hotel"
                  value="Goa"
                  sub="North Goa · Calangute"
                  open={openField === 'city'}
                  onClick={() => setOpenField(openField === 'city' ? null : 'city')}
                />
                <Field
                  label="Check-in"
                  value={formatDepartLabel(depart)}
                  icon={CalendarDays}
                  open={openField === 'checkin'}
                  onClick={() => setOpenField(openField === 'checkin' ? null : 'checkin')}
                />
                <Field
                  label="Guests & Rooms"
                  value={`${travellers} Guest${travellers > 1 ? 's' : ''}, 1 Room`}
                  icon={Users}
                  open={openField === 'guests'}
                  onClick={() => setOpenField(openField === 'guests' ? null : 'guests')}
                />
              </>
            ) : (
              <>
                <Field
                  label="From"
                  value={`${from.name} (${from.code})`}
                  open={openField === 'from'}
                  onClick={() => {
                    cycleCity('from');
                    setOpenField(openField === 'from' ? null : 'from');
                  }}
                />
                <div className="relative z-10 flex items-center justify-center bg-white px-1 sm:px-0">
                  <button
                    type="button"
                    aria-label="Swap locations"
                    onClick={swap}
                    className={`-my-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0070ba] shadow-sm transition hover:border-[#0070ba]/40 hover:bg-[#eef5ff] sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 ${
                      swapping ? 'rotate-180' : ''
                    }`}
                    style={{ transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), background 0.15s, border-color 0.15s' }}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>
                <Field
                  label="To"
                  value={`${to.name} (${to.code})`}
                  open={openField === 'to'}
                  onClick={() => {
                    cycleCity('to');
                    setOpenField(openField === 'to' ? null : 'to');
                  }}
                />
                <Field
                  label="Depart"
                  value={formatDepartLabel(depart)}
                  icon={CalendarDays}
                  open={openField === 'depart'}
                  onClick={() => setOpenField(openField === 'depart' ? null : 'depart')}
                >
                  {openField === 'depart' && (
                    <input
                      type="date"
                      value={depart}
                      min={tomorrowISO()}
                      onChange={(e) => {
                        setDepart(e.target.value);
                        setOpenField(null);
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#0070ba]"
                    />
                  )}
                </Field>
                <Field
                  label="Return"
                  value={trip === 'round' && returnDate ? formatDepartLabel(returnDate) : 'Add Return'}
                  muted={!(trip === 'round' && returnDate)}
                  open={openField === 'return'}
                  onClick={() => {
                    if (trip !== 'round') setTrip('round');
                    setOpenField(openField === 'return' ? null : 'return');
                  }}
                >
                  {openField === 'return' && (
                    <input
                      type="date"
                      value={returnDate}
                      min={depart}
                      onChange={(e) => {
                        setReturnDate(e.target.value);
                        setTrip('round');
                        setOpenField(null);
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#0070ba]"
                    />
                  )}
                </Field>
                <Field
                  label={mode === 'flights' ? 'Passenger & Class' : 'Travellers'}
                  value={
                    mode === 'flights'
                      ? `${travellers} Traveller${travellers > 1 ? 's' : ''}, ${cabin.slice(0, 6)}…`
                      : `${travellers} Traveller${travellers > 1 ? 's' : ''}`
                  }
                  icon={Users}
                  chevron
                  open={openField === 'pax'}
                  onClick={() => setOpenField(openField === 'pax' ? null : 'pax')}
                >
                  {openField === 'pax' && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-slate-500">Travellers</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTravellers((n) => Math.max(1, n - 1));
                            }}
                          >
                            −
                          </button>
                          <span className="w-4 text-center font-bold">{travellers}</span>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTravellers((n) => Math.min(9, n + 1));
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {mode === 'flights' && (
                        <div className="flex flex-wrap gap-1.5">
                          {['Economy', 'Premium', 'Business'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCabin(c);
                              }}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                cabin === c ? 'bg-[#0070ba] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center rounded-2xl bg-[#0070ba] px-7 py-4 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(0,112,186,0.35)] transition hover:-translate-y-0.5 hover:bg-[#005ea6] hover:shadow-[0_14px_32px_rgba(0,112,186,0.4)] lg:min-w-[160px]"
          >
            {searchLabel}
          </button>
        </div>

        {/* Special fares — flights only */}
        {mode === 'flights' && (
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex shrink-0 items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">Special Fares</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                <span className="text-base leading-none">+</span> Extra Savings
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {specialFares.map((item) => {
                const active = fare === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFare(active ? null : item.id)}
                    className={`flex min-w-[9.5rem] flex-1 items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition sm:flex-none ${
                      active
                        ? 'border-[#0070ba] bg-[#eef5ff] shadow-[0_0_0_1px_#0070ba]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? 'border-[#0070ba] bg-[#0070ba]' : 'border-slate-300'
                      }`}
                    >
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-slate-800">{item.title}</span>
                      <span className="block text-[11px] text-slate-500">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular routes */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Globe2 className="h-3.5 w-3.5 text-[#0070ba]" />
            Popular now
          </span>
          {popularRoutes.map((route) => (
            <button
              key={route}
              type="button"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-[#0070ba]/40 hover:bg-[#eef5ff] hover:text-[#0070ba]"
            >
              {route}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, sub, muted, icon: Icon, chevron, open, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-[88px] flex-col items-start justify-center bg-white px-4 py-3 text-left transition hover:bg-slate-50/80 sm:px-5 ${
        open ? 'bg-[#f8fbff] ring-2 ring-inset ring-[#0070ba]/25' : ''
      }`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">{label}</span>
      <span
        className={`mt-1 flex w-full items-center gap-1.5 font-display text-[17px] font-extrabold leading-tight tracking-tight sm:text-[18px] ${
          muted ? 'text-[#0070ba]' : 'text-[#111]'
        }`}
      >
        {Icon && <Icon className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />}
        <span className="truncate">{value}</span>
        {chevron && <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />}
      </span>
      {sub && <span className="mt-0.5 truncate text-[11px] text-slate-500">{sub}</span>}
      {children}
    </button>
  );
}
