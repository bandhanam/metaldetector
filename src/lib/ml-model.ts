import { SimpleLinearRegression } from "ml-regression-simple-linear";
import { NewsArticle, MetalPrice } from "@/types";
import { aggregateAdvancedSentiment, calculateNewsVolatility } from "./ml-sentiment";

export { aggregateAdvancedSentiment } from "./ml-sentiment";

interface MLFeatures {
  sentiment: number;
  sentimentIntensity: number;
  newsVolume: number;
  newsVolatility: number;
  geopoliticalRisk: number;
  economicStrength: number;
  marketImpact: number;
  urgency: number;
  dayOfWeek: number;
  monthOfYear: number;
}

interface PriceMovement {
  direction: "up" | "down" | "neutral";
  magnitude: number;
  confidence: number;
}

export function extractMLFeatures(
  news: NewsArticle[],
  metal: string,
  daysAhead: number
): MLFeatures {
  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const newsVolatility = calculateNewsVolatility(news);
  
  const relevantNews = news.filter(
    (a) => a.relevantMetals.includes(metal) || a.relevantMetals.length === 0
  );

  const now = new Date();
  const targetDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return {
    sentiment: sentimentFeatures.overallScore,
    sentimentIntensity: sentimentFeatures.intensity,
    newsVolume: Math.min(1, relevantNews.length / 100),
    newsVolatility,
    geopoliticalRisk: sentimentFeatures.geopoliticalRisk,
    economicStrength: sentimentFeatures.economicStrength,
    marketImpact: sentimentFeatures.marketImpact,
    urgency: sentimentFeatures.urgency,
    dayOfWeek: targetDate.getDay() / 7,
    monthOfYear: targetDate.getMonth() / 12,
  };
}

function calculateFeatureScore(features: MLFeatures, metal: string): number {
  const weights = {
    gold: {
      sentiment: 0.25,
      geopoliticalRisk: 0.20,
      economicStrength: -0.15,
      newsVolatility: 0.10,
      marketImpact: 0.15,
      urgency: 0.10,
      newsVolume: 0.05,
    },
    silver: {
      sentiment: 0.22,
      geopoliticalRisk: 0.15,
      economicStrength: 0.18,
      newsVolatility: 0.12,
      marketImpact: 0.15,
      urgency: 0.10,
      newsVolume: 0.08,
    },
    copper: {
      sentiment: 0.20,
      geopoliticalRisk: 0.05,
      economicStrength: 0.30,
      newsVolatility: 0.10,
      marketImpact: 0.15,
      urgency: 0.12,
      newsVolume: 0.08,
    },
  };

  const metalWeights = weights[metal as keyof typeof weights] || weights.gold;

  let score = 0;
  score += features.sentiment * metalWeights.sentiment;
  score += features.geopoliticalRisk * metalWeights.geopoliticalRisk;
  score += features.economicStrength * metalWeights.economicStrength;
  score += features.newsVolatility * metalWeights.newsVolatility;
  score += features.marketImpact * metalWeights.marketImpact;
  score += features.urgency * metalWeights.urgency;
  score += features.newsVolume * metalWeights.newsVolume;

  score = score * (1 + features.sentimentIntensity * 0.3);

  return score;
}

function predictMovement(
  features: MLFeatures,
  metal: string,
  daysAhead: number
): PriceMovement {
  const baseScore = calculateFeatureScore(features, metal);
  
  const timeDecay = Math.exp(-daysAhead / 30);
  const adjustedScore = baseScore * timeDecay;

  const volatilityBoost = features.newsVolatility * 0.5;
  const geopoliticalBoost = features.geopoliticalRisk * 0.3;
  
  const magnitude = Math.abs(adjustedScore) * (1 + volatilityBoost + geopoliticalBoost);

  const direction = adjustedScore > 0.02 ? "up" : adjustedScore < -0.02 ? "down" : "neutral";

  const baseConfidence = 0.5 + features.newsVolume * 0.2 + features.sentimentIntensity * 0.15;
  const uncertaintyPenalty = features.newsVolatility * 0.2;
  const confidence = Math.max(0.3, Math.min(0.95, baseConfidence - uncertaintyPenalty));

  return {
    direction,
    magnitude: Math.min(0.15, magnitude),
    confidence,
  };
}

export function mlPredictPrice(
  currentPrice: number,
  daysAhead: number,
  news: NewsArticle[],
  metal: string,
  historicalVolatility: number
): { predicted: number; low: number; high: number; confidence: number } {
  const features = extractMLFeatures(news, metal, daysAhead);
  const movement = predictMovement(features, metal, daysAhead);

  let priceChange = 0;

  if (movement.direction === "up") {
    priceChange = movement.magnitude;
  } else if (movement.direction === "down") {
    priceChange = -movement.magnitude;
  } else {
    priceChange = movement.magnitude * 0.3 * (Math.random() > 0.5 ? 1 : -1);
  }

  const timeVolatility = historicalVolatility * Math.sqrt(daysAhead / 7);
  const newsVolatility = features.newsVolatility * 0.02 * Math.sqrt(daysAhead);
  const totalVolatility = timeVolatility + newsVolatility;

  const predicted = currentPrice * (1 + priceChange);
  const low = currentPrice * (1 + priceChange - 1.96 * totalVolatility);
  const high = currentPrice * (1 + priceChange + 1.96 * totalVolatility);

  return {
    predicted: Math.round(predicted * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    confidence: movement.confidence,
  };
}

export function calculateHistoricalVolatility(
  prices: MetalPrice[],
  metal: string
): number {
  const metalPrices = prices.filter((p) => p.metal === metal);
  
  if (metalPrices.length < 2) {
    const defaults: Record<string, number> = {
      gold: 0.025,
      silver: 0.035,
      copper: 0.028,
    };
    return defaults[metal] || 0.025;
  }

  const returns: number[] = [];
  for (let i = 1; i < metalPrices.length; i++) {
    const prevPrice = metalPrices[i - 1].price_usd;
    const currPrice = metalPrices[i].price_usd;
    if (prevPrice > 0) {
      returns.push((currPrice - prevPrice) / prevPrice);
    }
  }

  if (returns.length === 0) {
    return 0.025;
  }

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0.01, Math.min(0.1, stdDev));
}

export function buildRegressionModel(
  historicalData: Array<{ features: MLFeatures; actualChange: number }>
): (features: MLFeatures) => number {
  if (historicalData.length < 5) {
    return (features: MLFeatures) => features.sentiment * 0.05;
  }

  const X = historicalData.map((d) => {
    return (
      d.features.sentiment * 0.3 +
      d.features.geopoliticalRisk * 0.2 +
      d.features.economicStrength * 0.15 +
      d.features.marketImpact * 0.15 +
      d.features.newsVolatility * 0.1 +
      d.features.urgency * 0.1
    );
  });
  const y = historicalData.map((d) => d.actualChange);

  try {
    const regression = new SimpleLinearRegression(X, y);
    return (features: MLFeatures) => {
      const x =
        features.sentiment * 0.3 +
        features.geopoliticalRisk * 0.2 +
        features.economicStrength * 0.15 +
        features.marketImpact * 0.15 +
        features.newsVolatility * 0.1 +
        features.urgency * 0.1;
      return regression.predict(x);
    };
  } catch {
    return (features: MLFeatures) => features.sentiment * 0.05;
  }
}
