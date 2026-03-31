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
import { ensembleSmartPredict } from "./advanced-predictor";
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

  const trendImpact = recentTrend > 0.01 ? "bullish" : recentTrend < -0.01 ? "bearish" : "neutral";
  factors.push({
    name: "Historical Price Trend",
    impact: trendImpact,
    weight: 0.22,
    description: `Recent ${metalPrices.length}-day trend shows ${recentTrend > 0 ? "+" : ""}${(recentTrend * 100).toFixed(2)}% movement. Historical patterns suggest ${trendImpact === "neutral" ? "consolidation" : `continued ${trendImpact} momentum`}.`,
  });

  const sentimentImpact =
    overallSentiment > 0.12 ? "bullish" : overallSentiment < -0.12 ? "bearish" : "neutral";
  factors.push({
    name: "News Sentiment Analysis",
    impact: sentimentImpact,
    weight: 0.20,
    description: `Analysis of ${news.length} global articles shows ${sentimentImpact} sentiment (${(overallSentiment * 100).toFixed(1)}%). Intensity: ${(sentimentFeatures.intensity * 100).toFixed(0)}%${isHFAvailable() ? " (Enhanced with FinBERT)" : ""}.`,
  });

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
      description: `${geopoliticalNews.length} conflict/tension reports detected. Risk level: ${(geoRisk * 100).toFixed(0)}%. ${metal === "gold" ? "Safe-haven demand typically increases during uncertainty." : "Supply chain disruptions may affect industrial metals."}`,
    });
  }

  const inflationNews = news.filter(
    (n) =>
      /inflation|cpi|consumer price|price index|rising prices/i.test(n.title + " " + n.description)
  );
  if (inflationNews.length > 0) {
    const inflationSentiment =
      inflationNews.reduce((s, n) => s + n.sentiment, 0) / inflationNews.length;
    const impact = metal === "gold" 
      ? (inflationSentiment > 0 ? "bullish" : "neutral")
      : (inflationSentiment > 0.15 ? "bearish" : "neutral");
    
    factors.push({
      name: "Inflation Outlook",
      impact,
      weight: 0.16,
      description: `${inflationNews.length} inflation-related reports. ${metal === "gold" ? "Gold historically serves as inflation hedge." : "High inflation may reduce industrial demand."}`,
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
      description: `${cbNews.length} central bank updates. Hawkish policy (rate hikes) typically pressures metal prices. Dovish stance supports prices.`,
    });
  }

  if (metal === "copper") {
    const chinaNews = news.filter((n) => 
      n.relevantCountries.includes("China") ||
      /china|chinese|beijing|pboc|yuan|manufacturing pmi/i.test(n.title + " " + n.description)
    );
    if (chinaNews.length > 0) {
      const chinaSentiment = chinaNews.reduce((s, n) => s + n.sentiment, 0) / chinaNews.length;
      const impact = chinaSentiment > 0.08 ? "bullish" : chinaSentiment < -0.08 ? "bearish" : "neutral";
      
      factors.push({
        name: "China Economic Outlook",
        impact,
        weight: 0.20,
        description: `${chinaNews.length} China-related reports. China consumes ~50% of global copper. Economic sentiment: ${chinaSentiment > 0 ? "positive" : chinaSentiment < 0 ? "negative" : "neutral"}.`,
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
      description: `${dollarNews.length} currency reports. Strong dollar makes metals expensive for international buyers, typically pressuring prices.`,
    });
  }

  const supplyNews = news.filter(
    (n) =>
      /supply chain|shortage|production cut|mining|output|supply disruption/i.test(
        n.title + " " + n.description
      )
  );
  if (supplyNews.length > 0) {
    const supplySentiment = supplyNews.reduce((s, n) => s + n.sentiment, 0) / supplyNews.length;
    factors.push({
      name: "Supply Dynamics",
      impact: supplySentiment < -0.1 ? "bullish" : supplySentiment > 0.1 ? "bearish" : "neutral",
      weight: 0.12,
      description: `${supplyNews.length} supply/production reports. Disruptions typically support prices; increased output pressures them.`,
    });
  }

  factors.sort((a, b) => b.weight - a.weight);
  return factors.slice(0, 7);
}

export async function generatePredictions(
  prices: MetalPrice[],
  news: NewsArticle[]
): Promise<PricePrediction[]> {
  const enhancedNews = await enhanceNewsWithHF(news);
  
  const metals: Array<"gold" | "silver" | "copper"> = ["gold", "silver", "copper"];
  const now = new Date();

  return metals.map((metal) => {
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
        3
      );

      const trendAdjustment = tsFeatures.trend * Math.min(tf.days, 7) * 0.1;
      
      let finalPredicted = result.predicted * (1 + trendAdjustment);
      let finalLow = result.low * (1 + trendAdjustment * 0.5);
      let finalHigh = result.high * (1 + trendAdjustment * 0.5);

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
}
