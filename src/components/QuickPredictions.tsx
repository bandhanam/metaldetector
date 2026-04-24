"use client";

import { PricePrediction, MarketData } from "@/types";

interface QuickPredictionsProps {
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

function getUnit(metal: string): string {
  if (metal === "gold") return "10g";
  if (metal === "silver") return "kg";
  return "kg";
}

function formatLocal(price: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || "";
  if (currency === "JPY" && price > 1000) {
    return `${sym}${Math.round(price).toLocaleString()}`;
  }
  return `${sym}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuickPredictions({
  prediction,
  market,
}: QuickPredictionsProps) {
  const unit = getUnit(prediction.metal);

  const localPrice =
    prediction.metal === "gold"
      ? market.goldPrice
      : prediction.metal === "silver"
        ? market.silverPrice
        : market.platinumPrice;

  const keyTimeframes = [
    { label: "Tomorrow", index: 0 },
    { label: "2 Days", index: 1 },
    { label: "3 Days", index: 2 },
    { label: "Next Week", index: 3 },
    { label: "3 Months", index: 6 },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold mb-5 capitalize">
        {prediction.metal} Price Forecast
      </h3>

      <div className="space-y-4">
        {/* Current Rate */}
        <div className="bg-gray-50 rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                Current Rate (Today)
              </p>
              <p className="text-2xl font-black">
                {formatLocal(localPrice, market.currency)}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                {market.currency} / {unit}
              </p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>

        {/* Key Predictions — derive local price from changePercent */}
        {keyTimeframes.map(({ label, index }) => {
          const pred = prediction.predictions[index];
          if (!pred) return null;

          const predictedLocal = localPrice * (1 + pred.changePercent / 100);
          const lowLocal = predictedLocal * (pred.low / pred.predictedPrice);
          const highLocal = predictedLocal * (pred.high / pred.predictedPrice);
          const isPositive = pred.changePercent >= 0;

          return (
            <div
              key={label}
              className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)] hover:border-amber-400 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base mb-1">{label}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {pred.date}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span>{isPositive ? "▲" : "▼"}</span>
                  <span>{Math.abs(pred.changePercent).toFixed(2)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Predicted Price
                  </span>
                  <span className="text-xl font-extrabold">
                    {formatLocal(predictedLocal, market.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Range</span>
                  <span className="font-medium">
                    {formatLocal(lowLocal, market.currency)}
                    {" - "}
                    {formatLocal(highLocal, market.currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700 leading-relaxed">
          💡 Predictions based on {prediction.factors.length} factors including news
          sentiment, inflation, and central bank policy. Confidence:{" "}
          {(prediction.confidence * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
