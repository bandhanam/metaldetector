import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { fetchAndStoreNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDatabase();

    const news = await fetchAndStoreNews();

    return NextResponse.json({
      success: true,
      message: "News refresh done. Prices and predictions are always live.",
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
