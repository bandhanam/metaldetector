"use client";

import { MarketData } from "@/types";

interface CountrySelectorProps {
  markets: MarketData[];
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
}

const FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  CN: "🇨🇳",
  US: "🇺🇸",
  EU: "🇪🇺",
  JP: "🇯🇵",
};

export default function CountrySelector({
  markets,
  selectedCountry,
  onSelectCountry,
}: CountrySelectorProps) {
  const selected = markets.find((m) => m.countryCode === selectedCountry);

  return (
    <div className="glass-card p-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
        Select Market
      </label>
      <div className="relative">
        <select
          value={selectedCountry}
          onChange={(e) => onSelectCountry(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 text-sm font-medium appearance-none cursor-pointer hover:border-white/20 focus:border-white/30 focus:outline-none transition-colors"
        >
          {markets.map((market) => (
            <option key={market.countryCode} value={market.countryCode}>
              {FLAGS[market.countryCode]} {market.country} ({market.currency})
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
          ▼
        </div>
      </div>

      {selected && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[var(--text-secondary)] mb-0.5">GDP Growth</p>
            <p
              className={`font-bold ${
                selected.gdpGrowth > 3
                  ? "text-emerald-400"
                  : selected.gdpGrowth > 1
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {selected.gdpGrowth}%
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[var(--text-secondary)] mb-0.5">Inflation</p>
            <p
              className={`font-bold ${
                selected.inflation > 4
                  ? "text-red-400"
                  : selected.inflation > 2
                    ? "text-yellow-400"
                    : "text-emerald-400"
              }`}
            >
              {selected.inflation}%
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[var(--text-secondary)] mb-0.5">CB Rate</p>
            <p className="font-bold text-blue-400">{selected.centralBankRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
