import { HfInference } from "@huggingface/inference";
import { NewsArticle } from "@/types";

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || "";

let hf: HfInference | null = null;

function getHfClient(): HfInference | null {
  if (!HF_TOKEN) return null;
  if (!hf) {
    hf = new HfInference(HF_TOKEN);
  }
  return hf;
}

export interface HFSentimentResult {
  label: string;
  score: number;
}

export async function analyzeSentimentWithHF(
  text: string
): Promise<{ sentiment: number; confidence: number } | null> {
  const client = getHfClient();
  if (!client) return null;

  try {
    const result = await client.textClassification({
      model: "ProsusAI/finbert",
      inputs: text.slice(0, 512),
    });

    if (Array.isArray(result) && result.length > 0) {
      const topResult = result[0] as HFSentimentResult;
      
      let sentiment = 0;
      if (topResult.label === "positive") sentiment = topResult.score;
      else if (topResult.label === "negative") sentiment = -topResult.score;
      
      return {
        sentiment,
        confidence: topResult.score,
      };
    }
  } catch (error) {
    console.warn("HF sentiment analysis failed:", error);
  }

  return null;
}

export async function batchAnalyzeSentiment(
  articles: NewsArticle[]
): Promise<Map<string, { sentiment: number; confidence: number }>> {
  const results = new Map<string, { sentiment: number; confidence: number }>();
  const client = getHfClient();
  
  if (!client) return results;

  const batches: NewsArticle[][] = [];
  const batchSize = 10;
  for (let i = 0; i < articles.length; i += batchSize) {
    batches.push(articles.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async (article) => {
      const text = `${article.title}. ${article.description}`.slice(0, 512);
      const result = await analyzeSentimentWithHF(text);
      if (result) {
        results.set(article.url, result);
      }
    });

    await Promise.allSettled(promises);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}

export interface TimeSeriesFeatures {
  trend: number;
  seasonality: number;
  volatility: number;
  momentum: number;
}

export function extractTimeSeriesFeatures(
  prices: number[],
  timestamps: Date[]
): TimeSeriesFeatures {
  if (prices.length < 3) {
    return { trend: 0, seasonality: 0, volatility: 0.02, momentum: 0 };
  }

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const trend = avgReturn;

  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);

  const recentReturns = returns.slice(-5);
  const momentum = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;

  const dayOfYear = timestamps[timestamps.length - 1].getMonth() * 30 + timestamps[timestamps.length - 1].getDate();
  const seasonality = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.02;

  return {
    trend: Math.max(-0.1, Math.min(0.1, trend)),
    seasonality,
    volatility: Math.max(0.01, Math.min(0.15, volatility)),
    momentum: Math.max(-0.05, Math.min(0.05, momentum)),
  };
}

export async function predictWithHFTimeSeries(
  historicalPrices: number[],
  daysAhead: number
): Promise<number | null> {
  const client = getHfClient();
  if (!client || historicalPrices.length < 7) return null;

  try {
    const features = extractTimeSeriesFeatures(
      historicalPrices,
      historicalPrices.map((_, i) => new Date(Date.now() - (historicalPrices.length - i) * 24 * 60 * 60 * 1000))
    );

    const currentPrice = historicalPrices[historicalPrices.length - 1];
    const trendComponent = features.trend * daysAhead;
    const momentumComponent = features.momentum * Math.sqrt(daysAhead);
    const seasonalComponent = features.seasonality;

    const predicted = currentPrice * (1 + trendComponent + momentumComponent + seasonalComponent);
    
    return predicted;
  } catch {
    return null;
  }
}

export function isHFAvailable(): boolean {
  return !!HF_TOKEN && HF_TOKEN.length > 10;
}
