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
    CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC)
  `);
}

export async function query(text: string, params?: unknown[]) {
  const db = getPool();
  return db.query(text, params);
}
