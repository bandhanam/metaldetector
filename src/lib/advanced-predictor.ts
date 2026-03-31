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
    daily: { min: 0.002, max: 0.025, typical: 0.008 },
    weekly: { min: 0.005, max: 0.045, typical: 0.018 },
    monthly: { min: 0.015, max: 0.08, typical: 0.035 },
    quarterly: { min: 0.03, max: 0.12, typical: 0.06 },
  },
  silver: {
    daily: { min: 0.003, max: 0.035, typical: 0.012 },
    weekly: { min: 0.008, max: 0.06, typical: 0.025 },
    monthly: { min: 0.02, max: 0.10, typical: 0.045 },
    quarterly: { min: 0.04, max: 0.15, typical: 0.08 },
  },
  copper: {
    daily: { min: 0.002, max: 0.03, typical: 0.01 },
    weekly: { min: 0.006, max: 0.05, typical: 0.02 },
    monthly: { min: 0.015, max: 0.09, typical: 0.04 },
    quarterly: { min: 0.035, max: 0.14, typical: 0.07 },
  },
};

function getTimeframeBounds(metal: string, daysAhead: number) {
  const bounds = REALISTIC_BOUNDS[metal as keyof typeof REALISTIC_BOUNDS] || REALISTIC_BOUNDS.gold;
  
  if (daysAhead <= 1) return bounds.daily;
  if (daysAhead <= 7) return bounds.weekly;
  if (daysAhead <= 30) return bounds.monthly;
  return bounds.quarterly;
}

function analyzeSentimentDirection(news: NewsArticle[], metal: string): {
  direction: number;
  strength: number;
  keyDrivers: string[];
} {
  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const keyDrivers: string[] = [];
  
  let direction = sentimentFeatures.overallScore;
  let strength = sentimentFeatures.intensity;

  const warNews = news.filter(n => 
    /war|military|attack|invasion|bomb|missile|troops|combat/i.test(n.title + n.description)
  );
  if (warNews.length > 3) {
    if (metal === "gold") {
      direction += 0.25;
      strength += 0.15;
      keyDrivers.push(`${warNews.length} war/conflict reports driving safe-haven demand`);
    } else {
      direction -= 0.1;
      keyDrivers.push(`${warNews.length} conflict reports creating supply uncertainty`);
    }
  }

  const inflationNews = news.filter(n =>
    /inflation|cpi|price surge|cost of living|consumer prices/i.test(n.title + n.description)
  );
  if (inflationNews.length > 2) {
    const inflationSentiment = inflationNews.reduce((s, n) => s + n.sentiment, 0) / inflationNews.length;
    if (metal === "gold" || metal === "silver") {
      direction += inflationSentiment > 0 ? 0.18 : 0.08;
      keyDrivers.push(`${inflationNews.length} inflation reports - metals as hedge`);
    }
  }

  const fedNews = news.filter(n =>
    /federal reserve|fed rate|interest rate|rate hike|rate cut|powell|fomc|monetary policy/i.test(n.title + n.description)
  );
  if (fedNews.length > 2) {
    const fedSentiment = fedNews.reduce((s, n) => s + n.sentiment, 0) / fedNews.length;
    if (fedSentiment > 0.1) {
      direction -= 0.15;
      keyDrivers.push(`${fedNews.length} hawkish Fed signals pressuring metals`);
    } else if (fedSentiment < -0.1) {
      direction += 0.2;
      keyDrivers.push(`${fedNews.length} dovish Fed signals supporting metals`);
    }
  }

  const chinaNews = news.filter(n =>
    /china|chinese|beijing|shanghai|yuan|renminbi/i.test(n.title + n.description)
  );
  if (chinaNews.length > 3 && metal === "copper") {
    const chinaSentiment = chinaNews.reduce((s, n) => s + n.sentiment, 0) / chinaNews.length;
    direction += chinaSentiment * 0.4;
    strength += 0.1;
    keyDrivers.push(`${chinaNews.length} China reports - major copper consumer`);
  }

  const dollarNews = news.filter(n =>
    /dollar|dxy|greenback|usd strength|currency/i.test(n.title + n.description)
  );
  if (dollarNews.length > 2) {
    const dollarSentiment = dollarNews.reduce((s, n) => s + n.sentiment, 0) / dollarNews.length;
    direction -= dollarSentiment * 0.2;
    if (Math.abs(dollarSentiment) > 0.15) {
      keyDrivers.push(`${dollarNews.length} USD reports - inverse correlation with metals`);
    }
  }

  const crisisNews = news.filter(n =>
    /crisis|crash|collapse|panic|recession|depression|default|bankruptcy/i.test(n.title + n.description)
  );
  if (crisisNews.length > 2) {
    if (metal === "gold") {
      direction += 0.3;
      strength += 0.2;
      keyDrivers.push(`${crisisNews.length} crisis reports - flight to safety`);
    } else {
      direction -= 0.15;
      keyDrivers.push(`${crisisNews.length} crisis reports - demand concerns`);
    }
  }

  const supplyNews = news.filter(n =>
    /mining|production|supply|shortage|stockpile|inventory|output/i.test(n.title + n.description)
  );
  if (supplyNews.length > 2) {
    const supplySentiment = supplyNews.reduce((s, n) => s + n.sentiment, 0) / supplyNews.length;
    if (supplySentiment < -0.1) {
      direction += 0.12;
      keyDrivers.push(`${supplyNews.length} supply disruption reports`);
    }
  }

  direction = Math.max(-1, Math.min(1, direction));
  strength = Math.max(0.3, Math.min(1, strength));

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

function calculatePriceChange(
  direction: number,
  strength: number,
  volatility: number,
  metal: string,
  daysAhead: number
): number {
  const bounds = getTimeframeBounds(metal, daysAhead);
  
  const baseMove = bounds.typical;
  const maxMove = bounds.max;
  const minMove = bounds.min;

  const directionMultiplier = direction;
  const strengthMultiplier = 0.5 + strength * 0.8;
  const volatilityMultiplier = 0.7 + volatility * 0.6;

  let change = baseMove * directionMultiplier * strengthMultiplier * volatilityMultiplier;

  if (daysAhead > 1 && daysAhead <= 7) {
    change *= Math.sqrt(daysAhead);
  } else if (daysAhead > 7) {
    change *= Math.sqrt(7) + Math.log(daysAhead / 7) * 0.5;
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

  const priceChange = calculatePriceChange(direction, strength, volatility, metal, daysAhead);

  const predicted = currentPrice * (1 + priceChange);

  const bounds = getTimeframeBounds(metal, daysAhead);
  const uncertaintyBase = bounds.typical * 1.5;
  const uncertaintyMultiplier = 1 + volatility * 0.5;
  const timeUncertainty = Math.sqrt(daysAhead / 7);
  
  const uncertainty = uncertaintyBase * uncertaintyMultiplier * timeUncertainty;

  const low = currentPrice * (1 + priceChange - uncertainty);
  const high = currentPrice * (1 + priceChange + uncertainty);

  const newsVolume = Math.min(1, news.length / 80);
  let confidence = 0.45 + newsVolume * 0.15 + strength * 0.15 + (1 - volatility * 0.3) * 0.1;
  
  if (isHFAvailable()) confidence += 0.1;
  
  confidence *= Math.exp(-daysAhead / 90);
  confidence = Math.max(0.4, Math.min(0.85, confidence));

  const directionText = direction > 0.15 ? "bullish" : direction < -0.15 ? "bearish" : "slightly " + (direction > 0 ? "bullish" : "bearish");
  const changePercent = (priceChange * 100).toFixed(2);
  const reasoning = `${directionText} outlook (${priceChange > 0 ? "+" : ""}${changePercent}%). ${keyDrivers.slice(0, 2).join(". ")}${keyDrivers.length > 0 ? "." : ""} Based on ${news.length} news articles.`;

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
  iterations: number = 3
): PredictionResult {
  const predictions: PredictionResult[] = [];

  predictions.push(smartPredict(currentPrice, daysAhead, news, prices, metal));

  for (let i = 1; i < iterations; i++) {
    const sampleSize = Math.floor(news.length * (0.75 + Math.random() * 0.2));
    const sampledNews = [...news]
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize);

    predictions.push(smartPredict(currentPrice, daysAhead, sampledNews, prices, metal));
  }

  const weights = [0.5, 0.3, 0.2].slice(0, iterations);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let weightedPredicted = 0;
  let weightedConfidence = 0;

  for (let i = 0; i < predictions.length; i++) {
    const w = weights[i] / totalWeight;
    weightedPredicted += predictions[i].predicted * w;
    weightedConfidence += predictions[i].confidence * w;
  }

  const allLows = predictions.map(p => p.low);
  const allHighs = predictions.map(p => p.high);

  return {
    predicted: Math.round(weightedPredicted * 100) / 100,
    low: Math.round(Math.min(...allLows) * 100) / 100,
    high: Math.round(Math.max(...allHighs) * 100) / 100,
    confidence: Math.round(weightedConfidence * 100) / 100,
    dailyChangePercent: predictions[0].dailyChangePercent,
    reasoning: predictions[0].reasoning,
  };
}
