import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gold Investment Guide India 2026 — How to Buy, Where to Invest | Metal Detector",
  description: "Complete guide to gold investment in India. Learn about gold ETFs, sovereign gold bonds, digital gold, physical gold, and smart buying strategies for 2026.",
};

export default function GoldInvestmentGuide() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-600 hover:text-amber-500 text-sm">&larr; Back to Live Prices</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
          Gold Investment Guide — India 2026
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          A comprehensive guide to investing in gold in India — from physical gold to ETFs, sovereign bonds, and digital platforms.
        </p>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Why Gold is India&apos;s Favourite Investment</h2>
            <p>
              India is the world&apos;s second-largest consumer of gold, importing 700-800 tonnes annually. Gold holds
              deep cultural, religious, and financial significance in India. Beyond jewellery, gold serves as a
              portfolio diversifier, inflation hedge, and liquidity reserve. During the 2020 pandemic and the 2022
              Russia-Ukraine crisis, gold proved its worth as a safe haven — gaining 25%+ when equity markets crashed.
            </p>
            <p className="mt-3">
              Over the past decade (2016–2026), gold prices in India have delivered approximately 12-14% compound annual
              returns, outperforming fixed deposits (6-7%), and matching or exceeding many equity mutual fund categories.
              This performance, combined with zero credit risk, makes gold a cornerstone of Indian household wealth.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Ways to Invest in Gold in India</h2>

            <div className="space-y-5">
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-amber-500 mb-2">1. Physical Gold (Jewellery, Coins, Bars)</h3>
                <p>The traditional way to own gold. Jewellery carries making charges (8-25% of gold value), while
                  coins and bars from banks/refineries have lower premiums (2-5%). Store safely in a bank locker
                  (annual cost: ₹2,000-₹10,000). Physical gold attracts LTCG tax after 2 years at 12.5% with
                  indexation benefits (as per 2024 budget changes).</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600 font-medium">Pros:</span> Tangible asset, cultural value, no counterparty risk.{" "}
                  <span className="text-red-600 font-medium">Cons:</span> Making charges, storage costs, purity concerns, difficult to sell in small quantities.
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-amber-500 mb-2">2. Sovereign Gold Bonds (SGBs)</h3>
                <p>Issued by the Reserve Bank of India on behalf of the Government of India. SGBs offer 2.5% annual
                  interest on the issue price (paid semi-annually), plus capital gains linked to gold prices. The
                  8-year tenure with exit option after 5 years. Capital gains on redemption at maturity are fully
                  tax-exempt — the most tax-efficient way to own gold in India.</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600 font-medium">Pros:</span> 2.5% interest, tax-free at maturity, government-backed, no storage costs.{" "}
                  <span className="text-red-600 font-medium">Cons:</span> 8-year lock-in, limited liquidity on secondary market, issued in tranches.
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-amber-500 mb-2">3. Gold ETFs (Exchange Traded Funds)</h3>
                <p>Gold ETFs like Nippon India Gold ETF, SBI Gold ETF, and HDFC Gold ETF trade on stock exchanges
                  just like shares. Each unit represents approximately 1 gram of 99.5% pure gold. You need a demat
                  account to buy. Expense ratios range from 0.5-1.0% annually. Listed on BSE/NSE with live pricing.</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600 font-medium">Pros:</span> High liquidity, purity guaranteed, easy to buy/sell, small amounts possible.{" "}
                  <span className="text-red-600 font-medium">Cons:</span> Expense ratio, demat required, LTCG taxable.
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-amber-500 mb-2">4. Digital Gold</h3>
                <p>Available through platforms like Google Pay, PhonePe, Paytm, and MMTC-PAMP. Buy gold starting
                  from as low as ₹1. The gold is stored in insured vaults by the provider. You can convert digital
                  gold to physical delivery at any time. No demat account needed.</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600 font-medium">Pros:</span> Start with ₹1, instant buy/sell, physical delivery option, no storage hassle.{" "}
                  <span className="text-red-600 font-medium">Cons:</span> 3% GST on purchase, spread between buy/sell price, platform risk.
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-amber-500 mb-2">5. Gold Mutual Funds (Fund of Funds)</h3>
                <p>Gold Fund of Funds invest in Gold ETFs, removing the need for a demat account. Available through
                  any mutual fund platform via SIP (Systematic Investment Plan) starting at ₹500/month. Good for
                  disciplined, long-term gold accumulation.</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600 font-medium">Pros:</span> SIP available, no demat needed, professional management.{" "}
                  <span className="text-red-600 font-medium">Cons:</span> Double expense ratio (FoF + ETF), slightly lower returns.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Gold Investment Strategies</h2>
            <ul className="list-disc ml-6 space-y-3">
              <li><strong>SIP in Gold:</strong> Invest a fixed amount monthly in Gold ETFs or Gold Fund of Funds. This averages out price volatility over time (rupee cost averaging). Ideal for long-term wealth building.</li>
              <li><strong>Buy on Dips:</strong> Use Metal Detector&apos;s AI predictions to identify short-term price dips. When the 3-month prediction shows positive trend but today&apos;s price dipped, it may be a good entry point.</li>
              <li><strong>Portfolio Allocation:</strong> Financial advisors typically recommend 10-15% of your portfolio in gold. Higher allocation (up to 20%) makes sense during periods of high inflation or geopolitical uncertainty.</li>
              <li><strong>Festive Buying:</strong> If you plan to buy gold jewellery for weddings or festivals, track prices early. Our AI suggestions can help you identify whether it&apos;s better to buy now or wait.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Gold Tax Rules in India (2026)</h2>
            <div className="glass-card p-5">
              <ul className="space-y-2">
                <li><strong>Physical Gold &amp; Gold ETFs:</strong> Held for more than 2 years — LTCG at 12.5% without indexation (post July 2024 budget). Short-term gains taxed at your income tax slab rate.</li>
                <li><strong>Sovereign Gold Bonds:</strong> Capital gains on maturity are fully tax-exempt. Interest of 2.5% is taxable at your slab rate. If sold before maturity on exchange, LTCG applies.</li>
                <li><strong>Digital Gold:</strong> Taxed as physical gold — LTCG at 12.5% after 2 years, slab rate for short-term.</li>
                <li><strong>GST:</strong> 3% GST applies on purchase of physical gold and digital gold. No GST on Gold ETFs or SGBs.</li>
              </ul>
            </div>
          </section>

          <section className="glass-card p-5 border-l-4 border-amber-500">
            <p className="text-xs text-amber-700 font-medium">
              <strong>Disclaimer:</strong> This guide is for educational purposes only and does not constitute financial advice.
              Gold investments carry market risk. Past performance is not indicative of future results. Consult a
              SEBI-registered financial advisor before making investment decisions. Tax rules are subject to change —
              verify with a CA for your specific situation.
            </p>
          </section>

          <div className="text-center pt-4">
            <Link href="/" className="inline-block px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Check Live Gold Price Today →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
