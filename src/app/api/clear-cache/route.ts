import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await initDatabase();
    
    await query(`DELETE FROM dashboard_cache WHERE id = 'daily'`);
    await query(`DELETE FROM metal_prices`);
    await query(`DELETE FROM news_articles`);
    await query(`DELETE FROM predictions`);

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully. Refresh dashboard to load new data.",
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
