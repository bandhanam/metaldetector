"use client";

import { useState } from "react";
import { AuspiciousDatePrediction, MarketData } from "@/types";

interface AuspiciousDaysProps {
  predictions?: AuspiciousDatePrediction[];
  market?: MarketData;
}

const AUSPICIOUS_DATES_2026 = [
  { date: "2026-01-14", name: "Makar Sankranti", desc: "Auspicious for gold purchases" },
  { date: "2026-01-29", name: "Vasant Panchami", desc: "New beginnings & gold buying" },
  { date: "2026-03-14", name: "Holika Dahan", desc: "Traditional gold buying day" },
  { date: "2026-03-25", name: "Gudi Padwa / Ugadi", desc: "New Year — buy gold for prosperity" },
  { date: "2026-04-14", name: "Baisakhi / Tamil New Year", desc: "Harvest festival — auspicious for investments" },
  { date: "2026-04-26", name: "Akshaya Tritiya", desc: "Best day to buy gold — prosperity never diminishes" },
  { date: "2026-07-10", name: "Rath Yatra", desc: "Auspicious for precious metal purchases" },
  { date: "2026-08-12", name: "Janmashtami", desc: "Lord Krishna birthday — gold buying tradition" },
  { date: "2026-10-02", name: "Navratri Begins", desc: "9 auspicious nights for gold purchases" },
  { date: "2026-10-12", name: "Dussehra", desc: "Victory festival — buy gold for good fortune" },
  { date: "2026-10-29", name: "Dhanteras", desc: "India's #1 gold buying day — Lakshmi puja" },
  { date: "2026-10-31", name: "Diwali", desc: "Festival of lights — gold & silver tradition" },
  { date: "2026-11-02", name: "Govardhan Puja", desc: "Auspicious post-Diwali gold day" },
  { date: "2026-11-16", name: "Dev Deepawali", desc: "Celestial Diwali — sacred for gold" },
];

function getNextAuspicious() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const currentEvent = AUSPICIOUS_DATES_2026.find((d) => d.date === todayStr);

  for (const event of AUSPICIOUS_DATES_2026) {
    const eventDate = new Date(event.date + "T00:00:00");
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
      return { current: currentEvent || null, next: event, daysUntil: diff };
    }
  }
  return { current: currentEvent || null, next: null, daysUntil: 0 };
}

function fmtINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtUSD(n: number, market?: MarketData): string {
  if (!market || market.currency === "INR") return fmtINR(n);
  const symbols: Record<string, string> = { USD: "$", CNY: "¥", EUR: "€", JPY: "¥", INR: "₹" };
  return `${symbols[market.currency] || ""}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function AuspiciousDays({ predictions, market }: AuspiciousDaysProps) {
  const { current, next, daysUntil } = getNextAuspicious();
  const [showAll, setShowAll] = useState(false);

  if (!current && !next) return null;

  const hasPredictions = predictions && predictions.length > 0;
  const futurePredictions = predictions?.filter(p => p.daysAway > 0).slice(0, showAll ? undefined : 5);
  const nextPred = futurePredictions?.[0];

  const goldPrice = market?.goldPrice || 0;
  const isINR = !market || market.currency === "INR";

  // Convert USD-based predictions to local currency for display
  const conversionFactor = goldPrice > 0 && nextPred ? goldPrice / nextPred.goldPredicted : 0;
  const canConvert = conversionFactor > 0.5 && conversionFactor < 200;

  const convertToLocal = (usdPrice: number): number => {
    if (!canConvert) return usdPrice;
    return usdPrice * conversionFactor;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-3 space-y-2">
      {/* Today's auspicious day highlight */}
      {current && (
        <div className="rounded-xl bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border border-amber-300 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪔</span>
            <div>
              <p className="text-sm md:text-base font-bold text-amber-800">
                Today is {current.name}!
              </p>
              <p className="text-xs text-amber-700">
                {current.desc}. Traditionally one of the most auspicious days to buy gold and silver in India.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next auspicious day + prediction */}
      {next && (
        <div className="rounded-xl bg-white border border-amber-200/60 p-2.5 md:p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg">📅</span>
            <p className="text-xs text-[var(--text-secondary)] flex-1">
              <span className="font-semibold text-amber-700">Next Auspicious Day:</span>{" "}
              {next.name} — <span className="font-medium">{daysUntil} day{daysUntil !== 1 ? "s" : ""} away</span>{" "}
              <span className="hidden sm:inline">· {next.desc}</span>
            </p>
            {nextPred && goldPrice > 0 && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                nextPred.goldChangePercent >= 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}>
                Gold: {nextPred.goldChangePercent >= 0 ? "▲" : "▼"} {Math.abs(nextPred.goldChangePercent).toFixed(1)}%
                {nextPred.goldChangePercent < 0 ? " — better price expected!" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auspicious dates forecast table */}
      {hasPredictions && futurePredictions && futurePredictions.length > 0 && (
        <div className="rounded-xl bg-white border border-amber-200/40 overflow-hidden">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🔮</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                AI Price Forecast on Auspicious Days
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                (शुभ दिनों पर सोने का अनुमानित भाव)
              </span>
            </div>
            <span className="text-xs text-amber-600 font-medium">
              {showAll ? "Show less ▲" : `Show all ${predictions?.filter(p => p.daysAway > 0).length || 0} dates ▼`}
            </span>
          </button>

          <div className="px-4 pb-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 font-semibold text-[var(--text-secondary)]">Festival</th>
                    <th className="text-left py-1.5 font-semibold text-[var(--text-secondary)]">Date</th>
                    <th className="text-right py-1.5 font-semibold text-[var(--text-secondary)]">
                      Gold {isINR ? "/10g" : ""} (Est.)
                    </th>
                    <th className="text-right py-1.5 font-semibold text-[var(--text-secondary)]">Change</th>
                    <th className="text-right py-1.5 font-semibold text-[var(--text-secondary)] hidden sm:table-cell">
                      Silver (Est.)
                    </th>
                    <th className="text-right py-1.5 font-semibold text-[var(--text-secondary)] hidden sm:table-cell">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {futurePredictions.map((pred) => {
                    const displayGold = canConvert ? convertToLocal(pred.goldPredicted) : pred.goldPredicted;
                    const displaySilver = canConvert ? convertToLocal(pred.silverPredicted) : pred.silverPredicted;
                    const isBuySignal = pred.goldChangePercent < 0;

                    return (
                      <tr key={pred.date} className="border-b border-gray-50 hover:bg-amber-50/30">
                        <td className="py-2 font-medium text-[var(--text-primary)]">{pred.name}</td>
                        <td className="py-2 text-[var(--text-secondary)]">
                          {new Date(pred.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          <span className="text-[10px] ml-1 text-[var(--text-secondary)]">({pred.daysAway}d)</span>
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {canConvert ? fmtUSD(displayGold, market) : `$${displayGold.toFixed(0)}`}
                        </td>
                        <td className={`py-2 text-right font-semibold ${
                          pred.goldChangePercent >= 0 ? "text-red-600" : "text-emerald-600"
                        }`}>
                          {pred.goldChangePercent >= 0 ? "+" : ""}{pred.goldChangePercent.toFixed(1)}%
                        </td>
                        <td className="py-2 text-right text-[var(--text-secondary)] hidden sm:table-cell">
                          {canConvert ? fmtUSD(displaySilver, market) : `$${displaySilver.toFixed(0)}`}
                        </td>
                        <td className="py-2 text-right hidden sm:table-cell">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isBuySignal
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {isBuySignal ? "Good to Buy" : "Price May Rise"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2">
              AI predictions based on sentiment analysis, technical indicators, seasonal demand patterns & historical data. Not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
