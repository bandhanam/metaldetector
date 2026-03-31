import { NextResponse } from "next/server";
import { getNews } from "@/lib/news";
import { initDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();
    const news = await getNews();

    return NextResponse.json({
      success: true,
      count: news.length,
      articles: news,
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
