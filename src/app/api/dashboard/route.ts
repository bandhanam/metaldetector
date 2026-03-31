import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { initCacheTable, getCachedDashboardData, setCachedDashboardData } from "@/lib/cache";
import { getNews } from "@/lib/news";
import { fetchCurrentPrices, getMarketData } from "@/lib/prices";
import { generatePredictions } from "@/lib/predictions";
import { DashboardData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();
    await initCacheTable();

    const cached = await getCachedDashboardData();
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        message: "Serving cached data from today",
      });
    }

    const [news, prices] = await Promise.all([
      getNews(),
      fetchCurrentPrices(),
    ]);

    const predictions = await generatePredictions(prices, news);
    const markets = getMarketData(prices);

    const dashboardData: DashboardData = {
      prices,
      predictions,
      news,
      markets,
      lastUpdated: new Date().toISOString(),
    };

    await setCachedDashboardData(dashboardData);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      cached: false,
      message: "Fresh data generated and cached",
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
