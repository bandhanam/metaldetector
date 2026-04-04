import { NextResponse } from "next/server";
import { fetchCurrentPrices, getMarketData } from "@/lib/prices";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await fetchCurrentPrices();
    const markets = getMarketData(prices);

    return NextResponse.json({
      success: true,
      prices,
      markets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prices API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
