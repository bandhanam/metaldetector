import { query } from "./db";
import { DashboardData, PricePrediction, NewsArticle, MetalPrice, MarketData } from "@/types";

export async function getCachedDashboardData(): Promise<DashboardData | null> {
  try {
    const result = await query(
      `SELECT data, created_at FROM dashboard_cache 
       WHERE id = 'daily' 
       AND created_at > NOW() - INTERVAL '1 day'
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (result.rows.length > 0) {
      return result.rows[0].data as DashboardData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedDashboardData(data: DashboardData): Promise<void> {
  try {
    await query(
      `INSERT INTO dashboard_cache (id, data, created_at)
       VALUES ('daily', $1, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $1, created_at = NOW()`,
      [JSON.stringify(data)]
    );
  } catch (error) {
    console.error("Failed to cache dashboard data:", error);
  }
}

export async function initCacheTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS dashboard_cache (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error("Failed to create cache table:", error);
  }
}

export function shouldRefreshData(lastUpdated: string | null): boolean {
  if (!lastUpdated) return true;
  
  const lastUpdate = new Date(lastUpdated);
  const now = new Date();
  const hoursSince = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  return hoursSince >= 24;
}
