import { NewsArticle } from "@/types";

export interface SentimentFeatures {
  overallScore: number;
  intensity: number;
  subjectivity: number;
  urgency: number;
  marketImpact: number;
  geopoliticalRisk: number;
  economicStrength: number;
}

const SENTIMENT_LEXICON = {
  strongBullish: {
    words: ["surge", "soar", "rally", "boom", "skyrocket", "breakout", "record high", "all-time high", "unprecedented growth", "explosive growth"],
    weight: 0.4,
  },
  bullish: {
    words: ["gain", "rise", "increase", "high", "boost", "strong", "growth", "demand", "bullish", "jump", "climb", "uptick", "recovery", "optimism", "positive", "stimulus", "easing", "expansion", "upgrade", "outperform", "strengthen", "improve"],
    weight: 0.15,
  },
  strongBearish: {
    words: ["crash", "plunge", "collapse", "crisis", "panic", "meltdown", "freefall", "record low", "catastrophic", "devastating"],
    weight: -0.4,
  },
  bearish: {
    words: ["fall", "drop", "decline", "low", "weak", "loss", "bearish", "slump", "recession", "downturn", "selloff", "sell-off", "pessimism", "negative", "tightening", "hawkish", "contraction", "downgrade", "underperform", "concern", "weaken", "deteriorate"],
    weight: -0.15,
  },
};

const INTENSITY_MARKERS = ["very", "extremely", "significantly", "sharply", "dramatically", "massive", "huge", "major", "substantial", "considerable"];
const UNCERTAINTY_MARKERS = ["may", "might", "could", "possibly", "perhaps", "uncertain", "unclear", "potential", "likely"];
const URGENCY_MARKERS = ["breaking", "urgent", "immediate", "now", "today", "emergency", "alert", "critical", "imminent"];

const GEOPOLITICAL_KEYWORDS = ["war", "conflict", "tension", "sanction", "military", "invasion", "strike", "attack", "threat", "nuclear", "missile", "combat", "warfare", "aggression"];
const ECONOMIC_STRENGTH_KEYWORDS = ["GDP", "growth", "expansion", "recovery", "boom", "prosperity", "employment", "manufacturing", "production", "output"];
const MARKET_IMPACT_KEYWORDS = ["trillion", "billion", "major", "significant", "massive", "unprecedented", "historic", "landmark", "sweeping"];

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[\w']+\b/g) || [];
}

export function advancedSentimentAnalysis(text: string): SentimentFeatures {
  const lower = text.toLowerCase();
  const tokens = tokenize(lower);
  
  let overallScore = 0;
  let intensityCount = 0;
  let uncertaintyCount = 0;
  let urgencyCount = 0;
  let geoPoliticalCount = 0;
  let economicCount = 0;
  let marketImpactCount = 0;

  for (const [category, config] of Object.entries(SENTIMENT_LEXICON)) {
    for (const word of config.words) {
      const regex = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "gi");
      const matches = (lower.match(regex) || []).length;
      overallScore += matches * config.weight;
    }
  }

  INTENSITY_MARKERS.forEach((marker) => {
    if (lower.includes(marker)) intensityCount++;
  });

  UNCERTAINTY_MARKERS.forEach((marker) => {
    if (lower.includes(marker)) uncertaintyCount++;
  });

  URGENCY_MARKERS.forEach((marker) => {
    if (lower.includes(marker)) urgencyCount++;
  });

  GEOPOLITICAL_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) geoPoliticalCount++;
  });

  ECONOMIC_STRENGTH_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) economicCount++;
  });

  MARKET_IMPACT_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) marketImpactCount++;
  });

  const intensity = Math.min(1, intensityCount * 0.2);
  const subjectivity = Math.max(0.3, 1 - uncertaintyCount * 0.12);
  const urgency = Math.min(1, urgencyCount * 0.25);
  const geopoliticalRisk = Math.min(1, geoPoliticalCount * 0.18);
  const economicStrength = Math.min(1, economicCount * 0.15);
  const marketImpact = Math.min(1, marketImpactCount * 0.2);

  overallScore = overallScore * (1 + intensity * 0.5);
  overallScore = overallScore * subjectivity;

  return {
    overallScore: Math.max(-1, Math.min(1, overallScore)),
    intensity,
    subjectivity,
    urgency,
    marketImpact,
    geopoliticalRisk,
    economicStrength,
  };
}

export function aggregateAdvancedSentiment(
  articles: NewsArticle[],
  metal: string
): SentimentFeatures {
  const relevant = articles.filter(
    (a) => a.relevantMetals.includes(metal) || a.relevantMetals.length === 0
  );

  if (relevant.length === 0) {
    return {
      overallScore: 0,
      intensity: 0,
      subjectivity: 0.5,
      urgency: 0,
      marketImpact: 0,
      geopoliticalRisk: 0,
      economicStrength: 0,
    };
  }

  const recentWeight = (publishedAt: string) => {
    const hoursSince = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
    return Math.exp(-hoursSince / 24);
  };

  let totalWeight = 0;
  const aggregated: SentimentFeatures = {
    overallScore: 0,
    intensity: 0,
    subjectivity: 0,
    urgency: 0,
    marketImpact: 0,
    geopoliticalRisk: 0,
    economicStrength: 0,
  };

  relevant.forEach((article) => {
    const fullText = `${article.title} ${article.description}`;
    const features = advancedSentimentAnalysis(fullText);
    const weight = recentWeight(article.publishedAt);
    
    totalWeight += weight;
    aggregated.overallScore += features.overallScore * weight;
    aggregated.intensity += features.intensity * weight;
    aggregated.subjectivity += features.subjectivity * weight;
    aggregated.urgency += features.urgency * weight;
    aggregated.marketImpact += features.marketImpact * weight;
    aggregated.geopoliticalRisk += features.geopoliticalRisk * weight;
    aggregated.economicStrength += features.economicStrength * weight;
  });

  if (totalWeight > 0) {
    Object.keys(aggregated).forEach((key) => {
      aggregated[key as keyof SentimentFeatures] /= totalWeight;
    });
  }

  return aggregated;
}

export function calculateNewsVolatility(articles: NewsArticle[]): number {
  if (articles.length < 2) return 0.5;

  const sentiments = articles.map((a) => a.sentiment);
  const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
  const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
  const stdDev = Math.sqrt(variance);

  return Math.min(1, stdDev * 2);
}
