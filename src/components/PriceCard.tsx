"use client";

import { PricePrediction } from "@/types";

interface PriceCardProps {
  prediction: PricePrediction;
  isSelected: boolean;
  onClick: () => void;
}

const METAL_ICONS: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  platinum: "💎",
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
  platinum: {
    gradient: "from-indigo-300 via-purple-400 to-indigo-500",
    glow: "shadow-orange-500/20",
  },
};

export default function PriceCard({
  prediction,
  isSelected,
  onClick,
}: PriceCardProps) {
  const colors = METAL_COLORS[prediction.metal];
  const shortTermChange = prediction.predictions[0]?.changePercent || 0;
  const isPositive = shortTermChange >= 0;

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
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(shortTermChange).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
          ${prediction.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {prediction.metal === "silver" ? "USD / kg" : "USD / 10g"}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <div
            className={`pulse-dot ${isPositive ? "bg-emerald-600" : "bg-red-600"}`}
          />
          <span>Sentiment: {(prediction.sentimentScore * 100).toFixed(0)}%</span>
        </div>
        <span>Conf: {(prediction.confidence * 100).toFixed(0)}%</span>
      </div>
    </button>
  );
}
