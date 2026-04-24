import {
  PricePrediction,
  TimeframePrediction,
  PredictionFactor,
  NewsArticle,
  MetalPrice,
} from "@/types";
import { aggregateAdvancedSentiment } from "./ml-sentiment";
import { 
  batchAnalyzeSentiment, 
  isHFAvailable,
  extractTimeSeriesFeatures 
} from "./huggingface";
import { ensembleSmartPredict, predictForDate } from "./advanced-predictor";
import { addDays, addWeeks, addMonths, format } from "date-fns";

async function enhanceNewsWithHF(news: NewsArticle[]): Promise<NewsArticle[]> {
  if (!isHFAvailable() || news.length === 0) return news;

  try {
    const hfSentiments = await batchAnalyzeSentiment(news.slice(0, 50));
    
    return news.map((article) => {
      const hfResult = hfSentiments.get(article.url);
      if (hfResult) {
        return {
          ...article,
          sentiment: (article.sentiment * 0.3 + hfResult.sentiment * 0.7),
        };
      }
      return article;
    });
  } catch {
    return news;
  }
}

function generateFactors(
  metal: string,
  news: NewsArticle[],
  prices: MetalPrice[]
): PredictionFactor[] {
  const factors: PredictionFactor[] = [];
  
  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const overallSentiment = sentimentFeatures.overallScore;

  const metalPrices = prices
    .filter((p) => p.metal === metal)
    .map((p) => p.price_usd)
    .slice(-14);
  
  let recentTrend = 0;
  if (metalPrices.length >= 2) {
    const firstHalf = metalPrices.slice(0, Math.floor(metalPrices.length / 2));
    const secondHalf = metalPrices.slice(Math.floor(metalPrices.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    recentTrend = avgFirst > 0 ? (avgSecond - avgFirst) / avgFirst : 0;
  }

  // RSI-based technical signal
  let rsiValue = 50;
  if (metalPrices.length >= 3) {
    let gains = 0, losses = 0;
    for (let i = 1; i < metalPrices.length; i++) {
      const d = metalPrices[i] - metalPrices[i - 1];
      if (d > 0) gains += d; else losses -= d;
    }
    const period = metalPrices.length - 1;
    const avgG = gains / period;
    const avgL = losses / period;
    rsiValue = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
  }
  const rsiImpact = rsiValue > 70 ? "bearish" : rsiValue < 30 ? "bullish" : "neutral";
  const rsiDesc = rsiValue > 70 ? "overbought" : rsiValue < 30 ? "oversold" : "neutral range";

  factors.push({
    name: "Technical Indicators (RSI)",
    impact: rsiImpact,
    weight: 0.18,
    description: `RSI at ${rsiValue.toFixed(0)} (${rsiDesc}). ${rsiValue > 70 ? "Overbought — potential pullback ahead." : rsiValue < 30 ? "Oversold — potential bounce ahead." : "No extreme signal from RSI."}`,
  });

  const trendImpact = recentTrend > 0.01 ? "bullish" : recentTrend < -0.01 ? "bearish" : "neutral";
  factors.push({
    name: "Price Momentum",
    impact: trendImpact,
    weight: 0.20,
    description: `Recent ${metalPrices.length}-day trend: ${recentTrend > 0 ? "+" : ""}${(recentTrend * 100).toFixed(2)}%. ${trendImpact === "neutral" ? "Consolidation phase." : `${trendImpact === "bullish" ? "Upward" : "Downward"} momentum continues.`}`,
  });

  const sentimentImpact =
    overallSentiment > 0.12 ? "bullish" : overallSentiment < -0.12 ? "bearish" : "neutral";
  factors.push({
    name: "News Sentiment Analysis",
    impact: sentimentImpact,
    weight: 0.20,
    description: `Analysis of ${news.length} global articles: ${sentimentImpact} (${(overallSentiment * 100).toFixed(1)}%). Intensity: ${(sentimentFeatures.intensity * 100).toFixed(0)}%${isHFAvailable() ? " (FinBERT-enhanced)" : ""}.`,
  });

  // Indian seasonal demand factor
  const now = new Date();
  const month = now.getMonth();
  const isHighDemand = (metal === "gold" || metal === "silver") && (month >= 9 || month <= 1);
  if (metal === "gold" || metal === "silver") {
    factors.push({
      name: "Indian Seasonal Demand",
      impact: isHighDemand ? "bullish" : "neutral",
      weight: 0.12,
      description: isHighDemand
        ? "Wedding season (Oct-Feb) and festival demand driving prices higher. Dhanteras, Diwali, and wedding purchases peak."
        : "Off-peak season for Indian gold demand. Lower retail buying pressure.",
    });
  }

  const geopoliticalNews = news.filter(
    (n) =>
      /war|conflict|military|tension|sanction|tariff|geopolitical|invasion|strike|attack|threat/i.test(
        n.title + " " + n.description
      )
  );
  if (geopoliticalNews.length > 0) {
    const geoRisk = sentimentFeatures.geopoliticalRisk;
    const impact = metal === "gold" 
      ? (geoRisk > 0.25 ? "bullish" : "neutral")
      : (geoRisk > 0.4 ? "bearish" : "neutral");
    
    factors.push({
      name: "Geopolitical Risk",
      impact,
      weight: metal === "gold" ? 0.18 : 0.12,
      description: `${geopoliticalNews.length} conflict/tension reports. Risk: ${(geoRisk * 100).toFixed(0)}%. ${metal === "gold" ? "Safe-haven demand typically rises." : "Supply chain disruptions possible."}`,
    });
  }

  const cbNews = news.filter(
    (n) =>
      /central bank|federal reserve|ecb|boj|pboc|rbi|interest rate|monetary policy|rate hike|rate cut|dovish|hawkish/i.test(
        n.title + " " + n.description
      )
  );
  if (cbNews.length > 0) {
    const cbSentiment = cbNews.reduce((s, n) => s + n.sentiment, 0) / cbNews.length;
    const impact = cbSentiment > 0.1 ? "bearish" : cbSentiment < -0.1 ? "bullish" : "neutral";
    
    factors.push({
      name: "Monetary Policy",
      impact,
      weight: 0.15,
      description: `${cbNews.length} central bank updates. ${cbSentiment > 0.1 ? "Hawkish stance pressures metals." : cbSentiment < -0.1 ? "Dovish stance supports metals." : "Neutral monetary outlook."}`,
    });
  }

  if (metal === "platinum") {
    const autoNews = news.filter((n) => 
      /auto|automotive|vehicle|catalytic|converter|emission|hydrogen|fuel cell|ev|electric vehicle/i.test(n.title + " " + n.description)
    );
    if (autoNews.length > 0) {
      const autoSentiment = autoNews.reduce((s, n) => s + n.sentiment, 0) / autoNews.length;
      const impact = autoSentiment > 0.08 ? "bullish" : autoSentiment < -0.08 ? "bearish" : "neutral";
      
      factors.push({
        name: "Auto & Hydrogen Demand",
        impact,
        weight: 0.20,
        description: `${autoNews.length} auto/hydrogen reports. ~40% of platinum goes to catalytic converters. Hydrogen fuel cells are a growing demand driver.`,
      });
    }
  }

  const dollarNews = news.filter(
    (n) =>
      /dollar|dxy|dollar index|currency|forex|usd strength|greenback/i.test(
        n.title + " " + n.description
      )
  );
  if (dollarNews.length > 0) {
    const dollarSentiment = dollarNews.reduce((s, n) => s + n.sentiment, 0) / dollarNews.length;
    factors.push({
      name: "USD Strength",
      impact: dollarSentiment > 0.1 ? "bearish" : dollarSentiment < -0.1 ? "bullish" : "neutral",
      weight: 0.14,
      description: `${dollarNews.length} currency reports. ${dollarSentiment > 0.1 ? "Strong dollar pressures metals." : dollarSentiment < -0.1 ? "Weak dollar supports metals." : "Stable dollar — neutral impact."}`,
    });
  }

  factors.sort((a, b) => b.weight - a.weight);
  return factors.slice(0, 7);
}

let predictionCache: { key: string; data: PricePrediction[]; at: number } | null = null;
const PREDICTION_CACHE_TTL_MS = 60_000;

export async function generatePredictions(
  prices: MetalPrice[],
  news: NewsArticle[]
): Promise<PricePrediction[]> {
  const cacheKey = prices.map(p => `${p.metal}:${p.price_usd}`).join("|");
  if (predictionCache && predictionCache.key === cacheKey && Date.now() - predictionCache.at < PREDICTION_CACHE_TTL_MS) {
    return predictionCache.data;
  }

  const enhancedNews = await enhanceNewsWithHF(news);
  
  const metals: Array<"gold" | "silver" | "platinum"> = ["gold", "silver", "platinum"];
  const now = new Date();

  const results = metals.map((metal) => {
    const currentPrice = prices.find((p) => p.metal === metal)?.price_usd || 0;
    
    const metalPrices = prices
      .filter((p) => p.metal === metal)
      .map((p) => p.price_usd)
      .slice(-30);
    
    const tsFeatures = extractTimeSeriesFeatures(
      metalPrices,
      prices.filter((p) => p.metal === metal).map((p) => new Date(p.timestamp)).slice(-30)
    );

    const timeframes: Array<{
      label: string;
      days: number;
      dateFn: () => Date;
    }> = [
      { label: "Tomorrow", days: 1, dateFn: () => addDays(now, 1) },
      { label: "2 Days", days: 2, dateFn: () => addDays(now, 2) },
      { label: "3 Days", days: 3, dateFn: () => addDays(now, 3) },
      { label: "1 Week", days: 7, dateFn: () => addWeeks(now, 1) },
      { label: "2 Weeks", days: 14, dateFn: () => addWeeks(now, 2) },
      { label: "1 Month", days: 30, dateFn: () => addMonths(now, 1) },
      { label: "3 Months", days: 90, dateFn: () => addMonths(now, 3) },
    ];

    const predictions: TimeframePrediction[] = timeframes.map((tf) => {
      const result = ensembleSmartPredict(
        currentPrice,
        tf.days,
        enhancedNews,
        prices,
        metal,
        5
      );

      const trendAdjustment = tsFeatures.trend * Math.min(tf.days, 7) * 0.08;
      
      let finalPredicted = result.predicted * (1 + trendAdjustment);
      let finalLow = result.low * (1 + trendAdjustment * 0.4);
      let finalHigh = result.high * (1 + trendAdjustment * 0.4);

      if (isNaN(finalPredicted) || finalPredicted <= 0) finalPredicted = currentPrice;
      if (isNaN(finalLow) || finalLow <= 0) finalLow = finalPredicted * 0.95;
      if (isNaN(finalHigh) || finalHigh <= 0) finalHigh = finalPredicted * 1.05;

      if (finalLow > finalPredicted) finalLow = finalPredicted * 0.97;
      if (finalHigh < finalPredicted) finalHigh = finalPredicted * 1.03;

      const changePercent = currentPrice > 0
        ? Math.round(((finalPredicted - currentPrice) / currentPrice) * 10000) / 100
        : 0;

      return {
        label: tf.label,
        date: format(tf.dateFn(), "yyyy-MM-dd"),
        predictedPrice: Math.round(finalPredicted * 100) / 100,
        low: Math.round(finalLow * 100) / 100,
        high: Math.round(finalHigh * 100) / 100,
        changePercent: isNaN(changePercent) ? 0 : changePercent,
      };
    });

    const factors = generateFactors(metal, enhancedNews, prices);

    const bullishCount = factors.filter((f) => f.impact === "bullish").length;
    const bearishCount = factors.filter((f) => f.impact === "bearish").length;
    const totalFactors = factors.length;
    
    const factorAlignment = Math.abs(bullishCount - bearishCount) / Math.max(1, totalFactors);
    const sentimentFeatures = aggregateAdvancedSentiment(enhancedNews, metal);
    
    let confidence = 
      0.40 + 
      factorAlignment * 0.15 + 
      sentimentFeatures.intensity * 0.10 + 
      (1 - sentimentFeatures.subjectivity) * 0.08 +
      Math.min(0.12, news.length / 500);
    
    if (isHFAvailable()) {
      confidence += 0.08;
    }
    
    confidence = Math.min(0.82, confidence);

    return {
      metal,
      currentPrice,
      predictions,
      confidence: Math.round(confidence * 100) / 100,
      sentimentScore: Math.round(sentimentFeatures.overallScore * 1000) / 1000,
      factors,
    };
  });

  predictionCache = { key: cacheKey, data: results, at: Date.now() };
  return results;
}

// ── Auspicious Date Predictions (server-side) ──

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

export function generateAuspiciousPredictions(
  prices: MetalPrice[],
  news: NewsArticle[]
): AuspiciousDatePrediction[] {
  const AUSPICIOUS_DATES = [
    { date: "2026-01-14", name: "Makar Sankranti" },
    { date: "2026-01-29", name: "Vasant Panchami" },
    { date: "2026-03-14", name: "Holika Dahan" },
    { date: "2026-03-25", name: "Gudi Padwa / Ugadi" },
    { date: "2026-04-14", name: "Baisakhi / Tamil New Year" },
    { date: "2026-04-26", name: "Akshaya Tritiya" },
    { date: "2026-07-10", name: "Rath Yatra" },
    { date: "2026-08-12", name: "Janmashtami" },
    { date: "2026-10-02", name: "Navratri Begins" },
    { date: "2026-10-12", name: "Dussehra" },
    { date: "2026-10-29", name: "Dhanteras" },
    { date: "2026-10-31", name: "Diwali" },
    { date: "2026-11-02", name: "Govardhan Puja" },
    { date: "2026-11-16", name: "Dev Deepawali" },
  ];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const goldPrice = prices.find(p => p.metal === "gold")?.price_usd || 0;
  const silverPrice = prices.find(p => p.metal === "silver")?.price_usd || 0;

  if (goldPrice === 0) return [];

  const results: AuspiciousDatePrediction[] = [];

  for (const event of AUSPICIOUS_DATES) {
    const eventDate = new Date(event.date + "T00:00:00");
    const daysAway = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAway < 0) continue;
    if (daysAway > 365) continue;

    const goldPred = predictForDate(goldPrice, eventDate, news, prices, "gold");
    const silverPred = predictForDate(silverPrice, eventDate, news, prices, "silver");

    results.push({
      date: event.date,
      name: event.name,
      daysAway,
      goldPredicted: goldPred.predicted,
      goldLow: goldPred.low,
      goldHigh: goldPred.high,
      goldChangePercent: goldPred.changePercent,
      silverPredicted: silverPred.predicted,
      silverChangePercent: silverPred.changePercent,
    });
  }

  return results;
}
