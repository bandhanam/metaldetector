"use client";

import { PredictionFactor } from "@/types";

interface FactorsPanelProps {
  factors: PredictionFactor[];
  metal: string;
}

const IMPACT_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  bullish: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "↑" },
  bearish: { bg: "bg-red-50", text: "text-red-700", icon: "↓" },
  neutral: { bg: "bg-blue-50", text: "text-blue-700", icon: "→" },
};

export default function FactorsPanel({ factors, metal }: FactorsPanelProps) {
  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="text-lg font-bold mb-4 capitalize">
        {metal} Price Factors
      </h3>
      <div className="space-y-3">
        {factors.map((factor, i) => {
          const style = IMPACT_STYLES[factor.impact];
          return (
            <div
              key={i}
              className={`${style.bg} rounded-xl p-3.5 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm">{factor.name}</span>
                <span
                  className={`${style.text} text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} uppercase tracking-wider`}
                >
                  {style.icon} {factor.impact}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {factor.description}
              </p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.impact === "bullish"
                      ? "bg-emerald-500"
                      : factor.impact === "bearish"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                  style={{ width: `${factor.weight * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
