import { NextResponse } from "next/server";
import { fetchCurrentPrices, getMarketData } from "@/lib/prices";
import { initDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();
    const prices = await fetchCurrentPrices();

    for (const price of prices) {
      try {
        await query(
          `INSERT INTO metal_prices (metal, price_usd, price_inr, price_cny, price_eur, price_jpy, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            price.metal,
            price.price_usd,
            price.price_inr,
            price.price_cny,
            price.price_eur,
            price.price_jpy,
            price.source,
          ]
        );
      } catch {
        // continue
      }
    }

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
