"use client";

import { PricePrediction, MarketData } from "@/types";

interface CountryPriceCardProps {
  prediction: PricePrediction;
  market: MarketData;
  isSelected: boolean;
  onClick: () => void;
}

const METAL_ICONS: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  copper: "🥉",
};

const METAL_COLORS: Record<string, { gradient: string; glow: string }> = {
  gold: {
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    glow: "shadow-yellow-500/20",
  },
  silver: {
    gradient: "from-gray-300 via-slate-400 to-gray-500",
    glow: "shadow-gray-400/20",
  },
  copper: {
    gradient: "from-orange-400 via-amber-600 to-orange-700",
    glow: "shadow-orange-500/20",
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  CNY: "¥",
  EUR: "€",
  JPY: "¥",
};

export default function CountryPriceCard({
  prediction,
  market,
  isSelected,
  onClick,
}: CountryPriceCardProps) {
  const colors = METAL_COLORS[prediction.metal];
  const shortTermChange = prediction.predictions[0]?.changePercent || 0;
  const isPositive = shortTermChange >= 0;

  const localPrice =
    prediction.metal === "gold"
      ? market.goldPrice
      : prediction.metal === "silver"
        ? market.silverPrice
        : market.copperPrice;

  const unit = prediction.metal === "gold" ? "10g" : "kg";

  return (
    <button
      onClick={onClick}
      className={`glass-card p-5 md:p-6 text-left w-full transition-all duration-300 ${
        isSelected
          ? `ring-2 ring-offset-0 ${prediction.metal === "gold" ? "ring-yellow-500/50" : prediction.metal === "silver" ? "ring-gray-400/50" : "ring-orange-500/50"} ${colors.glow} shadow-lg`
          : "hover:scale-[1.02]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{METAL_ICONS[prediction.metal]}</span>
          <h3
            className={`text-lg md:text-xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent capitalize`}
          >
            {prediction.metal}
          </h3>
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(shortTermChange).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {CURRENCY_SYMBOLS[market.currency]}
          {localPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {market.currency} / {unit}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <div
            className={`pulse-dot ${isPositive ? "bg-emerald-400" : "bg-red-400"}`}
          />
          <span>Sentiment: {(prediction.sentimentScore * 100).toFixed(0)}%</span>
        </div>
        <span>Conf: {(prediction.confidence * 100).toFixed(0)}%</span>
      </div>
    </button>
  );
}
