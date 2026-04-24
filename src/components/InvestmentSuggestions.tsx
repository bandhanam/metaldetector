"use client";

import { PricePrediction, MarketData } from "@/types";

interface InvestmentSuggestionsProps {
  predictions: PricePrediction[];
  market: MarketData;
}

const METAL_ICONS: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  platinum: "💎",
};

const METAL_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  platinum: "Platinum",
};

interface SuggestionData {
  metal: string;
  signal: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  shortTermChange: number;
  longTermChange: number;
  confidence: number;
  sentiment: number;
  bullishFactors: number;
  bearishFactors: number;
  headline: string;
  details: string[];
  actionTip: string;
}

function analyzeMetal(pred: PricePrediction): SuggestionData {
  const shortTerm = pred.predictions[0]?.changePercent ?? 0;
  const weekChange = pred.predictions[3]?.changePercent ?? 0;
  const longTerm = pred.predictions[pred.predictions.length - 1]?.changePercent ?? 0;

  const bullishFactors = pred.factors.filter((f) => f.impact === "bullish").length;
  const bearishFactors = pred.factors.filter((f) => f.impact === "bearish").length;

  const bullishWeight = pred.factors
    .filter((f) => f.impact === "bullish")
    .reduce((sum, f) => sum + f.weight, 0);
  const bearishWeight = pred.factors
    .filter((f) => f.impact === "bearish")
    .reduce((sum, f) => sum + f.weight, 0);

  const score =
    longTerm * 0.4 +
    weekChange * 0.25 +
    shortTerm * 0.1 +
    pred.sentimentScore * 5 * 0.15 +
    (bullishWeight - bearishWeight) * 10 * 0.1;

  let signal: SuggestionData["signal"];
  if (score > 2) signal = "strong_buy";
  else if (score > 0.5) signal = "buy";
  else if (score > -0.5) signal = "hold";
  else if (score > -2) signal = "sell";
  else signal = "strong_sell";

  const details: string[] = [];
  const metal = METAL_LABELS[pred.metal];

  if (longTerm > 2) {
    details.push(`${metal} is projected to rise ${longTerm.toFixed(1)}% over 3 months — strong upward momentum.`);
  } else if (longTerm > 0) {
    details.push(`${metal} shows a modest ${longTerm.toFixed(1)}% gain expected over 3 months.`);
  } else {
    details.push(`${metal} may decline ${Math.abs(longTerm).toFixed(1)}% over the next 3 months.`);
  }

  if (shortTerm > 0 && longTerm > 0) {
    details.push("Both short-term and long-term trends are positive — favorable entry point.");
  } else if (shortTerm < 0 && longTerm > 0) {
    details.push("Short-term dip with long-term growth expected — potential buying opportunity on weakness.");
  } else if (shortTerm > 0 && longTerm < 0) {
    details.push("Short-term spike but long-term outlook is weak — consider booking profits soon.");
  }

  if (bullishFactors > bearishFactors) {
    details.push(`${bullishFactors} bullish factors vs ${bearishFactors} bearish — market conditions favor buyers.`);
  } else if (bearishFactors > bullishFactors) {
    details.push(`${bearishFactors} bearish factors outweigh ${bullishFactors} bullish — caution advised.`);
  }

  if (pred.confidence > 0.7) {
    details.push(`Model confidence is high (${(pred.confidence * 100).toFixed(0)}%) — predictions are more reliable.`);
  } else if (pred.confidence < 0.5) {
    details.push(`Model confidence is low (${(pred.confidence * 100).toFixed(0)}%) — market is unpredictable, trade cautiously.`);
  }

  let headline: string;
  let actionTip: string;
  switch (signal) {
    case "strong_buy":
      headline = `Strong positive trend — Great time to invest in ${metal}!`;
      actionTip = `${metal} is showing strong upward momentum across all timeframes. Consider increasing your ${metal.toLowerCase()} allocation. Buying now could yield good returns in the coming months.`;
      break;
    case "buy":
      headline = `Positive outlook — Good time to consider ${metal} investment`;
      actionTip = `The trend is favorable for ${metal.toLowerCase()} buyers. A systematic investment (SIP/staggered buying) could help you benefit from the expected price appreciation.`;
      break;
    case "hold":
      headline = `Mixed signals — Hold your current ${metal} position`;
      actionTip = `The market is showing mixed signals for ${metal.toLowerCase()}. If you already hold, continue holding. If you're planning to buy, wait for a clearer trend before committing large amounts.`;
      break;
    case "sell":
      headline = `Weak outlook — Pause buying ${metal} for now`;
      actionTip = `${metal} prices are expected to soften. Consider pausing new purchases and wait for better entry points. If you hold ${metal.toLowerCase()}, don't panic sell — review again in a few weeks.`;
      break;
    case "strong_sell":
      headline = `Bearish trend — Avoid ${metal} investment temporarily`;
      actionTip = `Strong downward pressure on ${metal.toLowerCase()} prices is expected. Hold off on new purchases. If you have short-term positions, consider reducing exposure. Long-term holders should stay patient.`;
      break;
  }

  return {
    metal: pred.metal,
    signal,
    shortTermChange: shortTerm,
    longTermChange: longTerm,
    confidence: pred.confidence,
    sentiment: pred.sentimentScore,
    bullishFactors,
    bearishFactors,
    headline,
    details,
    actionTip,
  };
}

const SIGNAL_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string; icon: string; label: string }> = {
  strong_buy: {
    border: "border-emerald-300",
    bg: "from-emerald-50 via-emerald-50/50 to-transparent",
    badge: "bg-emerald-100",
    badgeText: "text-emerald-700",
    icon: "🚀",
    label: "STRONG BUY",
  },
  buy: {
    border: "border-green-300",
    bg: "from-green-50 via-green-50/50 to-transparent",
    badge: "bg-green-100",
    badgeText: "text-green-700",
    icon: "📈",
    label: "BUY",
  },
  hold: {
    border: "border-amber-300",
    bg: "from-amber-50 via-amber-50/50 to-transparent",
    badge: "bg-amber-100",
    badgeText: "text-amber-700",
    icon: "⏸️",
    label: "HOLD",
  },
  sell: {
    border: "border-orange-300",
    bg: "from-orange-50 via-orange-50/50 to-transparent",
    badge: "bg-orange-100",
    badgeText: "text-orange-700",
    icon: "⚠️",
    label: "PAUSE",
  },
  strong_sell: {
    border: "border-red-300",
    bg: "from-red-50 via-red-50/50 to-transparent",
    badge: "bg-red-100",
    badgeText: "text-red-700",
    icon: "🛑",
    label: "AVOID",
  },
};

function TrendBar({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  const width = Math.min(Math.abs(value) * 10, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--text-secondary)] w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isPositive ? "bg-emerald-600" : "bg-red-600"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-14 text-right ${isPositive ? "text-emerald-700" : "text-red-700"}`}>
        {isPositive ? "+" : ""}{value.toFixed(2)}%
      </span>
    </div>
  );
}

export default function InvestmentSuggestions({ predictions, market }: InvestmentSuggestionsProps) {
  const suggestions = predictions.map(analyzeMetal);

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">💡</span>
        <div>
          <h3 className="text-lg font-bold">AI Investment Suggestions</h3>
          <p className="text-[10px] md:text-xs text-[var(--text-secondary)]">
            Smart recommendations based on predictions, sentiment & market factors · {market.currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((s) => {
          const style = SIGNAL_STYLES[s.signal];
          return (
            <div
              key={s.metal}
              className={`rounded-2xl border ${style.border} bg-gradient-to-b ${style.bg} p-4 md:p-5 transition-all hover:scale-[1.01]`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{METAL_ICONS[s.metal]}</span>
                  <span className="font-bold text-base capitalize">{METAL_LABELS[s.metal]}</span>
                </div>
                <span className={`${style.badge} ${style.badgeText} text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-widest`}>
                  {style.label}
                </span>
              </div>

              {/* Signal icon + headline */}
              <div className="flex items-start gap-2 mb-4">
                <span className="text-xl mt-0.5">{style.icon}</span>
                <p className="text-sm font-semibold leading-snug">{s.headline}</p>
              </div>

              {/* Trend bars */}
              <div className="space-y-2 mb-4">
                <TrendBar value={s.shortTermChange} label="Tomorrow" />
                <TrendBar value={s.longTermChange} label="3 Months" />
              </div>

              {/* Key insights */}
              <div className="space-y-2 mb-4">
                {s.details.slice(0, 3).map((detail, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">●</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Confidence + Sentiment */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Confidence</p>
                  <p className="text-sm font-bold">{(s.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Sentiment</p>
                  <p className={`text-sm font-bold ${s.sentiment >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {s.sentiment >= 0 ? "+" : ""}{(s.sentiment * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Factors</p>
                  <p className="text-sm font-bold">
                    <span className="text-emerald-700">{s.bullishFactors}</span>
                    <span className="text-[var(--text-secondary)] mx-0.5">/</span>
                    <span className="text-red-700">{s.bearishFactors}</span>
                  </p>
                </div>
              </div>

              {/* Action tip */}
              <div className={`rounded-xl ${style.badge} p-3 border border-gray-200`}>
                <p className="text-xs leading-relaxed text-[var(--text-primary)]">
                  <span className="font-bold">What to do: </span>
                  {s.actionTip}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-[10px] text-[var(--text-secondary)] text-center leading-relaxed">
          ⚠️ These suggestions are AI-generated based on market analysis and are <strong>not financial advice</strong>. 
          Always consult a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
