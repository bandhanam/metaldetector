import { NewsArticle, MetalPrice } from "@/types";
import { aggregateAdvancedSentiment, SentimentFeatures } from "./ml-sentiment";

interface NeuralInput {
  sentiment: number;
  sentimentIntensity: number;
  geopoliticalRisk: number;
  economicStrength: number;
  marketImpact: number;
  urgency: number;
  newsVolume: number;
  newsVolatility: number;
  priceChange1d: number;
  priceChange7d: number;
  priceChange30d: number;
  volatility: number;
  trend: number;
  momentum: number;
  rsi: number;
  macdSignal: number;
  bollingerPosition: number;
  dayOfWeek: number;
  monthOfYear: number;
  quarterOfYear: number;
}

interface NeuralOutput {
  priceDirection: number;
  magnitude: number;
  confidence: number;
}

interface TrainingData {
  input: NeuralInput;
  output: NeuralOutput;
}

const METAL_WEIGHTS = {
  gold: {
    sentiment: 0.18,
    geopoliticalRisk: 0.22,
    economicStrength: -0.12,
    dollarStrength: -0.20,
    inflation: 0.18,
    interestRate: -0.15,
    safeHaven: 0.25,
  },
  silver: {
    sentiment: 0.15,
    geopoliticalRisk: 0.12,
    economicStrength: 0.18,
    industrialDemand: 0.22,
    inflation: 0.12,
    interestRate: -0.10,
    goldCorrelation: 0.20,
  },
  platinum: {
    sentiment: 0.15,
    geopoliticalRisk: 0.10,
    economicStrength: 0.20,
    autoDemand: 0.25,
    hydrogenFuelCell: 0.20,
    supplyChain: 0.18,
    jewelleryDemand: 0.12,
  },
};

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(
  prices: number[]
): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i), 12);
    const e26 = calculateEMA(prices.slice(0, i), 26);
    macdHistory.push(e12 - e26);
  }

  const signal = macdHistory.length >= 9 ? calculateEMA(macdHistory, 9) : macd;
  return { macd, signal, histogram: macd - signal };
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateBollingerBands(
  prices: number[],
  period: number = 20
): { upper: number; middle: number; lower: number; position: number } {
  if (prices.length < period) {
    const last = prices[prices.length - 1] || 0;
    return { upper: last, middle: last, lower: last, position: 0.5 };
  }

  const slice = prices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance =
    slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + 2 * stdDev;
  const lower = middle - 2 * stdDev;
  const current = prices[prices.length - 1];

  const position =
    upper !== lower ? (current - lower) / (upper - lower) : 0.5;

  return { upper, middle, lower, position: Math.max(0, Math.min(1, position)) };
}

function calculateTrend(prices: number[]): number {
  if (prices.length < 5) return 0;

  const n = prices.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgPrice = sumY / n;

  return avgPrice !== 0 ? slope / avgPrice : 0;
}

function calculateMomentum(prices: number[], period: number = 10): number {
  if (prices.length < period) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - period];
  return past !== 0 ? (current - past) / past : 0;
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.025;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  if (returns.length === 0) return 0.025;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance);
}

export function extractNeuralFeatures(
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string,
  daysAhead: number
): NeuralInput {
  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const metalPrices = prices
    .filter((p) => p.metal === metal)
    .map((p) => p.price_usd);

  const currentPrice = metalPrices[metalPrices.length - 1] || 0;
  const price1dAgo = metalPrices[metalPrices.length - 2] || currentPrice;
  const price7dAgo = metalPrices[metalPrices.length - 8] || currentPrice;
  const price30dAgo = metalPrices[metalPrices.length - 31] || currentPrice;

  const rsi = calculateRSI(metalPrices);
  const macd = calculateMACD(metalPrices);
  const bollinger = calculateBollingerBands(metalPrices);
  const trend = calculateTrend(metalPrices.slice(-30));
  const momentum = calculateMomentum(metalPrices);
  const volatility = calculateVolatility(metalPrices);

  const relevantNews = news.filter(
    (n) => n.relevantMetals.includes(metal) || n.relevantMetals.length === 0
  );

  const now = new Date();
  const targetDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return {
    sentiment: normalize(sentimentFeatures.overallScore, -1, 1),
    sentimentIntensity: sentimentFeatures.intensity,
    geopoliticalRisk: sentimentFeatures.geopoliticalRisk,
    economicStrength: sentimentFeatures.economicStrength,
    marketImpact: sentimentFeatures.marketImpact,
    urgency: sentimentFeatures.urgency,
    newsVolume: Math.min(1, relevantNews.length / 100),
    newsVolatility: Math.min(1, calculateNewsVolatility(news)),
    priceChange1d: normalize(
      currentPrice > 0 ? (currentPrice - price1dAgo) / price1dAgo : 0,
      -0.1,
      0.1
    ),
    priceChange7d: normalize(
      currentPrice > 0 ? (currentPrice - price7dAgo) / price7dAgo : 0,
      -0.2,
      0.2
    ),
    priceChange30d: normalize(
      currentPrice > 0 ? (currentPrice - price30dAgo) / price30dAgo : 0,
      -0.3,
      0.3
    ),
    volatility: normalize(volatility, 0, 0.1),
    trend: normalize(trend, -0.05, 0.05),
    momentum: normalize(momentum, -0.15, 0.15),
    rsi: rsi / 100,
    macdSignal: normalize(macd.histogram, -10, 10),
    bollingerPosition: bollinger.position,
    dayOfWeek: targetDate.getDay() / 6,
    monthOfYear: targetDate.getMonth() / 11,
    quarterOfYear: Math.floor(targetDate.getMonth() / 3) / 3,
  };
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

function calculateNewsVolatility(news: NewsArticle[]): number {
  if (news.length < 2) return 0;

  const sentiments = news.map((n) => n.sentiment);
  const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  const variance =
    sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
    sentiments.length;

  return Math.sqrt(variance);
}

class NeuralPredictor {
  private weights: number[][];
  private biases: number[];
  private hiddenWeights: number[][];
  private hiddenBiases: number[];
  private outputWeights: number[][];
  private outputBiases: number[];

  constructor(inputSize: number = 20, hiddenSize: number = 32, outputSize: number = 3) {
    this.weights = this.initializeWeights(inputSize, hiddenSize);
    this.biases = this.initializeBiases(hiddenSize);
    this.hiddenWeights = this.initializeWeights(hiddenSize, 16);
    this.hiddenBiases = this.initializeBiases(16);
    this.outputWeights = this.initializeWeights(16, outputSize);
    this.outputBiases = this.initializeBiases(outputSize);
  }

  private initializeWeights(rows: number, cols: number): number[][] {
    const weights: number[][] = [];
    const scale = Math.sqrt(2 / rows);
    for (let i = 0; i < rows; i++) {
      weights[i] = [];
      for (let j = 0; j < cols; j++) {
        weights[i][j] = (Math.random() * 2 - 1) * scale;
      }
    }
    return weights;
  }

  private initializeBiases(size: number): number[] {
    return Array(size).fill(0);
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  private tanh(x: number): number {
    return Math.tanh(x);
  }

  private forward(input: number[]): number[] {
    let hidden1 = Array(this.biases.length).fill(0);
    for (let j = 0; j < this.biases.length; j++) {
      let sum = this.biases[j];
      for (let i = 0; i < input.length; i++) {
        sum += input[i] * this.weights[i][j];
      }
      hidden1[j] = this.relu(sum);
    }

    let hidden2 = Array(this.hiddenBiases.length).fill(0);
    for (let j = 0; j < this.hiddenBiases.length; j++) {
      let sum = this.hiddenBiases[j];
      for (let i = 0; i < hidden1.length; i++) {
        sum += hidden1[i] * this.hiddenWeights[i][j];
      }
      hidden2[j] = this.relu(sum);
    }

    let output = Array(this.outputBiases.length).fill(0);
    for (let j = 0; j < this.outputBiases.length; j++) {
      let sum = this.outputBiases[j];
      for (let i = 0; i < hidden2.length; i++) {
        sum += hidden2[i] * this.outputWeights[i][j];
      }
      if (j === 0) {
        output[j] = this.tanh(sum);
      } else {
        output[j] = this.sigmoid(sum);
      }
    }

    return output;
  }

  predict(input: NeuralInput): NeuralOutput {
    const inputArray = [
      input.sentiment,
      input.sentimentIntensity,
      input.geopoliticalRisk,
      input.economicStrength,
      input.marketImpact,
      input.urgency,
      input.newsVolume,
      input.newsVolatility,
      input.priceChange1d,
      input.priceChange7d,
      input.priceChange30d,
      input.volatility,
      input.trend,
      input.momentum,
      input.rsi,
      input.macdSignal,
      input.bollingerPosition,
      input.dayOfWeek,
      input.monthOfYear,
      input.quarterOfYear,
    ];

    const output = this.forward(inputArray);

    return {
      priceDirection: output[0],
      magnitude: output[1],
      confidence: output[2],
    };
  }

  setPretrainedWeights(metal: string): void {
    const metalWeights = METAL_WEIGHTS[metal as keyof typeof METAL_WEIGHTS] || METAL_WEIGHTS.gold;
    
    this.weights[0][0] = metalWeights.sentiment * 2;
    this.weights[2][1] = (metalWeights.geopoliticalRisk || 0) * 2;
    this.weights[3][2] = (metalWeights.economicStrength || 0) * 2;
    
    if (metal === "gold") {
      this.weights[2][0] = 0.4;
      this.weights[0][1] = 0.3;
      this.weights[12][0] = 0.25;
    } else if (metal === "silver") {
      this.weights[3][0] = 0.35;
      this.weights[0][1] = 0.25;
      this.weights[13][0] = 0.3;
    } else if (metal === "platinum") {
      this.weights[3][0] = 0.45;
      this.weights[6][0] = 0.3;
      this.weights[12][0] = 0.35;
    }
  }
}

export interface AdvancedPrediction {
  predicted: number;
  low: number;
  high: number;
  confidence: number;
  direction: "bullish" | "bearish" | "neutral";
  strength: "strong" | "moderate" | "weak";
  technicalSignals: {
    rsi: string;
    macd: string;
    bollinger: string;
    trend: string;
  };
}

export function neuralPredictPrice(
  currentPrice: number,
  daysAhead: number,
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string
): AdvancedPrediction {
  const features = extractNeuralFeatures(news, prices, metal, daysAhead);
  
  const predictor = new NeuralPredictor();
  predictor.setPretrainedWeights(metal);
  
  const output = predictor.predict(features);

  const sentimentFeatures = aggregateAdvancedSentiment(news, metal);
  const combinedDirection =
    output.priceDirection * 0.4 +
    sentimentFeatures.overallScore * 0.3 +
    features.trend * 10 * 0.15 +
    features.momentum * 5 * 0.15;

  const timeDecay = Math.exp(-daysAhead / 60);
  const adjustedDirection = combinedDirection * timeDecay;

  const baseMagnitude = output.magnitude * 0.15;
  const volatilityBoost = features.volatility * 0.5;
  const newsBoost = features.newsVolatility * 0.3;
  const timeBoost = Math.log(1 + daysAhead) * 0.02;

  const magnitude = Math.min(
    0.25,
    baseMagnitude + volatilityBoost + newsBoost + timeBoost
  );

  const priceChange = adjustedDirection * magnitude;
  const predicted = currentPrice * (1 + priceChange);

  const baseVolatility = features.volatility || 0.025;
  const timeVolatility = baseVolatility * Math.sqrt(daysAhead / 7);
  const uncertaintyRange = timeVolatility * 1.96;

  const low = currentPrice * (1 + priceChange - uncertaintyRange);
  const high = currentPrice * (1 + priceChange + uncertaintyRange);

  const baseConfidence = output.confidence;
  const newsConfidence = Math.min(1, features.newsVolume * 1.5);
  const technicalConfidence =
    1 - Math.abs(features.rsi - 0.5) * 0.5 - features.volatility * 2;
  const timeConfidence = Math.exp(-daysAhead / 90);

  const confidence = Math.max(
    0.35,
    Math.min(
      0.95,
      baseConfidence * 0.3 +
        newsConfidence * 0.25 +
        technicalConfidence * 0.25 +
        timeConfidence * 0.2
    )
  );

  const direction: "bullish" | "bearish" | "neutral" =
    adjustedDirection > 0.05
      ? "bullish"
      : adjustedDirection < -0.05
      ? "bearish"
      : "neutral";

  const strength: "strong" | "moderate" | "weak" =
    Math.abs(adjustedDirection) > 0.15
      ? "strong"
      : Math.abs(adjustedDirection) > 0.08
      ? "moderate"
      : "weak";

  const rsiValue = features.rsi * 100;
  const technicalSignals = {
    rsi:
      rsiValue > 70
        ? "Overbought - potential reversal"
        : rsiValue < 30
        ? "Oversold - potential bounce"
        : "Neutral",
    macd:
      features.macdSignal > 0.1
        ? "Bullish crossover"
        : features.macdSignal < -0.1
        ? "Bearish crossover"
        : "Neutral",
    bollinger:
      features.bollingerPosition > 0.8
        ? "Near upper band - overbought"
        : features.bollingerPosition < 0.2
        ? "Near lower band - oversold"
        : "Within bands",
    trend:
      features.trend > 0.01
        ? "Uptrend"
        : features.trend < -0.01
        ? "Downtrend"
        : "Sideways",
  };

  return {
    predicted: Math.round(predicted * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    direction,
    strength,
    technicalSignals,
  };
}

export function ensemblePrediction(
  currentPrice: number,
  daysAhead: number,
  news: NewsArticle[],
  prices: MetalPrice[],
  metal: string
): AdvancedPrediction {
  const predictions: AdvancedPrediction[] = [];

  for (let i = 0; i < 5; i++) {
    const sampledNews = news
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(news.length * 0.8));
    predictions.push(
      neuralPredictPrice(currentPrice, daysAhead, sampledNews, prices, metal)
    );
  }

  const avgPredicted =
    predictions.reduce((sum, p) => sum + p.predicted, 0) / predictions.length;
  const avgLow =
    predictions.reduce((sum, p) => sum + p.low, 0) / predictions.length;
  const avgHigh =
    predictions.reduce((sum, p) => sum + p.high, 0) / predictions.length;
  const avgConfidence =
    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

  const bullishCount = predictions.filter((p) => p.direction === "bullish").length;
  const bearishCount = predictions.filter((p) => p.direction === "bearish").length;

  const direction: "bullish" | "bearish" | "neutral" =
    bullishCount >= 3 ? "bullish" : bearishCount >= 3 ? "bearish" : "neutral";

  const strongCount = predictions.filter((p) => p.strength === "strong").length;
  const strength: "strong" | "moderate" | "weak" =
    strongCount >= 3 ? "strong" : strongCount >= 1 ? "moderate" : "weak";

  const predictionVariance =
    predictions.reduce((sum, p) => sum + Math.pow(p.predicted - avgPredicted, 2), 0) /
    predictions.length;
  const consensusBonus = 1 - Math.sqrt(predictionVariance) / avgPredicted;

  return {
    predicted: Math.round(avgPredicted * 100) / 100,
    low: Math.round(Math.min(...predictions.map((p) => p.low)) * 100) / 100,
    high: Math.round(Math.max(...predictions.map((p) => p.high)) * 100) / 100,
    confidence: Math.round(Math.min(0.95, avgConfidence * consensusBonus) * 100) / 100,
    direction,
    strength,
    technicalSignals: predictions[0].technicalSignals,
  };
}
