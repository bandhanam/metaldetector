import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://healthpulseuser:psQtlRm7_LMKb0c82GMy6w@healthpulse-21422.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS metal_prices (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      metal VARCHAR(10) NOT NULL,
      price_usd DECIMAL(12,2) NOT NULL,
      price_inr DECIMAL(12,2),
      price_cny DECIMAL(12,2),
      price_eur DECIMAL(12,2),
      price_jpy DECIMAL(12,2),
      source VARCHAR(100),
      fetched_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS news_articles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      source VARCHAR(200),
      published_at TIMESTAMPTZ,
      sentiment DECIMAL(5,3),
      relevant_metals TEXT[],
      relevant_countries TEXT[],
      fetched_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS predictions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      metal VARCHAR(10) NOT NULL,
      timeframe VARCHAR(20) NOT NULL,
      predicted_price DECIMAL(12,2) NOT NULL,
      low_price DECIMAL(12,2),
      high_price DECIMAL(12,2),
      confidence DECIMAL(5,3),
      sentiment_score DECIMAL(5,3),
      factors JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_metal_prices_metal_time ON metal_prices(metal, fetched_at DESC)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_predictions_metal ON predictions(metal, created_at DESC)
  `);
}

export async function query(text: string, params?: unknown[]) {
  const db = getPool();
  return db.query(text, params);
}
