"use client";

import { useState } from "react";
import { MarketData } from "@/types";

interface WeddingSeasonBannerProps {
  market?: MarketData;
}

const SEASON_CONFIG: Record<number, { festival: string; emoji: string; urgency: string }> = {
  9:  { festival: "Navratri & Dussehra", emoji: "🪔", urgency: "Shaadi season starts! Gold demand rising" },
  10: { festival: "Dhanteras & Diwali", emoji: "🎆", urgency: "Peak buying — prices may surge 2-5%" },
  11: { festival: "Wedding Season Peak", emoji: "💍", urgency: "Highest demand period — buy before prices climb" },
  0:  { festival: "Makar Sankranti & Lohri", emoji: "🔥", urgency: "Wedding season continues — prices remain firm" },
  1:  { festival: "Basant Panchami", emoji: "🌼", urgency: "Last month of peak season — good time to finalise" },
  3:  { festival: "Akshaya Tritiya", emoji: "✨", urgency: "Most auspicious day to buy gold — don't miss it!" },
};

function isWeddingSeason(): boolean {
  const m = new Date().getMonth();
  return m >= 9 || m <= 1 || m === 3;
}

export default function WeddingSeasonBanner({ market }: WeddingSeasonBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isWeddingSeason() || dismissed || !market) return null;

  const month = new Date().getMonth();
  const config = SEASON_CONFIG[month];
  if (!config) return null;

  const sym = market.currency === "INR" ? "₹" : "$";
  const goldPrice = market.goldPrice;

  return (
    <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-b border-rose-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl mt-0.5 flex-shrink-0">{config.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-rose-700">
                {config.festival} — शादी का सीज़न {config.emoji}
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                {config.urgency}. Gold today: {sym}{goldPrice.toLocaleString("en-IN")}/10g
              </p>
              <a
                href="/wedding-gold-planner"
                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 text-[11px] font-semibold rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                💍 Plan Wedding Gold Now — Free Tool
              </a>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-rose-400 hover:text-rose-600 text-lg flex-shrink-0 p-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
