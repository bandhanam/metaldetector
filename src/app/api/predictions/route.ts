import { NextResponse } from "next/server";
import { getNews } from "@/lib/news";
import { fetchCurrentPrices } from "@/lib/prices";
import { generatePredictions } from "@/lib/predictions";
import { initDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();

    const [news, prices] = await Promise.all([
      getNews(),
      fetchCurrentPrices(),
    ]);

    const predictions = await generatePredictions(prices, news);

    for (const pred of predictions) {
      for (const tf of pred.predictions) {
        try {
          await query(
            `INSERT INTO predictions (metal, timeframe, predicted_price, low_price, high_price, confidence, sentiment_score, factors)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              pred.metal,
              tf.label,
              tf.predictedPrice,
              tf.low,
              tf.high,
              pred.confidence,
              pred.sentimentScore,
              JSON.stringify(pred.factors),
            ]
          );
        } catch {
          // continue
        }
      }
    }

    return NextResponse.json({
      success: true,
      predictions,
      newsCount: news.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Predictions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
