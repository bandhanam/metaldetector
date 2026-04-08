import { NewsArticle } from "@/types";
import { query } from "./db";

const NEWS_API_KEY =
  process.env.NEWS_API_KEY || "42ce60fcec5b45858e123f4885e882d5";

const METAL_KEYWORDS = {
  gold: ["gold price", "gold market", "gold reserve", "bullion", "gold ETF", "gold futures", "XAU"],
  silver: ["silver price", "silver market", "silver futures", "XAG", "silver demand"],
  copper: ["copper price", "copper market", "copper futures", "copper demand", "HG copper"],
};

const MACRO_KEYWORDS = [
  "GDP", "inflation", "central bank", "interest rate", "Federal Reserve", "ECB",
  "Bank of Japan", "PBOC", "RBI", "dollar index", "DXY", "treasury yield",
  "trade war", "tariff", "geopolitical", "recession", "monetary policy",
];

const COUNTRY_PATTERNS: Record<string, RegExp> = {
  India: /india|indian|rupee|rbi|modi|mumbai|sensex|nifty/i,
  China: /china|chinese|yuan|pboc|beijing|shanghai|renminbi/i,
  US: /united states|american|dollar|fed |federal reserve|wall street|nasdaq|s&p/i,
  EU: /europe|european|euro|ecb|eurozone|brussels/i,
  Japan: /japan|japanese|yen|boj|bank of japan|tokyo|nikkei/i,
};

function analyzeSentiment(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;

  const strongBullish = ["surge", "soar", "rally", "boom", "skyrocket", "breakout", "record high", "all-time high"];
  const bullish = ["gain", "rise", "high", "boost", "strong", "growth", "demand", "bullish", "jump", "climb", "uptick", "recovery", "optimism", "positive", "stimulus", "easing", "expansion", "upgrade", "outperform"];
  const strongBearish = ["crash", "plunge", "collapse", "crisis", "panic", "meltdown", "freefall", "record low"];
  const bearish = ["fall", "drop", "decline", "low", "weak", "loss", "bearish", "slump", "recession", "downturn", "selloff", "sell-off", "pessimism", "negative", "tightening", "hawkish", "contraction", "downgrade", "underperform", "concern"];

  strongBullish.forEach((w) => { if (lower.includes(w)) score += 0.25; });
  bullish.forEach((w) => { if (lower.includes(w)) score += 0.08; });
  strongBearish.forEach((w) => { if (lower.includes(w)) score -= 0.25; });
  bearish.forEach((w) => { if (lower.includes(w)) score -= 0.08; });

  if (lower.includes("war") || lower.includes("conflict")) score += 0.15;
  if (lower.includes("peace") || lower.includes("deal")) score -= 0.1;

  return Math.max(-1, Math.min(1, score));
}

function detectMetals(text: string): string[] {
  const metals: string[] = [];
  const lower = text.toLowerCase();
  for (const [metal, keywords] of Object.entries(METAL_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) metals.push(metal);
  }
  if (metals.length === 0 && MACRO_KEYWORDS.some((k) => lower.includes(k.toLowerCase()))) {
    metals.push("gold", "silver", "copper");
  }
  return metals;
}

function detectCountries(text: string): string[] {
  const countries: string[] = [];
  for (const [country, pattern] of Object.entries(COUNTRY_PATTERNS)) {
    if (pattern.test(text)) countries.push(country);
  }
  return countries;
}

let newsCache: { data: NewsArticle[]; at: number } | null = null;
const NEWS_CACHE_TTL_MS = 5 * 60_000;

export async function getNews(): Promise<NewsArticle[]> {
  if (newsCache && Date.now() - newsCache.at < NEWS_CACHE_TTL_MS) {
    return newsCache.data;
  }

  try {
    const result = await query(
      `SELECT title, description, url, source, published_at, sentiment, relevant_metals, relevant_countries
       FROM news_articles
       WHERE fetched_at > NOW() - INTERVAL '24 hours'
       ORDER BY published_at DESC
       LIMIT 100`
    );

    if (result.rows.length >= 5) {
      const articles = result.rows.map((row) => ({
        title: row.title,
        description: row.description || "",
        url: row.url || "",
        source: row.source || "Unknown",
        publishedAt: row.published_at?.toISOString() || new Date().toISOString(),
        sentiment: parseFloat(row.sentiment) || 0,
        relevantMetals: row.relevant_metals || [],
        relevantCountries: row.relevant_countries || [],
      }));
      newsCache = { data: articles, at: Date.now() };
      return articles;
    }
  } catch {
    // DB read failed, fall through to fetch
  }

  const articles = await fetchAndStoreNews();
  newsCache = { data: articles, at: Date.now() };
  return articles;
}

// ─── STEP 2: One API call → store in DB → return ───
export async function fetchAndStoreNews(): Promise<NewsArticle[]> {
  // More specific query focused on commodity trading and economics
  const q = '("gold price" OR "gold prices" OR "silver price" OR "silver prices" OR "copper price" OR "copper prices" OR "precious metals" OR "commodity trading" OR "bullion" OR "metal markets") AND (trading OR investor OR commodity OR futures OR mcx OR comex OR lbma OR forex OR inflation OR "federal reserve" OR "central bank" OR mining OR rally OR decline OR forecast)';

  // Comprehensive exclusion list - anything NOT related to metal commodity trading
  const EXCLUDE_KEYWORDS = [
    // Sports & Games
    "sport", "football", "soccer", "basketball", "cricket", "tennis", "olympics", "olympic", 
    "tournament", "championship", "playoff", "season", "athlete", "medal", "trophy",
    // Entertainment & Media
    "movie", "film", "celebrity", "actor", "actress", "music", "concert", "album", "netflix",
    "gaming", "esports", "video game", "playstation", "xbox",
    // Fashion & Lifestyle  
    "fashion", "style", "beauty", "makeup", "jewelry design", "watch collection", "necklace", "bracelet",
    // Science & Space (THIS IS THE KEY FIX)
    "nasa", "space", "rocket", "satellite", "astronaut", "mission", "apollo", "artemis", 
    "mars", "moon landing", "spacecraft", "orbit", "launch", "galaxy", "asteroid",
    // Technology Products
    "iphone", "samsung", "smartphone", "laptop", "gadget", "app store", "google play",
    // Health & Medical
    "covid", "vaccine", "hospital", "patient", "clinical trial", "drug approval",
    // Real Estate & Property
    "real estate", "property sale", "housing market", "apartment", "mortgage rate"
  ];

  let articles: NewsArticle[] = [];

  try {
    if (typeof process !== "undefined") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=100&apiKey=${NEWS_API_KEY}&domains=reuters.com,bloomberg.com,wsj.com,ft.com,cnbc.com,marketwatch.com,investing.com,moneycontrol.com,business-standard.com,economictimes.indiatimes.com,thehindubusinessline.com`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (res.ok) {
      const data = await res.json();
      const raw = data.articles || [];

      const seen = new Set<string>();
      for (const a of raw) {
        const title = a.title || "";
        const articleUrl = a.url || "";
        if (title.length < 10 || seen.has(articleUrl)) continue;
        seen.add(articleUrl);

        const fullText = `${title} ${a.description || ""}`;
        const lowerText = fullText.toLowerCase();
        
        // FIRST: Skip if contains excluded keywords (space missions, sports, etc.)
        if (EXCLUDE_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
          continue;
        }

        // SECOND: Must explicitly mention metal commodity terms
        const hasCommodityMention = 
          lowerText.includes("gold price") || 
          lowerText.includes("gold prices") ||
          lowerText.includes("silver price") || 
          lowerText.includes("silver prices") ||
          lowerText.includes("copper price") || 
          lowerText.includes("copper prices") ||
          lowerText.includes("precious metal") ||
          lowerText.includes("bullion") ||
          lowerText.includes("commodity market") ||
          lowerText.includes("commodity trading") ||
          lowerText.includes("metal market") ||
          lowerText.includes("mcx") ||
          lowerText.includes("comex") ||
          lowerText.includes("lbma");

        // THIRD: Must have economic/trading context
        const hasTradingContext = 
          lowerText.includes("trading") || 
          lowerText.includes("trader") || 
          lowerText.includes("investor") || 
          lowerText.includes("investment") ||
          lowerText.includes("futures") ||
          lowerText.includes("spot price") ||
          lowerText.includes("rally") ||
          lowerText.includes("decline") ||
          lowerText.includes("forecast") ||
          lowerText.includes("outlook") ||
          lowerText.includes("inflation") || 
          lowerText.includes("central bank") ||
          lowerText.includes("interest rate") ||
          lowerText.includes("federal reserve") ||
          lowerText.includes("forex") ||
          lowerText.includes("dollar") ||
          lowerText.includes("mining sector") ||
          lowerText.includes("demand") ||
          lowerText.includes("supply");

        // Article MUST have both commodity mention AND trading context
        if (!hasCommodityMention || !hasTradingContext) continue;

        articles.push({
          title,
          description: a.description || "",
          url: articleUrl,
          source: a.source?.name || "Unknown",
          publishedAt: a.publishedAt || new Date().toISOString(),
          sentiment: analyzeSentiment(fullText),
          relevantMetals: detectMetals(fullText),
          relevantCountries: detectCountries(fullText),
        });
      }
    }
  } catch (err) {
    console.error("[NEWS] API fetch failed:", err);
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (articles.length > 0) {
    try {
      await query(`DELETE FROM news_articles`);

      const BATCH = 25;
      for (let i = 0; i < articles.length; i += BATCH) {
        const batch = articles.slice(i, i + BATCH);
        const values: unknown[] = [];
        const placeholders = batch.map((a, idx) => {
          const offset = idx * 8;
          values.push(a.title, a.description, a.url, a.source, a.publishedAt, a.sentiment, a.relevantMetals, a.relevantCountries);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
        });
        await query(
          `INSERT INTO news_articles (title, description, url, source, published_at, sentiment, relevant_metals, relevant_countries)
           VALUES ${placeholders.join(", ")}`,
          values
        );
      }
    } catch (err) {
      console.error("[NEWS] DB store failed:", err);
    }
  }

  return articles;
}

export function aggregateSentiment(articles: NewsArticle[], metal: string): number {
  const relevant = articles.filter(
    (a) => a.relevantMetals.includes(metal) || a.relevantMetals.length === 0
  );
  if (relevant.length === 0) return 0;
  return relevant.reduce((sum, a) => sum + a.sentiment, 0) / relevant.length;
}
