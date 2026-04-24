import { NewsArticle, MetalPrice } from "@/types";
import { aggregateAdvancedSentiment } from "./ml-sentiment";
import { isHFAvailable } from "./huggingface";

interface PredictionResult {
  predicted: number;
  low: number;
  high: number;
  confidence: number;
  dailyChangePercent: number;
  reasoning: string;
}

const REALISTIC_BOUNDS = {
  gold: {
    daily: { min: 0.001, max: 0.028, typical: 0.007 },
    weekly: { min: 0.004, max: 0.05, typical: 0.016 },
    monthly: { min: 0.012, max: 0.09, typical: 0.032 },
    quarterly: { min: 0.025, max: 0.14, typical: 0.055 },
  },
  silver: {
    daily: { min: 0.002, max: 0.04, typical: 0.011 },
    weekly: { min: 0.006, max: 0.065, typical: 0.024 },
    monthly: { min: 0.018, max: 0.12, typical: 0.042 },
    quarterly: { min: 0.035, max: 0.18, typical: 0.075 },
  },
  platinum: {
    daily: { min: 0.002, max: 0.03, typical: 0.009 },
    weekly: { min: 0.005, max: 0.055, typical: 0.02 },
    monthly: { min: 0.015, max: 0.10, typical: 0.04 },
    quarterly: { min: 0.03, max: 0.16, typical: 0.07 },
  },
};

function getTimeframeBounds(metal: string, daysAhead: number) {
  const bounds = REALISTIC_BOUNDS[metal as keyof typeof REALISTIC_BOUNDS] || REALISTIC_BOUNDS.gold;

  if (daysAhead <= 1) return bounds.daily;
  if (daysAhead <= 7) {
    const t = (daysAhead - 1) / 6;
    return {
      min: bounds.daily.min + (bounds.weekly.min - bounds.daily.min) * t,
      max: bounds.daily.max + (bounds.weekly.max - bounds.daily.max) * t,
      typical: bounds.daily.typical + (bounds.weekly.typical - bounds.daily.typical) * t,
    };
  }
  if (daysAhead <= 30) {
    const t = (daysAhead - 7) / 23;
    return {
      min: bounds.weekly.min + (bounds.monthly.min - bounds.weekly.min) * t,
      max: bounds.weekly.max + (bounds.monthly.max - bounds.weekly.max) * t,
      typical: bounds.weekly.typical + (bounds.monthly.typical - bounds.weekly.typical) * t,
    };
  }
  const t = Math.min(1, (daysAhead - 30) / 60);
  return {
    min: bounds.monthly.min + (bounds.quarterly.min - bounds.monthly.min) * t,
    max: bounds.monthly.max + (bounds.quarterly.max - bounds.monthly.max) * t,
    typical: bounds.monthly.typical + (bounds.quarterly.typical - bounds.monthly.typical) * t,
  };
}

// ── Technical Indicators (computed from whatever price history is available) ──

function computeRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) {
    if (prices.length >= 2) {
      const change = prices[prices.length - 1] - prices[0];
      return change > 0 ? 60 : change < 0 ? 40 : 50;
    }
    return 50;
  }

  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function computeMACD(prices: number[]): { macdLine: number; signal: number; histogram: number } {
  if (prices.length < 3) return { macdLine: 0, signal: 0, histogram: 0 };

  const ema = (data: number[], span: number) => {
    const k = 2 / (span + 1);
    let e = data[0];
    for (let i = 1; i < data.length; i++) {
      e = data[i] * k + e * (1 - k);
    }
    return e;
  };

  const shortSpan = Math.min(12, Math.max(3, Math.floor(prices.length * 0.4)));
  const longSpan = Math.min(26, Math.max(6, Math.floor(prices.length * 0.8)));
  const signalSpan = Math.min(9, Math.max(3, Math.floor(prices.length * 0.3)));

  const emaShort = ema(prices, shortSpan);
  const emaLong = ema(prices, longSpan);
  const macdLine = emaShort - emaLong;

  const recentPrices = prices.slice(-signalSpan);
  const signal = ema(recentPrices, signalSpan) - ema(recentPrices, Math.max(2, signalSpan - 2));

  return { macdLine, signal, histogram: macdLine - signal };
}

function computeBollingerBands(prices: number[], period = 20): { upper: number; middle: number; lower: number; percentB: number } {
  const effectivePeriod = Math.min(period, prices.length);
  const recent = prices.slice(-effectivePeriod);
  const middle = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / recent.length;
  const std = Math.sqrt(variance);
  const upper = middle + 2 * std;
  const lower = middle - 2 * std;
  const currentPrice = prices[prices.length - 1];
  const percentB = std > 0 ? (currentPrice - lower) / (upper - lower) : 0.5;

  return { upper, middle, lower, percentB };
}

// ── Indian Seasonality Model ──

function getIndianSeasonalFactor(metal: string, targetDate: Date): number {
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  if (metal === "gold" || metal === "silver") {
    // Wedding season (Oct-Feb) and festival demand spikes
    const MONTHLY_DEMAND_INDEX: Record<number, number> = {
      0: 0.010, // Jan — Makar Sankranti
      1: 0.003, // Feb — relatively quiet
      2: 0.005, // Mar — Gudi Padwa/Ugadi
      3: 0.008, // Apr — Akshaya Tritiya
      4: -0.005, // May — off-season
      5: -0.008, // Jun — monsoon, lower demand
      6: -0.006, // Jul — monsoon
      7: 0.002, // Aug — Janmashtami
      8: 0.004, // Sep — Navratri ramp-up
      9: 0.015, // Oct — Navratri + Dhanteras + Diwali peak
      10: 0.012, // Nov — post-Diwali wedding season
      11: 0.008, // Dec — wedding season continues
    };

    let factor = MONTHLY_DEMAND_INDEX[month] || 0;

    // Specific festival surges (modeled as localized demand spikes)
    const mmdd = `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const festivalBoosts: Record<string, number> = {
      "01-14": 0.003, // Makar Sankranti
      "04-26": 0.006, // Akshaya Tritiya
      "10-02": 0.004, // Navratri
      "10-12": 0.003, // Dussehra
      "10-29": 0.008, // Dhanteras
      "10-31": 0.005, // Diwali
      "11-02": 0.003, // Govardhan Puja
    };
    factor += festivalBoosts[mmdd] || 0;

    return factor * (metal === "silver" ? 0.7 : 1.0);
  }

  // Platinum: precious + industrial (catalytic converters, jewellery, hydrogen fuel cells)
  // Demand tracks auto production cycles and wedding season jewellery
  const platinumSeasonal: Record<number, number> = {
    0: 0.004, 1: 0.003, 2: 0.005, 3: 0.004,
    4: 0.002, 5: -0.002, 6: -0.003, 7: 0.001,
    8: 0.003, 9: 0.006, 10: 0.005, 11: 0.004,
  };
  return platinumSeasonal[month] || 0;
}

// ── Mean-reversion Signal ──

function computeMeanReversionSignal(prices: number[]): number {
  if (prices.length < 5) return 0;

  const recent = prices.slice(-20);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const current = prices[prices.length - 1];
  const deviation = (current - mean) / mean;

  // When price is far above mean, expect downward pull; below mean, upward pull
  // Strength of signal increases with deviation but asymptotically
  return -deviation * 0.3 * (1 - Math.exp(-Math.abs(deviation) * 10));
}

// ── Sentiment Analysis (enhanced) ──

function analyzeSentimentDirection(news: NewsArticle[], metal: string): {
  direction: number;
  strength: number;
  keyDrivers: string[];
} {
  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const keyDrivers: string[] = [];

  let direction = sentimentFeatures.overallScore;
  let strength = sentimentFeatures.intensity;

  const patterns: Array<{
    regex: RegExp;
    metalFilter?: string;
    directionAdj: number;
    strengthAdj: number;
    label: string;
  }> = [
    { regex: /war|military|attack|invasion|bomb|missile|troops|combat/i, directionAdj: 0.25, strengthAdj: 0.15, label: "war/conflict reports driving safe-haven demand", metalFilter: "gold" },
    { regex: /war|military|attack|invasion|bomb|missile|troops|combat/i, directionAdj: -0.10, strengthAdj: 0, label: "conflict reports creating supply uncertainty" },
    { regex: /inflation|cpi|price surge|cost of living|consumer prices/i, directionAdj: 0.15, strengthAdj: 0, label: "inflation reports — metals as hedge" },
    { regex: /federal reserve|fed rate|interest rate|rate hike|rate cut|powell|fomc|monetary policy/i, directionAdj: 0, strengthAdj: 0, label: "Fed policy signals" },
    { regex: /auto|automotive|vehicle|catalytic|hydrogen|fuel cell/i, directionAdj: 0.10, strengthAdj: 0.08, label: "auto/hydrogen reports — platinum demand driver", metalFilter: "platinum" },
    { regex: /dollar|dxy|greenback|usd strength|currency/i, directionAdj: 0, strengthAdj: 0, label: "USD reports — inverse correlation with metals" },
    { regex: /crisis|crash|collapse|panic|recession|depression|default|bankruptcy/i, directionAdj: 0.30, strengthAdj: 0.2, label: "crisis reports — flight to safety", metalFilter: "gold" },
    { regex: /crisis|crash|collapse|panic|recession|depression|default|bankruptcy/i, directionAdj: -0.15, strengthAdj: 0, label: "crisis reports — demand concerns" },
    { regex: /mining|production|supply|shortage|stockpile|inventory|output/i, directionAdj: 0.12, strengthAdj: 0, label: "supply disruption reports" },
    { regex: /tariff|trade war|import duty|protectionism|embargo/i, directionAdj: 0.10, strengthAdj: 0.08, label: "trade policy uncertainty" },
    { regex: /green energy|solar|ev|electric vehicle|renewable|clean energy|hydrogen/i, directionAdj: 0.10, strengthAdj: 0.06, label: "green energy/hydrogen driving platinum demand", metalFilter: "platinum" },
    { regex: /green energy|solar|ev|electric vehicle|renewable|clean energy/i, directionAdj: 0.06, strengthAdj: 0.03, label: "green energy driving silver demand", metalFilter: "silver" },
    { regex: /central bank.*buy|reserve.*gold|official.*purchase/i, directionAdj: 0.18, strengthAdj: 0.1, label: "central bank gold buying", metalFilter: "gold" },
  ];

  for (const pattern of patterns) {
    if (pattern.metalFilter && pattern.metalFilter !== metal) continue;

    const matching = news.filter(n => pattern.regex.test(n.title + " " + n.description));
    if (matching.length < 2) continue;

    const avgSentiment = matching.reduce((s, n) => s + n.sentiment, 0) / matching.length;

    if (pattern.label.includes("Fed")) {
      if (avgSentiment > 0.1) { direction -= 0.15; keyDrivers.push(`${matching.length} hawkish Fed signals`); }
      else if (avgSentiment < -0.1) { direction += 0.20; keyDrivers.push(`${matching.length} dovish Fed signals`); }
    } else if (pattern.label.includes("USD")) {
      direction -= avgSentiment * 0.2;
      if (Math.abs(avgSentiment) > 0.15) keyDrivers.push(`${matching.length} ${pattern.label}`);
    } else if (pattern.label.includes("supply")) {
      if (avgSentiment < -0.1) { direction += pattern.directionAdj; keyDrivers.push(`${matching.length} ${pattern.label}`); }
    } else {
      direction += pattern.directionAdj;
      strength += pattern.strengthAdj;
      keyDrivers.push(`${matching.length} ${pattern.label}`);
    }
  }

  direction = Math.max(-1, Math.min(1, direction));
  strength = Math.max(0.25, Math.min(1, strength));

  return { direction, strength, keyDrivers };
}

function calculateVolatilityFromNews(news: NewsArticle[]): number {
  if (news.length < 5) return 0.5;

  const sentiments = news.map(n => n.sentiment);
  const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
  const stdDev = Math.sqrt(variance);

  const extremeNews = news.filter(n => Math.abs(n.sentiment) > 0.5).length;
  const extremeRatio = extremeNews / news.length;

  return Math.min(1, stdDev * 2 + extremeRatio * 0.5);
}

// ── Core Prediction Engine ──

function calculatePriceChange(
  direction: number,
  strength: number,
  volatility: number,
  metal: string,
  daysAhead: number,
  technicalBias: number,
  meanReversionSignal: number,
  seasonalFactor: number
): number {
  const bounds = getTimeframeBounds(metal, daysAhead);
  const baseMove = bounds.typical;
  const maxMove = bounds.max;
  const minMove = bounds.min;

  // Weighted blend of signals
  const sentimentWeight = 0.35;
  const technicalWeight = 0.25;
  const meanRevWeight = 0.15;
  const seasonalWeight = 0.10;
  const momentumWeight = 0.15;

  const sentimentSignal = direction * (0.5 + strength * 0.8);
  const momentumSignal = direction * strength * 0.5;

  const blendedDirection =
    sentimentSignal * sentimentWeight +
    technicalBias * technicalWeight +
    meanReversionSignal * meanRevWeight +
    seasonalFactor * 10 * seasonalWeight + // scale seasonal to comparable magnitude
    momentumSignal * momentumWeight;

  const volatilityMultiplier = 0.7 + volatility * 0.6;

  let change = baseMove * blendedDirection * volatilityMultiplier;

  // Time-scaling with square-root-of-time (standard financial model)
  if (daysAhead > 1) {
    change *= Math.sqrt(daysAhead);
  }

  const sign = change >= 0 ? 1 : -1;
  const absChange = Math.abs(change);
  const constrainedChange = Math.max(minMove, Math.min(maxMove, absChange));

  return sign * constrainedChange;
}

export function smartPredict(
  currentPrice: number,
  daysAhead: number,
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string
): PredictionResult {
  const { direction, strength, keyDrivers } = analyzeSentimentDirection(news, metal);
  const volatility = calculateVolatilityFromNews(news);

  // Technical indicators from available price data
  const metalPrices = prices
    .filter(p => p.metal === metal)
    .map(p => p.price_usd);

  const rsi = computeRSI(metalPrices);
  const macd = computeMACD(metalPrices);
  const bollinger = computeBollingerBands(metalPrices);
  const meanReversion = computeMeanReversionSignal(metalPrices);

  // Derive technical bias from indicators
  let technicalBias = 0;
  // RSI: overbought (>70) = bearish, oversold (<30) = bullish
  technicalBias += (50 - rsi) / 100;
  // MACD histogram > 0 = bullish momentum
  if (currentPrice > 0) {
    technicalBias += (macd.histogram / currentPrice) * 50;
  }
  // Bollinger %B: above 0.8 = overbought, below 0.2 = oversold
  technicalBias += (0.5 - bollinger.percentB) * 0.3;

  technicalBias = Math.max(-0.5, Math.min(0.5, technicalBias));

  // Seasonality for target date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  const seasonalFactor = getIndianSeasonalFactor(metal, targetDate);

  const priceChange = calculatePriceChange(
    direction, strength, volatility, metal, daysAhead,
    technicalBias, meanReversion, seasonalFactor
  );

  const predicted = currentPrice * (1 + priceChange);

  // Asymmetric confidence bands: wider downside during bearish, wider upside during bullish
  const bounds = getTimeframeBounds(metal, daysAhead);
  const uncertaintyBase = bounds.typical * 1.2;
  const uncertaintyMultiplier = 1 + volatility * 0.5;
  const timeUncertainty = Math.sqrt(daysAhead / 7);
  const uncertainty = uncertaintyBase * uncertaintyMultiplier * timeUncertainty;

  const asymmetry = direction * 0.15;
  const low = currentPrice * (1 + priceChange - uncertainty * (1 + asymmetry));
  const high = currentPrice * (1 + priceChange + uncertainty * (1 - asymmetry));

  // Confidence scoring
  const newsVolume = Math.min(1, news.length / 80);
  let confidence =
    0.42 +
    newsVolume * 0.12 +
    strength * 0.12 +
    (1 - volatility * 0.25) * 0.10 +
    (Math.abs(technicalBias) > 0.1 ? 0.05 : 0);

  if (isHFAvailable()) confidence += 0.10;

  // Decay confidence for longer horizons
  confidence *= Math.exp(-daysAhead / 120);
  confidence = Math.max(0.38, Math.min(0.85, confidence));

  const directionText = direction > 0.15 ? "bullish" : direction < -0.15 ? "bearish" : "slightly " + (direction > 0 ? "bullish" : "bearish");
  const changePercent = (priceChange * 100).toFixed(2);
  const techSummary = rsi > 65 ? "RSI overbought" : rsi < 35 ? "RSI oversold" : "RSI neutral";
  const reasoning = `${directionText} outlook (${priceChange > 0 ? "+" : ""}${changePercent}%). ${techSummary}. ${keyDrivers.slice(0, 2).join(". ")}${keyDrivers.length > 0 ? "." : ""} Based on ${news.length} articles.`;

  return {
    predicted: Math.round(predicted * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    dailyChangePercent: Math.round((priceChange / Math.max(1, daysAhead)) * 10000) / 100,
    reasoning,
  };
}

export function ensembleSmartPredict(
  currentPrice: number,
  daysAhead: number,
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string,
  iterations: number = 5
): PredictionResult {
  const predictions: PredictionResult[] = [];

  // Full-data primary prediction (highest weight)
  predictions.push(smartPredict(currentPrice, daysAhead, news, prices, metal));

  // Bootstrap-sampled ensemble members with varying sample ratios
  const sampleRatios = [0.85, 0.75, 0.65, 0.55];
  for (let i = 0; i < Math.min(iterations - 1, sampleRatios.length); i++) {
    const sampleSize = Math.floor(news.length * sampleRatios[i]);
    const sampledNews = [...news]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(5, sampleSize));

    predictions.push(smartPredict(currentPrice, daysAhead, sampledNews, prices, metal));
  }

  // Weighted averaging: primary gets highest weight, then decreasing
  const weights = [0.40, 0.20, 0.15, 0.13, 0.12].slice(0, predictions.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let weightedPredicted = 0;
  let weightedConfidence = 0;

  for (let i = 0; i < predictions.length; i++) {
    const w = weights[i] / totalWeight;
    weightedPredicted += predictions[i].predicted * w;
    weightedConfidence += predictions[i].confidence * w;
  }

  // Use percentile-based bands from ensemble for more robust low/high
  const sortedPredicted = predictions.map(p => p.predicted).sort((a, b) => a - b);
  const sortedLows = predictions.map(p => p.low).sort((a, b) => a - b);
  const sortedHighs = predictions.map(p => p.high).sort((a, b) => a - b);

  // 10th percentile for low, 90th for high
  const lowIdx = Math.floor(sortedLows.length * 0.1);
  const highIdx = Math.min(sortedHighs.length - 1, Math.ceil(sortedHighs.length * 0.9));

  return {
    predicted: Math.round(weightedPredicted * 100) / 100,
    low: Math.round(sortedLows[lowIdx] * 100) / 100,
    high: Math.round(sortedHighs[highIdx] * 100) / 100,
    confidence: Math.round(weightedConfidence * 100) / 100,
    dailyChangePercent: predictions[0].dailyChangePercent,
    reasoning: predictions[0].reasoning,
  };
}

// ── Exported for Auspicious Date Predictions ──

export function predictForDate(
  currentPrice: number,
  targetDate: Date,
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string
): { predicted: number; low: number; high: number; changePercent: number } {
  const now = new Date();
  const daysAhead = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const result = ensembleSmartPredict(currentPrice, daysAhead, news, prices, metal, 3);
  const changePercent = currentPrice > 0 ? ((result.predicted - currentPrice) / currentPrice) * 100 : 0;
  return {
    predicted: result.predicted,
    low: result.low,
    high: result.high,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}
