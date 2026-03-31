"use client";

import { PricePrediction, MarketData } from "@/types";

interface CurrentRateCardProps {
  prediction: PricePrediction;
  market: MarketData;
}

const METAL_COLORS: Record<string, string> = {
  gold: "from-yellow-400 via-amber-500 to-yellow-600",
  silver: "from-gray-300 via-slate-400 to-gray-500",
  copper: "from-orange-400 via-amber-600 to-orange-700",
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  CNY: "¥",
  EUR: "€",
  JPY: "¥",
};

const METAL_ICONS: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  copper: "🥉",
};

export default function CurrentRateCard({ prediction, market }: CurrentRateCardProps) {
  const localPrice =
    prediction.metal === "gold"
      ? market.goldPrice
      : prediction.metal === "silver"
        ? market.silverPrice
        : market.copperPrice;

  const unit = prediction.metal === "gold" ? "10g" : "kg";
  const gradient = METAL_COLORS[prediction.metal];

  return (
    <div className="glass-card p-6 md:p-8 border-2 border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{METAL_ICONS[prediction.metal]}</span>
        <div>
          <h2
            className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent capitalize`}
          >
            {prediction.metal}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Today's Rate</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl md:text-6xl font-black tracking-tight">
            {CURRENCY_SYMBOLS[market.currency]}
            {localPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          {market.currency} per {unit} • {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">Sentiment</p>
          <p
            className={`text-lg font-bold ${
              prediction.sentimentScore > 0
                ? "text-emerald-400"
                : prediction.sentimentScore < 0
                  ? "text-red-400"
                  : "text-blue-400"
            }`}
          >
            {prediction.sentimentScore > 0 ? "+" : ""}
            {(prediction.sentimentScore * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">Confidence</p>
          <p className="text-lg font-bold text-blue-400">
            {(prediction.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
