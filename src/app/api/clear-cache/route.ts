import { NextResponse } from "next/server";
import { initDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await initDatabase();
    
    await query(`DELETE FROM news_articles`);

    return NextResponse.json({
      success: true,
      message: "News cache cleared. Prices are always live.",
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
