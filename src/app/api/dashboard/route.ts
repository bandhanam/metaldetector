import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { getNews } from "@/lib/news";
import { fetchCurrentPrices, getMarketData } from "@/lib/prices";
import { generatePredictions, generateAuspiciousPredictions } from "@/lib/predictions";
import { DashboardData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();

    const [news, prices] = await Promise.all([
      getNews(),
      fetchCurrentPrices(),
    ]);

    const predictions = await generatePredictions(prices, news);
    const markets = getMarketData(prices);
    const auspiciousPredictions = generateAuspiciousPredictions(prices, news);

    const dashboardData: DashboardData = {
      prices,
      predictions,
      news,
      markets,
      auspiciousPredictions,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      cached: false,
      message: "Live data",
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
