const FALLBACK_INR = {
  USD: 83.5,
  AED: 22.75,
  GBP: 106.2,
  SGD: 62.4,
};

let cache = { rates: null, fetchedAt: 0 };

const toInrMap = (usdRates) => {
  const inrPerUsd = Number(usdRates.INR);
  if (!inrPerUsd) return null;
  return {
    USD: inrPerUsd,
    AED: usdRates.AED ? inrPerUsd / Number(usdRates.AED) : FALLBACK_INR.AED,
    GBP: usdRates.GBP ? inrPerUsd / Number(usdRates.GBP) : FALLBACK_INR.GBP,
    SGD: usdRates.SGD ? inrPerUsd / Number(usdRates.SGD) : FALLBACK_INR.SGD,
  };
};

export const getLiveFxRates = async () => {
  const now = Date.now();
  if (cache.rates && now - cache.fetchedAt < 5 * 60 * 1000) {
    return cache.rates;
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`FX HTTP ${response.status}`);
    const data = await response.json();
    if (data.result !== 'success' || !data.rates) throw new Error('FX payload invalid');

    const inr = toInrMap(data.rates);
    if (!inr) throw new Error('INR rate missing');

    const payload = {
      live: true,
      base: 'INR',
      updatedAt: data.time_last_update_utc || new Date().toISOString(),
      rates: {
        USD: Number(inr.USD.toFixed(4)),
        AED: Number(inr.AED.toFixed(4)),
        GBP: Number(inr.GBP.toFixed(4)),
        SGD: Number(inr.SGD.toFixed(4)),
      },
    };
    cache = { rates: payload, fetchedAt: now };
    return payload;
  } catch {
    const stale = cache.rates;
    if (stale) return { ...stale, live: false, stale: true };
    return {
      live: false,
      base: 'INR',
      updatedAt: new Date().toISOString(),
      rates: FALLBACK_INR,
    };
  }
};
