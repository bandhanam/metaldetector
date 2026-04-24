"use client";

import { useState } from "react";

interface Partner {
  name: string;
  description: string;
  minInvestment: string;
  purity: string;
  url: string;
  features: string[];
  badge?: string;
}

const PARTNERS: Partner[] = [
  {
    name: "MMTC-PAMP",
    description: "India's only LBMA-certified gold refinery. Buy 24K 999.9 pure digital gold.",
    minInvestment: "₹1",
    purity: "999.9 (24K)",
    url: "https://www.mmtcpamp.com/",
    features: ["LBMA Certified", "Physical Delivery", "SIP Available"],
    badge: "Most Trusted",
  },
  {
    name: "Augmont Gold",
    description: "Buy, sell & store gold/silver digitally. Backed by physical gold in secure vaults.",
    minInvestment: "₹10",
    purity: "999 (24K)",
    url: "https://www.augmont.com/",
    features: ["Gold SIP", "Silver Available", "Locker Storage"],
  },
  {
    name: "SafeGold",
    description: "Digital gold with insured vault storage. Convert to jewellery or coins anytime.",
    minInvestment: "₹10",
    purity: "999.9 (24K)",
    url: "https://www.safegold.com/",
    features: ["Insured Storage", "Jewellery Conversion", "Gift Gold"],
  },
  {
    name: "Sovereign Gold Bond (SGB)",
    description: "Government of India bonds with 2.5% annual interest + gold price appreciation.",
    minInvestment: "1 gram",
    purity: "Linked to 999 gold",
    url: "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=109",
    features: ["2.5% Interest", "Tax-Free Maturity", "RBI Backed"],
    badge: "Best Returns",
  },
  {
    name: "Gold ETFs (via Zerodha)",
    description: "Trade gold electronically on stock exchange. No storage hassle, high liquidity.",
    minInvestment: "~₹500",
    purity: "Tracks 999 gold",
    url: "https://zerodha.com/gold-etf/",
    features: ["High Liquidity", "No Storage Cost", "Demat Holding"],
  },
];

export default function DigitalGoldPartners() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
            🏦 Invest in Digital Gold & Silver
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            सोने में निवेश करें — Start from ₹1 · Compare top platforms
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          {expanded ? "Show less ▲" : "View all ▼"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(expanded ? PARTNERS : PARTNERS.slice(0, 3)).map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block p-4 rounded-xl border border-[var(--border)] hover:border-amber-300 hover:shadow-md transition-all bg-white"
          >
            {p.badge && (
              <span className="absolute -top-2 right-3 px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-full">
                {p.badge}
              </span>
            )}
            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-700 transition-colors">
              {p.name}
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">
              {p.description}
            </p>
            <div className="flex items-center gap-3 mt-2.5 text-[10px] text-[var(--text-secondary)]">
              <span>Min: <strong>{p.minInvestment}</strong></span>
              <span>Purity: <strong>{p.purity}</strong></span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.features.map((f) => (
                <span key={f} className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-700 rounded">
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-3 text-[11px] font-semibold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
              Visit {p.name} →
            </div>
          </a>
        ))}
      </div>

      <p className="text-[9px] text-[var(--text-secondary)] mt-4 leading-relaxed">
        * Links lead to official platforms. Metal Detector does not earn commissions currently.
        Investment in gold/silver involves market risk. Please read all scheme documents carefully before investing.
      </p>
    </div>
  );
}
