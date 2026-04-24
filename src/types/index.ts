export interface MetalPrice {
  metal: "gold" | "silver" | "copper";
  price_usd: number;
  price_inr: number;
  price_cny: number;
  price_eur: number;
  price_jpy: number;
  timestamp: string;
  source: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: number;
  relevantMetals: string[];
  relevantCountries: string[];
}

export interface PricePrediction {
  metal: "gold" | "silver" | "copper";
  currentPrice: number;
  predictions: TimeframePrediction[];
  confidence: number;
  sentimentScore: number;
  factors: PredictionFactor[];
}

export interface TimeframePrediction {
  label: string;
  date: string;
  predictedPrice: number;
  low: number;
  high: number;
  changePercent: number;
}

export interface PredictionFactor {
  name: string;
  impact: "bullish" | "bearish" | "neutral";
  weight: number;
  description: string;
}

export interface MarketData {
  country: string;
  countryCode: string;
  currency: string;
  goldPrice: number;
  silverPrice: number;
  copperPrice: number;
  gdpGrowth: number;
  inflation: number;
  centralBankRate: number;
}

export interface AuspiciousDatePrediction {
  date: string;
  name: string;
  daysAway: number;
  goldPredicted: number;
  goldLow: number;
  goldHigh: number;
  goldChangePercent: number;
  silverPredicted: number;
  silverChangePercent: number;
}

export interface DashboardData {
  prices: MetalPrice[];
  predictions: PricePrediction[];
  news: NewsArticle[];
  markets: MarketData[];
  auspiciousPredictions: AuspiciousDatePrediction[];
  lastUpdated: string;
}
