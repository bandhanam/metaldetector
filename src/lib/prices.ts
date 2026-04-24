import { MetalPrice, MarketData } from "@/types";

const TROY_OZ_TO_GRAMS = 31.1035;
const MEMORY_CACHE_TTL_MS = 60_000;

interface AllCountryPrices {
  IN: { gold: number; silver: number; platinum: number };
  CN: { gold: number; silver: number; platinum: number };
  US: { gold: number; silver: number; platinum: number };
  EU: { gold: number; silver: number; platinum: number };
  JP: { gold: number; silver: number; platinum: number };
}

interface ExchangeRates {
  INR: number;
  CNY: number;
  EUR: number;
  JPY: number;
}

interface MetalSpotUSD {
  gold_per_oz: number;
  silver_per_oz: number;
  platinum_per_oz: number;
}

let cachedPrices: MetalPrice[] | null = null;
let cachedAt = 0;

async function fetchLiveSpotPrices(): Promise<MetalSpotUSD | null> {
  try {
    const res = await fetch(
      "https://metalmetric.com/api/gpt?action=spot_prices&metal=all",
      { signal: AbortSignal.timeout(5000), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const p = data?.prices;
    if (!p?.gold?.price_per_oz || !p?.silver?.price_per_oz) return null;

    const platinumPrice = p?.platinum?.price_per_oz || 0;

    return {
      gold_per_oz: p.gold.price_per_oz,
      silver_per_oz: p.silver.price_per_oz,
      platinum_per_oz: platinumPrice,
    };
  } catch {
    return null;
  }
}

async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { signal: AbortSignal.timeout(5000), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.rates;
    if (!r?.INR || !r?.CNY || !r?.EUR || !r?.JPY) return null;
    return { INR: r.INR, CNY: r.CNY, EUR: r.EUR, JPY: r.JPY };
  } catch {
    return null;
  }
}

function convertToLocalPrices(spot: MetalSpotUSD, fx: ExchangeRates): AllCountryPrices {
  const goldPer10gUSD = (spot.gold_per_oz / TROY_OZ_TO_GRAMS) * 10;
  const silverPerKgUSD = (spot.silver_per_oz / TROY_OZ_TO_GRAMS) * 1000;
  // Platinum priced per 10g (like gold — it's a precious metal)
  const platinumPer10gUSD = (spot.platinum_per_oz / TROY_OZ_TO_GRAMS) * 10;

  // India premiums: import duty + GST + AIDC + landing costs
  const INDIA_GOLD_PREMIUM = 1.071;
  const INDIA_SILVER_PREMIUM = 1.14;
  const INDIA_PLATINUM_PREMIUM = 1.095; // ~6% import duty + 3% GST + small premium

  return {
    US: { gold: round(goldPer10gUSD), silver: round(silverPerKgUSD), platinum: round(platinumPer10gUSD) },
    IN: {
      gold: round(goldPer10gUSD * fx.INR * INDIA_GOLD_PREMIUM),
      silver: round(silverPerKgUSD * fx.INR * INDIA_SILVER_PREMIUM),
      platinum: round(platinumPer10gUSD * fx.INR * INDIA_PLATINUM_PREMIUM),
    },
    CN: { gold: round(goldPer10gUSD * fx.CNY), silver: round(silverPerKgUSD * fx.CNY), platinum: round(platinumPer10gUSD * fx.CNY) },
    EU: { gold: round(goldPer10gUSD * fx.EUR), silver: round(silverPerKgUSD * fx.EUR), platinum: round(platinumPer10gUSD * fx.EUR) },
    JP: { gold: round(goldPer10gUSD * fx.JPY), silver: round(silverPerKgUSD * fx.JPY), platinum: round(platinumPer10gUSD * fx.JPY) },
  };
}

function getFallback(): AllCountryPrices {
  return {
    IN: { gold: 150144, silver: 250000, platinum: 32000 },
    CN: { gold: 10360, silver: 16170, platinum: 2200 },
    US: { gold: 1503, silver: 2347, platinum: 320 },
    EU: { gold: 1304, silver: 2036, platinum: 278 },
    JP: { gold: 239900, silver: 374600, platinum: 51000 },
  };
}

export async function fetchCurrentPrices(): Promise<MetalPrice[]> {
  if (cachedPrices && Date.now() - cachedAt < MEMORY_CACHE_TTL_MS) {
    return cachedPrices;
  }

  const [spot, fx] = await Promise.all([fetchLiveSpotPrices(), fetchExchangeRates()]);

  const all = spot && fx ? convertToLocalPrices(spot, fx) : getFallback();
  const source = spot && fx ? "live-api" : "fallback";
  const timestamp = new Date().toISOString();

  const prices: MetalPrice[] = [
    { metal: "gold", price_usd: round(all.US.gold), price_inr: round(all.IN.gold), price_cny: round(all.CN.gold), price_eur: round(all.EU.gold), price_jpy: round(all.JP.gold), timestamp, source },
    { metal: "silver", price_usd: round(all.US.silver), price_inr: round(all.IN.silver), price_cny: round(all.CN.silver), price_eur: round(all.EU.silver), price_jpy: round(all.JP.silver), timestamp, source },
    { metal: "platinum", price_usd: round(all.US.platinum), price_inr: round(all.IN.platinum), price_cny: round(all.CN.platinum), price_eur: round(all.EU.platinum), price_jpy: round(all.JP.platinum), timestamp, source },
  ];

  cachedPrices = prices;
  cachedAt = Date.now();
  return prices;
}

export function getMarketData(prices: MetalPrice[]): MarketData[] {
  const gold = prices.find((p) => p.metal === "gold");
  const silver = prices.find((p) => p.metal === "silver");
  const platinum = prices.find((p) => p.metal === "platinum");

  return [
    { country: "India", countryCode: "IN", currency: "INR", goldPrice: gold?.price_inr || 0, silverPrice: silver?.price_inr || 0, platinumPrice: platinum?.price_inr || 0, gdpGrowth: 6.5, inflation: 5.1, centralBankRate: 6.5 },
    { country: "China", countryCode: "CN", currency: "CNY", goldPrice: gold?.price_cny || 0, silverPrice: silver?.price_cny || 0, platinumPrice: platinum?.price_cny || 0, gdpGrowth: 4.8, inflation: 0.7, centralBankRate: 3.45 },
    { country: "United States", countryCode: "US", currency: "USD", goldPrice: gold?.price_usd || 0, silverPrice: silver?.price_usd || 0, platinumPrice: platinum?.price_usd || 0, gdpGrowth: 2.5, inflation: 3.2, centralBankRate: 5.25 },
    { country: "European Union", countryCode: "EU", currency: "EUR", goldPrice: gold?.price_eur || 0, silverPrice: silver?.price_eur || 0, platinumPrice: platinum?.price_eur || 0, gdpGrowth: 0.8, inflation: 2.6, centralBankRate: 4.5 },
    { country: "Japan", countryCode: "JP", currency: "JPY", goldPrice: gold?.price_jpy || 0, silverPrice: silver?.price_jpy || 0, platinumPrice: platinum?.price_jpy || 0, gdpGrowth: 1.1, inflation: 2.8, centralBankRate: 0.25 },
  ];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
