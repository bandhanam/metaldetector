"use client";

import { PricePrediction, MarketData } from "@/types";

interface PredictionTableProps {
  prediction: PricePrediction;
  market: MarketData;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  CNY: "¥",
  EUR: "€",
  JPY: "¥",
};

function formatLocal(price: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || "";
  if (currency === "JPY" && price > 1000) {
    return `${sym}${Math.round(price).toLocaleString()}`;
  }
  return `${sym}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PredictionTable({ prediction, market }: PredictionTableProps) {
  const localPrice =
    prediction.metal === "gold"
      ? market.goldPrice
      : prediction.metal === "silver"
        ? market.silverPrice
        : market.copperPrice;

  const unit = prediction.metal === "gold" ? "10g" : "kg";

  return (
    <div className="glass-card p-4 md:p-6 overflow-x-auto">
      <h3 className="text-lg font-bold mb-1 capitalize">
        {prediction.metal} Predictions Detail
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        {market.currency} per {unit} · {market.country}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--text-secondary)] border-b border-[var(--border)]">
            <th className="text-left py-2 px-2 font-medium">Timeframe</th>
            <th className="text-right py-2 px-2 font-medium">Predicted</th>
            <th className="text-right py-2 px-2 font-medium hidden sm:table-cell">Low</th>
            <th className="text-right py-2 px-2 font-medium hidden sm:table-cell">High</th>
            <th className="text-right py-2 px-2 font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {prediction.predictions.map((p) => {
            const isPositive = p.changePercent >= 0;
            const predictedLocal = localPrice * (1 + p.changePercent / 100);
            const ratio = p.predictedPrice > 0 ? p.low / p.predictedPrice : 0.97;
            const ratioHigh = p.predictedPrice > 0 ? p.high / p.predictedPrice : 1.03;
            const lowLocal = predictedLocal * ratio;
            const highLocal = predictedLocal * ratioHigh;

            return (
              <tr
                key={p.label}
                className="border-b border-[var(--border)]/50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-2">
                  <div>
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs text-[var(--text-secondary)] ml-2 hidden md:inline">
                      {p.date}
                    </span>
                  </div>
                </td>
                <td className="text-right py-3 px-2 font-semibold">
                  {formatLocal(predictedLocal, market.currency)}
                </td>
                <td className="text-right py-3 px-2 text-[var(--text-secondary)] hidden sm:table-cell">
                  {formatLocal(lowLocal, market.currency)}
                </td>
                <td className="text-right py-3 px-2 text-[var(--text-secondary)] hidden sm:table-cell">
                  {formatLocal(highLocal, market.currency)}
                </td>
                <td className="text-right py-3 px-2">
                  <span
                    className={`inline-flex items-center gap-0.5 font-semibold ${
                      isPositive ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {isPositive ? "▲" : "▼"} {Math.abs(p.changePercent).toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
