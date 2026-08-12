/**
 * Indian Railways PNR via RapidAPI (freemium).
 * Set RAPIDAPI_KEY in server/.env — get free key at:
 * https://rapidapi.com/amiteshgupta/api/irctc-indian-railway-pnr-status
 */

const HOST = process.env.RAPIDAPI_PNR_HOST || 'irctc-indian-railway-pnr-status.p.rapidapi.com';
const BASE = `https://${HOST}`;

function normalizePassenger(p, index = 0) {
  return {
    number: p?.number ?? p?.PassengerSerialNumber ?? index + 1,
    name: p?.name ?? p?.PassengerName ?? p?.passengerName ?? `Passenger ${index + 1}`,
    bookingStatus: p?.bookingStatus ?? p?.BookingStatus ?? p?.booking_status ?? '—',
    currentStatus: p?.currentStatus ?? p?.CurrentStatus ?? p?.current_status ?? p?.bookingStatus ?? '—',
    coach: p?.coach ?? p?.Coach ?? p?.CoachNumber ?? p?.coachNumber ?? null,
    berth: p?.berth ?? p?.Berth ?? p?.BerthNumber ?? p?.berthNumber ?? null,
    seat: p?.seat ?? p?.SeatNumber ?? null,
  };
}

function normalizePnrPayload(raw, pnr) {
  const root = raw?.data ?? raw?.Data ?? raw;
  if (!root || typeof root !== 'object') return null;

  const passengersRaw =
    root.passengers ||
    root.PassengerStatus ||
    root.passengerList ||
    root.PassengerList ||
    root.passengerDetails ||
    [];

  const passengers = Array.isArray(passengersRaw)
    ? passengersRaw.map((p, i) => normalizePassenger(p, i))
    : [];

  return {
    pnr: String(root.pnrNumber ?? root.PnrNumber ?? root.pnr ?? pnr),
    trainNumber: String(root.trainNumber ?? root.TrainNo ?? root.trainNo ?? root.TrainNumber ?? '—'),
    trainName: root.trainName ?? root.TrainName ?? root.train_name ?? '—',
    from: root.from ?? root.From ?? root.SourceStation ?? root.fromStation ?? root.BoardingPoint ?? '—',
    to: root.to ?? root.To ?? root.DestinationStation ?? root.toStation ?? root.ReservationUpto ?? '—',
    boardingPoint: root.boardingPoint ?? root.BoardingPoint ?? root.from ?? null,
    journeyDate: root.journeyDate ?? root.JourneyDate ?? root.DateOfJourney ?? root.doj ?? '—',
    class: root.class ?? root.Class ?? root.JourneyClass ?? root.Quota ?? '—',
    chartPrepared: Boolean(
      root.chartPrepared ??
        root.ChartPrepared ??
        (root.chartStatus === 'Prepared' ||
          String(root.ChartStatus || '').toLowerCase().includes('prepared'))
    ),
    chartStatus: root.chartStatus ?? root.ChartStatus ?? (root.chartPrepared ? 'Prepared' : 'Not prepared'),
    passengers,
    rawHint: null,
  };
}

function demoPnr(pnr, hint) {
  return {
    pnr,
    trainNumber: '12951',
    trainName: 'NDLS TEJAS RAJ',
    from: 'NDLS',
    to: 'MMCT',
    boardingPoint: 'NDLS',
    journeyDate: '15-Aug-2026',
    class: '3A',
    chartPrepared: false,
    chartStatus: 'Not prepared',
    passengers: [
      {
        number: 1,
        name: 'RAHUL SHARMA',
        bookingStatus: 'CNF',
        currentStatus: 'CNF/B2/42',
        coach: 'B2',
        berth: '42',
        seat: null,
      },
      {
        number: 2,
        name: 'PRIYA SHARMA',
        bookingStatus: 'CNF',
        currentStatus: 'CNF/B2/43',
        coach: 'B2',
        berth: '43',
        seat: null,
      },
    ],
    rawHint:
      hint ||
      'Demo sample — use your real IRCTC PNR for live status. Try 1234567890 for a preview.',
  };
}

function isUnusablePnrMessage(msg) {
  const lower = String(msg || '').toLowerCase();
  return (
    lower.includes('flushed') ||
    lower.includes('not yet') ||
    lower.includes('invalid pnr') ||
    lower.includes('facnam') ||
    lower.includes('not found')
  );
}

export async function fetchPnrStatus(pnrInput) {
  const pnr = String(pnrInput || '').replace(/\D/g, '');
  if (!/^\d{10}$/.test(pnr)) {
    const err = new Error('Enter a valid 10-digit PNR number');
    err.status = 400;
    throw err;
  }

  const key = process.env.RAPIDAPI_KEY?.trim();

  // Known demo PNR for UI preview without a live booking
  if (pnr === '1234567890' || pnr === '0000000000') {
    return {
      ...demoPnr(pnr, 'Sample demo PNR — not a live IRCTC booking. Enter your real PNR for live RapidAPI data.'),
      source: 'demo',
      live: false,
    };
  }

  if (!key) {
    return { ...demoPnr(pnr), source: 'demo', live: false };
  }

  const url = `${BASE}/getPNRStatus/${pnr}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': HOST,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!response.ok) {
      const msg =
        json?.message ||
        json?.error ||
        json?.Message ||
        `RapidAPI error (${response.status})`;
      if (response.status === 401 || response.status === 403 || response.status === 429 || isUnusablePnrMessage(msg)) {
        return {
          ...demoPnr(pnr, `${msg}. Showing sample booking preview.`),
          source: 'demo-fallback',
          live: false,
        };
      }
      const err = new Error(msg);
      err.status = response.status >= 500 ? 502 : 400;
      throw err;
    }

    if (json?.success === false) {
      const msg = String(json?.message || json?.data || 'Could not fetch this PNR');
      if (isUnusablePnrMessage(msg)) {
        return {
          ...demoPnr(
            pnr,
            `${msg}. Live IRCTC has no data for this number — showing sample preview.`
          ),
          source: 'demo-fallback',
          live: false,
        };
      }
      const err = new Error(msg);
      err.status = 400;
      throw err;
    }

    const blob = JSON.stringify(json || {}).toLowerCase();
    if (blob.includes('invalid pnr') || blob.includes('flushed pnr') || blob.includes('pnr not yet')) {
      return {
        ...demoPnr(pnr, 'PNR flushed or not generated yet — showing sample preview.'),
        source: 'demo-fallback',
        live: false,
      };
    }

    const normalized = normalizePnrPayload(json, pnr);
    if (!normalized) {
      return {
        ...demoPnr(pnr, 'Unexpected provider response — showing sample preview.'),
        source: 'demo-fallback',
        live: false,
      };
    }

    return { ...normalized, source: 'rapidapi', live: true };
  } catch (error) {
    if (error.status) throw error;
    if (error.name === 'AbortError') {
      return {
        ...demoPnr(pnr, 'PNR lookup timed out — showing sample preview.'),
        source: 'demo-fallback',
        live: false,
      };
    }
    return {
      ...demoPnr(pnr, error.message || 'RapidAPI unreachable — showing sample preview.'),
      source: 'demo-fallback',
      live: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export default { fetchPnrStatus };
