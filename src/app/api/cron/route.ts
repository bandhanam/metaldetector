import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { initCacheTable, setCachedDashboardData } from "@/lib/cache";
import { fetchAndStoreNews } from "@/lib/news";
import { fetchCurrentPrices, getMarketData } from "@/lib/prices";
import { generatePredictions } from "@/lib/predictions";
import { DashboardData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDatabase();
    await initCacheTable();

    const [news, prices] = await Promise.all([
      fetchAndStoreNews(),
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
      message: "Daily refresh done",
      newsCount: news.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}
