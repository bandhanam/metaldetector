import type { Metadata } from "next";
import Link from "next/link";
import WeddingPlanner from "@/components/WeddingPlanner";

export const metadata: Metadata = {
  title: "Wedding Gold Planner — Calculate Gold Needed for Indian Wedding | Metal Detector",
  description: "Plan your Indian wedding gold requirements. Calculate total gold weight, cost at today's rate for necklaces, bangles, rings, chains & more. AI prediction for buy now vs wait.",
  keywords: ["wedding gold calculator", "shaadi gold planner", "indian wedding jewellery cost", "gold for marriage", "dulhan ka sona"],
};

export default function WeddingGoldPlannerPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-amber-600 hover:text-amber-500 text-sm">&larr; Back to Live Prices</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
          Wedding Gold Planner
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          Shaadi Ka Sona Planner — Plan jewellery purchases for your dream Indian wedding
        </p>
        <p className="text-xs text-[var(--text-secondary)] mb-8 max-w-2xl">
          Add each jewellery item you need, and we&apos;ll calculate the total gold weight and estimated cost at today&apos;s live rate.
          Our AI also compares whether to buy now or wait 3 months based on price predictions.
        </p>

        <WeddingPlanner />

        <div className="mt-12 space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How Much Gold Is Needed for an Indian Wedding?</h2>
            <p>
              A typical South Indian wedding may require 100-200 grams of gold jewellery, while North Indian weddings typically need 50-150 grams.
              The exact amount depends on family tradition, region, and budget. Common items include:
            </p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li><strong>Necklace Set:</strong> 30-80g (heavy temple necklace can be 80-120g)</li>
              <li><strong>Bangles (set of 4):</strong> 20-40g</li>
              <li><strong>Earrings / Jhumka:</strong> 8-15g</li>
              <li><strong>Maang Tikka:</strong> 5-10g</li>
              <li><strong>Rings:</strong> 4-8g each</li>
              <li><strong>Chain:</strong> 10-20g</li>
              <li><strong>Nose Pin:</strong> 1-3g</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Tips to Save Money on Wedding Gold</h2>
            <ol className="list-decimal ml-4 space-y-2">
              <li><strong>Buy on Auspicious Days:</strong> Jewellers often offer discounts on Dhanteras, Akshaya Tritiya and Pongal.</li>
              <li><strong>Start a Gold SIP:</strong> Many jewellers let you pay monthly instalments and buy gold at the end — spreading cost over 6-12 months.</li>
              <li><strong>Compare Making Charges:</strong> Making charges range from 8% to 25%. Light-weight designs have lower making charges.</li>
              <li><strong>Check BIS Hallmark:</strong> Always buy BIS Hallmarked 916 (22K) gold. This guarantees purity.</li>
              <li><strong>Consider Gold Exchange Schemes:</strong> Some jewellers accept old gold in exchange, saving on making charges.</li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
