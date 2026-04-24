jest.mock("@/lib/db", () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  getPool: jest.fn(),
  initDatabase: jest.fn(),
}));

jest.mock("@/lib/huggingface", () => ({
  batchAnalyzeSentiment: jest.fn().mockResolvedValue(new Map()),
  isHFAvailable: jest.fn().mockReturnValue(false),
  extractTimeSeriesFeatures: jest.fn().mockReturnValue({
    trend: 0,
    momentum: 0,
    volatility: 0.02,
    seasonality: 0,
  }),
}));

import { generatePredictions } from "@/lib/predictions";
import { aggregateSentiment } from "@/lib/news";
import { MetalPrice, NewsArticle } from "@/types";

const mockPrices: MetalPrice[] = [
  {
    metal: "gold",
    price_usd: 1752,
    price_inr: 149796,
    price_cny: 12702,
    price_eur: 1612,
    price_jpy: 265428,
    timestamp: new Date().toISOString(),
    source: "test",
  },
  {
    metal: "silver",
    price_usd: 22,
    price_inr: 1881,
    price_cny: 159.5,
    price_eur: 20.24,
    price_jpy: 3333,
    timestamp: new Date().toISOString(),
    source: "test",
  },
  {
    metal: "platinum",
    price_usd: 320,
    price_inr: 32000,
    price_cny: 167,
    price_eur: 21.2,
    price_jpy: 3491,
    timestamp: new Date().toISOString(),
    source: "test",
  },
];

const mockNews: NewsArticle[] = [
  {
    title: "Gold prices surge as inflation fears grow",
    description: "Bullion rallies to record high amid rising inflation expectations",
    url: "https://example.com/1",
    source: "Reuters",
    publishedAt: new Date().toISOString(),
    sentiment: 0.3,
    relevantMetals: ["gold"],
    relevantCountries: ["US"],
  },
  {
    title: "Federal Reserve signals rate pause",
    description: "Central bank holds interest rates steady, boosting precious metals",
    url: "https://example.com/2",
    source: "Bloomberg",
    publishedAt: new Date().toISOString(),
    sentiment: 0.2,
    relevantMetals: ["gold", "silver"],
    relevantCountries: ["US"],
  },
  {
    title: "Platinum demand weakens as auto sector slows",
    description: "Precious metal prices decline as automotive manufacturing contracts",
    url: "https://example.com/3",
    source: "CNBC",
    publishedAt: new Date().toISOString(),
    sentiment: -0.2,
    relevantMetals: ["platinum"],
    relevantCountries: [],
  },
];

describe("generatePredictions", () => {
  it("should return predictions for all three metals", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    expect(predictions).toHaveLength(3);
    expect(predictions.map((p) => p.metal)).toEqual(["gold", "silver", "platinum"]);
  });

  it("should include correct current prices", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    expect(predictions[0].currentPrice).toBe(1752);
    expect(predictions[1].currentPrice).toBe(22);
    expect(predictions[2].currentPrice).toBe(320);
  });

  it("should generate predictions for all timeframes", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    for (const pred of predictions) {
      expect(pred.predictions.length).toBe(7);
      expect(pred.predictions[0].label).toBe("Tomorrow");
      expect(pred.predictions[6].label).toBe("3 Months");
    }
  });

  it("should have valid prediction ranges (low < predicted < high)", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    for (const pred of predictions) {
      for (const tf of pred.predictions) {
        expect(tf.low).toBeLessThanOrEqual(tf.predictedPrice);
        expect(tf.high).toBeGreaterThanOrEqual(tf.predictedPrice);
      }
    }
  });

  it("should have confidence between 0 and 1", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    for (const pred of predictions) {
      expect(pred.confidence).toBeGreaterThanOrEqual(0);
      expect(pred.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("should include prediction factors", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    for (const pred of predictions) {
      expect(pred.factors.length).toBeGreaterThan(0);
      for (const factor of pred.factors) {
        expect(["bullish", "bearish", "neutral"]).toContain(factor.impact);
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
      }
    }
  });

  it("should have change percentages relative to current price", async () => {
    const predictions = await generatePredictions(mockPrices, mockNews);
    for (const pred of predictions) {
      for (const tf of pred.predictions) {
        const expectedChange =
          ((tf.predictedPrice - pred.currentPrice) / pred.currentPrice) * 100;
        expect(tf.changePercent).toBeCloseTo(expectedChange, 1);
      }
    }
  });
});

describe("aggregateSentiment", () => {
  it("should return positive sentiment for bullish gold news", () => {
    const sentiment = aggregateSentiment(mockNews, "gold");
    expect(sentiment).toBeGreaterThan(0);
  });

  it("should return negative sentiment for bearish platinum news", () => {
    const sentiment = aggregateSentiment(mockNews, "platinum");
    expect(sentiment).toBeLessThan(0);
  });

  it("should return 0 for empty news array", () => {
    const sentiment = aggregateSentiment([], "gold");
    expect(sentiment).toBe(0);
  });

  it("should return a value between -1 and 1", () => {
    const sentiment = aggregateSentiment(mockNews, "gold");
    expect(sentiment).toBeGreaterThanOrEqual(-1);
    expect(sentiment).toBeLessThanOrEqual(1);
  });
});
