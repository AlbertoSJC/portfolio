'use client';

import { useEffect, useState } from 'react';

const RATES_URL = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,JPY,CHF';
const CACHE_KEY = 'finquest-exchange-rates';
const CACHE_TTL_MS = 60 * 60 * 1000;

const CURRENCY_META: Record<string, { flag: string; label: string }> = {
  EUR: { flag: '🇪🇺', label: 'Euro' },
  GBP: { flag: '🇬🇧', label: 'British Pound' },
  JPY: { flag: '🇯🇵', label: 'Japanese Yen' },
  CHF: { flag: '🇨🇭', label: 'Swiss Franc' },
};

interface RatesData {
  rates: Record<string, number>;
  date: string;
}

interface CachedRates extends RatesData {
  fetchedAt: number;
}

function readCache(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedRates;
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

export function ExchangeRates() {
  const [data, setData] = useState<RatesData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setData(cached);
      return;
    }

    fetch(RATES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RatesData>;
      })
      .then((fresh) => {
        setData(fresh);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...fresh, fetchedAt: Date.now() }));
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="chart-card rates-card">
      <h3>Market Pulse</h3>
      <p className="rates-subtitle">Live exchange rates · 1 USD equals</p>
      {failed && <p className="rates-error">Rates are unavailable right now.</p>}
      {!failed && !data && <p className="rates-loading">Loading rates…</p>}
      {data && (
        <>
          <ul className="rates-list">
            {Object.entries(data.rates).map(([code, rate]) => (
              <li key={code} className="rates-row">
                <span className="rates-flag">{CURRENCY_META[code]?.flag}</span>
                <span className="rates-code">{code}</span>
                <span className="rates-label">{CURRENCY_META[code]?.label}</span>
                <span className="rates-value">{rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              </li>
            ))}
          </ul>
          <span className="rates-date">as of {data.date} · Frankfurter API</span>
        </>
      )}
    </div>
  );
}
