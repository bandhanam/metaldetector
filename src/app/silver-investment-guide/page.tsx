import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Silver Investment Guide India 2026 — Price Trends, How to Buy | Metal Detector",
  description: "Complete guide to silver investment in India. Learn about silver ETFs, bars, coins, digital silver, industrial demand drivers, and price prediction factors for 2026.",
};

export default function SilverInvestmentGuide() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-600 hover:text-amber-500 text-sm">&larr; Back to Live Prices</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
          Silver Investment Guide — India 2026
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Everything you need to know about investing in silver — the metal that bridges precious and industrial demand.
        </p>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Silver: The Most Undervalued Precious Metal?</h2>
            <p>
              Silver is often called &quot;poor man&apos;s gold,&quot; but that label masks its extraordinary investment
              potential. While gold is primarily a monetary metal (90%+ of demand is investment/jewellery), silver
              has a unique dual nature — roughly 50% investment demand and 50% industrial demand. This means silver
              benefits from both safe-haven buying during crises AND industrial growth during economic expansions.
            </p>
            <p className="mt-3">
              The gold-to-silver ratio (currently around 85-90:1) suggests silver is historically undervalued. When
              this ratio reverts toward its long-term average of 65:1, silver outperforms gold significantly. During
              2020-2021, silver surged 140% from its March 2020 low — nearly double gold&apos;s performance in the same
              period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Industrial Demand Drivers for Silver</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Solar Photovoltaics</h3>
                <p>Each solar panel uses approximately 20 grams of silver paste for its conductive contacts. With
                  global solar installations projected to reach 500+ GW annually by 2028, solar alone could consume
                  150+ million ounces of silver per year — nearly 20% of total annual mine supply. India&apos;s 500 GW
                  renewable target makes this especially relevant for domestic demand.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Electric Vehicles</h3>
                <p>Electric vehicles use 25-50 grams of silver per vehicle — nearly double that of combustion engine cars.
                  Silver is critical in EV electrical contacts, battery management systems, and charging stations.
                  With India targeting 30% EV penetration by 2030, this creates substantial new silver demand.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">5G &amp; Electronics</h3>
                <p>Silver is the best electrical and thermal conductor of all elements. 5G infrastructure, smartphones,
                  laptops, and IoT devices all require silver. The global 5G rollout and India&apos;s semiconductor
                  manufacturing ambitions will increase silver consumption in electronics significantly.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Healthcare &amp; Water Purification</h3>
                <p>Silver&apos;s antimicrobial properties make it essential in wound dressings, medical devices, and
                  water purification systems. Silver nanoparticles are increasingly used in hospital surfaces and
                  equipment. The global healthcare silver market grows approximately 8% annually.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How to Buy Silver in India</h2>
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Physical Silver (Bars &amp; Coins)</h3>
                <p>Available from banks (SBI, HDFC), jewellers, and refineries (MMTC-PAMP). Bars come in 100g,
                  500g, and 1kg sizes. Coins from 10g to 100g. Buy only BIS hallmarked or refinery certified silver
                  (999 purity). Silver attracts 3% GST on purchase. Storage in bank lockers recommended for large
                  quantities.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Silver ETFs</h3>
                <p>SEBI approved silver ETFs in India in 2022. Options include Nippon India Silver ETF, ICICI
                  Prudential Silver ETF, and Aditya Birla Silver ETF. Each unit represents approximately 1 gram of
                  silver. Traded on NSE/BSE, requiring a demat account. Expense ratios: 0.5-1.0%. The most convenient
                  way to trade silver actively.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">Digital Silver</h3>
                <p>Platforms like MMTC-PAMP, SafeGold, and Augmont offer digital silver starting from ₹1. Buy
                  fractional quantities, stored in insured vaults. Convert to physical bars at any time with home
                  delivery. No demat account needed. 3% GST applies on purchase.</p>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-base font-bold text-gray-500 mb-2">MCX Silver Futures</h3>
                <p>For experienced traders, MCX (Multi Commodity Exchange) offers silver futures contracts — Silver
                  (30 kg lot), Silver Mini (5 kg), and Silver Micro (1 kg). Margin requirements typically 5-10% of
                  contract value. High leverage means high risk — suitable only for experienced traders with proper
                  risk management.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Silver Price Factors to Watch</h2>
            <ul className="list-disc ml-6 space-y-3">
              <li><strong>Gold-Silver Ratio:</strong> When above 80:1, silver is historically cheap relative to gold and may outperform. When below 60:1, silver may be overextended.</li>
              <li><strong>US Dollar Index:</strong> Like gold, silver is inversely correlated with the USD. Dollar weakness = silver strength.</li>
              <li><strong>Industrial Production Data:</strong> Unlike gold, silver responds to manufacturing PMI, factory orders, and construction spending data. Strong economy = strong industrial silver demand.</li>
              <li><strong>Solar Installation Data:</strong> Monthly solar capacity additions are becoming an increasingly important silver demand indicator.</li>
              <li><strong>COMEX Futures Positioning:</strong> The Commitment of Traders (COT) report shows whether institutional traders are net long or short silver.</li>
              <li><strong>Indian Import Data:</strong> India imports most of its silver. Monthly import volumes indicate domestic demand trends.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Silver vs Gold: Which Should You Buy?</h2>
            <div className="glass-card p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-amber-500 mb-2">Choose Gold If:</h3>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>You prioritize wealth preservation and stability</li>
                    <li>You want lower volatility (gold moves less sharply)</li>
                    <li>You prefer tax-free options (SGBs)</li>
                    <li>You have a conservative risk profile</li>
                    <li>Storage space is limited (gold is more value-dense)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 mb-2">Choose Silver If:</h3>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>You want higher return potential (but with more volatility)</li>
                    <li>You believe in the green energy transition thesis</li>
                    <li>You want a lower entry point (silver is affordable per unit)</li>
                    <li>You have an aggressive risk appetite</li>
                    <li>You trade actively and can manage price swings</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-amber-700 font-medium">
                Many experienced investors hold both — typically 70% gold and 30% silver within their precious metals allocation.
              </p>
            </div>
          </section>

          <section className="glass-card p-5 border-l-4 border-gray-400">
            <p className="text-xs text-gray-600 font-medium">
              <strong>Disclaimer:</strong> This guide is for educational purposes only and does not constitute financial advice.
              Silver investments carry significant market risk due to higher volatility compared to gold. Past performance
              is not indicative of future results. Consult a SEBI-registered financial advisor before investing.
            </p>
          </section>

          <div className="text-center pt-4">
            <Link href="/" className="inline-block px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors">
              Check Live Silver Price Today →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
