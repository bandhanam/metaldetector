"use client";

import { useEffect, useState } from "react";
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
  platinum: "💎",
};

const HINDI_NAMES: Record<string, string> = {
  gold: "सोने का भाव",
  silver: "चांदी का भाव",
  platinum: "प्लैटिनम का भाव",
};

const METAL_COLORS: Record<string, { gradient: string; glow: string; selectedBg: string; selectedBorder: string; ctaBg: string; ctaText: string; accentBar: string }> = {
  gold: {
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    glow: "shadow-amber-200",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-400",
    ctaBg: "bg-amber-600 hover:bg-amber-700",
    ctaText: "text-white",
    accentBar: "linear-gradient(to right, #FFD700, #B8860B)",
  },
  silver: {
    gradient: "from-gray-300 via-slate-400 to-gray-500",
    glow: "shadow-gray-200",
    selectedBg: "bg-slate-50",
    selectedBorder: "border-slate-400",
    ctaBg: "bg-slate-600 hover:bg-slate-700",
    ctaText: "text-white",
    accentBar: "linear-gradient(to right, #94a3b8, #475569)",
  },
  platinum: {
    gradient: "from-indigo-300 via-purple-400 to-indigo-500",
    glow: "shadow-indigo-200",
    selectedBg: "bg-indigo-50",
    selectedBorder: "border-indigo-400",
    ctaBg: "bg-indigo-600 hover:bg-indigo-700",
    ctaText: "text-white",
    accentBar: "linear-gradient(to right, #818cf8, #4338ca)",
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", CNY: "¥", EUR: "€", JPY: "¥",
};

function getYesterdayKey(metal: string, currency: string) {
  return `md_prev_${metal}_${currency}`;
}

function sharePrice(metal: string, price: number, currency: string, unit: string, url: string) {
  const sym = CURRENCY_SYMBOLS[currency] || "";
  const priceStr = `${sym}${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const metalName = metal.charAt(0).toUpperCase() + metal.slice(1);

  const text = `${metalName} Rate Today (${date}): ${priceStr} per ${unit}\n\nCheck live prices & AI predictions:\n${url}`;

  if (navigator.share) {
    navigator.share({ title: `${metalName} Price Today`, text }).catch(() => {});
  } else {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }
}

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
        : market.platinumPrice;

  const unit = prediction.metal === "silver" ? "kg" : "10g";
  const hindiName = market.countryCode === "IN" ? HINDI_NAMES[prediction.metal] : null;

  const [yesterdayChange, setYesterdayChange] = useState<number | null>(null);

  useEffect(() => {
    const key = getYesterdayKey(prediction.metal, market.currency);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const { price, date } = JSON.parse(stored);
        const today = new Date().toDateString();
        if (date !== today) {
          setYesterdayChange(localPrice - price);
          localStorage.setItem(key, JSON.stringify({ price: localPrice, date: today }));
        } else {
          if (price !== localPrice) {
            setYesterdayChange(localPrice - price);
          }
        }
      } else {
        localStorage.setItem(key, JSON.stringify({ price: localPrice, date: new Date().toDateString() }));
      }
    } catch { /* ignore */ }
  }, [localPrice, prediction.metal, market.currency]);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`glass-card p-5 md:p-6 text-left w-full transition-all duration-300 relative overflow-hidden ${
          isSelected
            ? `ring-2 ring-offset-2 ring-offset-white ${colors.selectedBorder} ${colors.selectedBg} ${colors.glow} shadow-lg`
            : "hover:scale-[1.02] hover:shadow-md"
        }`}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: colors.accentBar }}
          />
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{METAL_ICONS[prediction.metal]}</span>
            <div>
              <h3
                className={`text-lg md:text-xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent capitalize`}
              >
                {prediction.metal}
              </h3>
              {hindiName && (
                <p className="text-[10px] text-[var(--text-secondary)] -mt-0.5">{hindiName}</p>
              )}
            </div>
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
            {CURRENCY_SYMBOLS[market.currency]}
            {localPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-[var(--text-secondary)]">
              {market.currency} / {unit}
            </p>
            {yesterdayChange !== null && yesterdayChange !== 0 && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                yesterdayChange > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {yesterdayChange > 0 ? "+" : ""}{CURRENCY_SYMBOLS[market.currency]}{Math.abs(yesterdayChange).toLocaleString("en-IN", { maximumFractionDigits: 0 })} today
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`pulse-dot ${isPositive ? "bg-emerald-600" : "bg-red-600"}`} />
            <span>Sentiment: {(prediction.sentimentScore * 100).toFixed(0)}%</span>
          </div>
          <span>Conf: {(prediction.confidence * 100).toFixed(0)}%</span>
        </div>

        <div
          className={`w-full text-center py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            isSelected
              ? `${colors.ctaBg} ${colors.ctaText}`
              : "bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200"
          }`}
        >
          {isSelected ? "✓ Viewing Insights" : "View Predictions →"}
        </div>
      </button>

      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          sharePrice(prediction.metal, localPrice, market.currency, unit, "https://metaldetector-digger.vercel.app");
        }}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-green-50 border border-gray-200 hover:border-green-400 flex items-center justify-center text-sm transition-all z-10"
        title="Share on WhatsApp"
      >
        📤
      </button>
    </div>
  );
}
