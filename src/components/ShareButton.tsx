"use client";

import { MarketData } from "@/types";

interface ShareButtonProps {
  market: MarketData;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", CNY: "¥", EUR: "€", JPY: "¥",
};

function fmtPrice(n: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || "";
  return `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ShareButton({ market }: ShareButtonProps) {
  const handleShare = () => {
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const text = [
      `Metal Rates Today (${date})`,
      `🥇 Gold: ${fmtPrice(market.goldPrice, market.currency)}/10g`,
      `🥈 Silver: ${fmtPrice(market.silverPrice, market.currency)}/kg`,
      `💎 Platinum: ${fmtPrice(market.platinumPrice, market.currency)}/10g`,
      ``,
      `Live AI predictions & analysis:`,
      `https://metaldetector-digger.vercel.app`,
    ].join("\n");

    if (navigator.share) {
      navigator.share({ title: "Metal Rates Today", text }).catch(() => {});
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all"
    >
      <span>📤</span>
      <span className="hidden sm:inline">Share All Rates</span>
      <span className="sm:hidden">Share</span>
    </button>
  );
}
