import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - Metal Detector",
  description: "About Metal Detector - AI-Powered live gold, silver & platinum price predictions for India and global markets.",
};

export default function About() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-700 hover:text-amber-800 text-sm">&larr; Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Company Header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/icons/bandhanam-logo.png"
            alt="Bandhanam Private Limited"
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">About Metal Detector</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">A product by <strong className="text-[var(--text-primary)]">Bandhanam Private Limited</strong></p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">What is Metal Detector?</h2>
            <p>Metal Detector is an AI-powered precious metal price tracking and prediction platform built by <strong>Bandhanam Private Limited</strong>. We provide real-time gold, silver, and platinum prices for India and global markets, along with intelligent price forecasts powered by machine learning and news sentiment analysis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">How It Works</h2>
            <div className="space-y-3">
              <div className="glass-card p-4">
                <h3 className="text-amber-700 font-semibold mb-1">Live Prices</h3>
                <p>We fetch real-time spot prices from COMEX/LBMA markets and convert them to local currencies using live exchange rates. Indian prices include import duty, GST, and market premiums for accurate rates matching MCX.</p>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-amber-700 font-semibold mb-1">AI Predictions</h3>
                <p>Our prediction engine analyzes 100+ global news sources, performs sentiment analysis on financial articles, evaluates technical indicators, and uses ensemble machine learning models to generate price forecasts across multiple timeframes.</p>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-amber-700 font-semibold mb-1">Global Coverage</h3>
                <p>Track prices in 5 currencies — Indian Rupee (INR), US Dollar (USD), Chinese Yuan (CNY), Euro (EUR), and Japanese Yen (JPY) — covering the world&apos;s largest metal markets.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Data Sources</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Metal Prices:</strong> MetalMetric API (COMEX/LBMA spot prices, updated every 60 seconds)</li>
              <li><strong>Exchange Rates:</strong> ExchangeRate API (live USD conversion rates)</li>
              <li><strong>News:</strong> NewsAPI (100+ global news sources)</li>
              <li><strong>Sentiment Analysis:</strong> Custom NLP engine with financial lexicon</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Our Mission</h2>
            <p>We believe that access to quality financial data and AI-powered insights should not be limited to institutional investors and Wall Street traders. Metal Detector democratizes precious metal market intelligence — giving retail investors, jewellery buyers, and curious individuals the same caliber of real-time data and predictive analytics used by professional commodity traders.</p>
            <p className="mt-2">Whether you are a first-time gold buyer checking today&apos;s rate before purchasing a wedding necklace, or a seasoned investor analyzing silver price trends for portfolio allocation, Metal Detector is designed to serve you with accurate, timely, and actionable information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Technology Stack</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Frontend:</strong> Next.js 16 (React 18+) with server-side rendering for fast performance and SEO</li>
              <li><strong>AI Engine:</strong> Ensemble prediction model combining NLP sentiment analysis, technical indicators, and macroeconomic signals</li>
              <li><strong>Data Pipeline:</strong> Real-time price feeds with 60-second refresh, batch news processing every 6 hours</li>
              <li><strong>Infrastructure:</strong> Deployed on Vercel&apos;s edge network for sub-100ms response times globally</li>
              <li><strong>Database:</strong> CockroachDB (PostgreSQL-compatible) for reliable news article storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Educational Resources</h2>
            <div className="flex flex-col gap-2">
              <Link href="/gold-investment-guide" className="text-amber-700 hover:underline font-medium">Gold Investment Guide — India 2026</Link>
              <Link href="/silver-investment-guide" className="text-amber-700 hover:underline font-medium">Silver Investment Guide — India 2026</Link>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Disclaimer</h2>
            <p className="text-amber-700">Metal Detector is for informational purposes only and does not constitute financial advice. Predictions are generated by AI models and may be inaccurate. Always do your own research and consult a qualified financial advisor before making investment decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Legal</h2>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-amber-700 hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-amber-700 hover:underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
