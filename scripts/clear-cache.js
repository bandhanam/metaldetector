const { Pool } = require("pg");

const connectionString =
  "postgresql://healthpulseuser:psQtlRm7_LMKb0c82GMy6w@healthpulse-21422.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function clearCache() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to database...");
    
    console.log("Clearing dashboard_cache...");
    await pool.query(`DELETE FROM dashboard_cache WHERE id = 'daily'`);
    
    console.log("Clearing metal_prices...");
    await pool.query(`DELETE FROM metal_prices`);
    
    console.log("Clearing news_articles...");
    await pool.query(`DELETE FROM news_articles`);
    
    console.log("Clearing predictions...");
    await pool.query(`DELETE FROM predictions`);
    
    console.log("\n✅ Cache cleared successfully!");
    console.log("Refresh the dashboard at http://localhost:3000 to load fresh data with the new neural network model.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

clearCache();
