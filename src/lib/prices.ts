import { MetalPrice, MarketData } from "@/types";

const TROY_OZ_TO_GRAMS = 31.1035;
const LB_TO_KG = 2.20462;

interface AllCountryPrices {
  IN: { gold: number; silver: number; copper: number };
  CN: { gold: number; silver: number; copper: number };
  US: { gold: number; silver: number; copper: number };
  EU: { gold: number; silver: number; copper: number };
  JP: { gold: number; silver: number; copper: number };
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
  copper_per_lb: number;
}

// ─── Fetch LIVE spot prices from MetalMetric (free, no key, 60s refresh) ───
async function fetchLiveSpotPrices(): Promise<MetalSpotUSD | null> {
  try {
    const res = await fetch(
      "https://metalmetric.com/api/gpt?action=spot_prices&metal=all",
      { signal: AbortSignal.timeout(8000), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("[PRICES] MetalMetric API error:", res.status);
      return null;
    }
    const data = await res.json();
    const p = data?.prices;
    if (!p?.gold?.price_per_oz || !p?.silver?.price_per_oz || !p?.copper?.price_per_lb) {
      console.error("[PRICES] MetalMetric unexpected shape:", data);
      return null;
    }
    console.log(`[PRICES] Live spot → Gold $${p.gold.price_per_oz}/oz, Silver $${p.silver.price_per_oz}/oz, Copper $${p.copper.price_per_lb}/lb`);
    return {
      gold_per_oz: p.gold.price_per_oz,
      silver_per_oz: p.silver.price_per_oz,
      copper_per_lb: p.copper.price_per_lb,
    };
  } catch (err) {
    console.error("[PRICES] MetalMetric fetch error:", err);
    return null;
  }
}

// ─── Fetch live exchange rates (free, no key) ───
async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { signal: AbortSignal.timeout(8000), cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.rates;
    if (!r?.INR || !r?.CNY || !r?.EUR || !r?.JPY) return null;
    return { INR: r.INR, CNY: r.CNY, EUR: r.EUR, JPY: r.JPY };
  } catch (err) {
    console.error("[PRICES] Exchange rate fetch error:", err);
    return null;
  }
}

// Output units: Gold per 10g, Silver per kg, Copper per kg
function convertToLocalPrices(spot: MetalSpotUSD, fx: ExchangeRates): AllCountryPrices {
  const goldPer10gUSD = (spot.gold_per_oz / TROY_OZ_TO_GRAMS) * 10;
  const silverPerKgUSD = (spot.silver_per_oz / TROY_OZ_TO_GRAMS) * 1000;
  const copperPerKgUSD = spot.copper_per_lb * LB_TO_KG;

  // India: ~10% import duty + 3% GST + ~2% premium
  const INDIA_PREMIUM = 1.15;

  return {
    US: {
      gold: round(goldPer10gUSD),
      silver: round(silverPerKgUSD),
      copper: round(copperPerKgUSD),
    },
    IN: {
      gold: round(goldPer10gUSD * fx.INR * INDIA_PREMIUM),
      silver: round(silverPerKgUSD * fx.INR * INDIA_PREMIUM),
      copper: round(copperPerKgUSD * fx.INR * INDIA_PREMIUM),
    },
    CN: {
      gold: round(goldPer10gUSD * fx.CNY),
      silver: round(silverPerKgUSD * fx.CNY),
      copper: round(copperPerKgUSD * fx.CNY),
    },
    EU: {
      gold: round(goldPer10gUSD * fx.EUR),
      silver: round(silverPerKgUSD * fx.EUR),
      copper: round(copperPerKgUSD * fx.EUR),
    },
    JP: {
      gold: round(goldPer10gUSD * fx.JPY),
      silver: round(silverPerKgUSD * fx.JPY),
      copper: round(copperPerKgUSD * fx.JPY),
    },
  };
}

function getFallback(): AllCountryPrices {
  return {
    IN: { gold: 149000, silver: 235000, copper: 920 },
    CN: { gold: 12000, silver: 20000, copper: 78 },
    US: { gold: 1650, silver: 2750, copper: 11 },
    EU: { gold: 1500, silver: 2500, copper: 10 },
    JP: { gold: 248000, silver: 415000, copper: 2000 },
  };
}

// ─── Main: Always fetch live, fallback only on failure ───
export async function fetchCurrentPrices(): Promise<MetalPrice[]> {
  let all: AllCountryPrices;
  let source: string;

  const [spot, fx] = await Promise.all([fetchLiveSpotPrices(), fetchExchangeRates()]);

  if (spot && fx) {
    all = convertToLocalPrices(spot, fx);
    source = "live-api";
  } else {
    all = getFallback();
    source = "fallback";
    console.warn("[PRICES] Live APIs failed, using fallback prices");
  }

  const timestamp = new Date().toISOString();

  return [
    {
      metal: "gold",
      price_usd: round(all.US.gold),
      price_inr: round(all.IN.gold),
      price_cny: round(all.CN.gold),
      price_eur: round(all.EU.gold),
      price_jpy: round(all.JP.gold),
      timestamp,
      source,
    },
    {
      metal: "silver",
      price_usd: round(all.US.silver),
      price_inr: round(all.IN.silver),
      price_cny: round(all.CN.silver),
      price_eur: round(all.EU.silver),
      price_jpy: round(all.JP.silver),
      timestamp,
      source,
    },
    {
      metal: "copper",
      price_usd: round(all.US.copper),
      price_inr: round(all.IN.copper),
      price_cny: round(all.CN.copper),
      price_eur: round(all.EU.copper),
      price_jpy: round(all.JP.copper),
      timestamp,
      source,
    },
  ];
}

export function getMarketData(prices: MetalPrice[]): MarketData[] {
  const gold = prices.find((p) => p.metal === "gold");
  const silver = prices.find((p) => p.metal === "silver");
  const copper = prices.find((p) => p.metal === "copper");

  return [
    {
      country: "India", countryCode: "IN", currency: "INR",
      goldPrice: gold?.price_inr || 0, silverPrice: silver?.price_inr || 0, copperPrice: copper?.price_inr || 0,
      gdpGrowth: 6.5, inflation: 5.1, centralBankRate: 6.5,
    },
    {
      country: "China", countryCode: "CN", currency: "CNY",
      goldPrice: gold?.price_cny || 0, silverPrice: silver?.price_cny || 0, copperPrice: copper?.price_cny || 0,
      gdpGrowth: 4.8, inflation: 0.7, centralBankRate: 3.45,
    },
    {
      country: "United States", countryCode: "US", currency: "USD",
      goldPrice: gold?.price_usd || 0, silverPrice: silver?.price_usd || 0, copperPrice: copper?.price_usd || 0,
      gdpGrowth: 2.5, inflation: 3.2, centralBankRate: 5.25,
    },
    {
      country: "European Union", countryCode: "EU", currency: "EUR",
      goldPrice: gold?.price_eur || 0, silverPrice: silver?.price_eur || 0, copperPrice: copper?.price_eur || 0,
      gdpGrowth: 0.8, inflation: 2.6, centralBankRate: 4.5,
    },
    {
      country: "Japan", countryCode: "JP", currency: "JPY",
      goldPrice: gold?.price_jpy || 0, silverPrice: silver?.price_jpy || 0, copperPrice: copper?.price_jpy || 0,
      gdpGrowth: 1.1, inflation: 2.8, centralBankRate: 0.25,
    },
  ];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
