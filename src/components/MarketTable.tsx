"use client";

import { MarketData } from "@/types";

interface MarketTableProps {
  markets: MarketData[];
}

const FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  CN: "🇨🇳",
  US: "🇺🇸",
  EU: "🇪🇺",
  JP: "🇯🇵",
};

export default function MarketTable({ markets }: MarketTableProps) {
  return (
    <div className="glass-card p-4 md:p-6 overflow-x-auto">
      <h3 className="text-lg font-bold mb-4">Global Markets Overview</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--text-secondary)] border-b border-[var(--border)]">
            <th className="text-left py-2 px-2 font-medium">Market</th>
            <th className="text-right py-2 px-2 font-medium">
              <span className="text-yellow-400">Gold</span>
            </th>
            <th className="text-right py-2 px-2 font-medium">
              <span className="text-gray-300">Silver</span>
            </th>
            <th className="text-right py-2 px-2 font-medium hidden md:table-cell">
              <span className="text-orange-400">Copper</span>
            </th>
            <th className="text-right py-2 px-2 font-medium hidden lg:table-cell">GDP</th>
            <th className="text-right py-2 px-2 font-medium hidden lg:table-cell">CPI</th>
            <th className="text-right py-2 px-2 font-medium hidden lg:table-cell">Rate</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr
              key={m.countryCode}
              className="border-b border-[var(--border)]/50 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{FLAGS[m.countryCode]}</span>
                  <div>
                    <span className="font-medium block">{m.country}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {m.currency}
                    </span>
                  </div>
                </div>
              </td>
              <td className="text-right py-3 px-2 font-semibold text-yellow-400">
                <div>{formatPrice(m.goldPrice, m.currency, false)}</div>
                <div className="text-[9px] text-[var(--text-secondary)] font-normal">/10g</div>
              </td>
              <td className="text-right py-3 px-2 font-semibold text-gray-300">
                <div>{formatPrice(m.silverPrice, m.currency, true)}</div>
                <div className="text-[9px] text-[var(--text-secondary)] font-normal">/kg</div>
              </td>
              <td className="text-right py-3 px-2 font-semibold text-orange-400 hidden md:table-cell">
                <div>{formatPrice(m.copperPrice, m.currency, true)}</div>
                <div className="text-[9px] text-[var(--text-secondary)] font-normal">/kg</div>
              </td>
              <td className="text-right py-3 px-2 hidden lg:table-cell">
                <span
                  className={
                    m.gdpGrowth > 3
                      ? "text-emerald-400"
                      : m.gdpGrowth > 1
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {m.gdpGrowth}%
                </span>
              </td>
              <td className="text-right py-3 px-2 hidden lg:table-cell">
                <span
                  className={
                    m.inflation > 4
                      ? "text-red-400"
                      : m.inflation > 2
                        ? "text-yellow-400"
                        : "text-emerald-400"
                  }
                >
                  {m.inflation}%
                </span>
              </td>
              <td className="text-right py-3 px-2 hidden lg:table-cell text-[var(--text-secondary)]">
                {m.centralBankRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPrice(price: number, currency: string, isCopper: boolean = false): string {
  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
    CNY: "¥",
    EUR: "€",
    JPY: "¥",
  };
  
  if (currency === "JPY" && !isCopper) {
    return `${symbols[currency]}${Math.round(price).toLocaleString()}`;
  }
  
  return `${symbols[currency] || ""}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
