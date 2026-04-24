"use client";

import { useState } from "react";
import { MarketData } from "@/types";

interface GoldPurityCalculatorProps {
  market: MarketData;
}

const PURITY_OPTIONS = [
  { label: "24K (999)", factor: 1.0, description: "Pure Gold" },
  { label: "22K (916)", factor: 0.916, description: "Jewellery Standard" },
  { label: "18K (750)", factor: 0.75, description: "Fashion Jewellery" },
  { label: "14K (585)", factor: 0.585, description: "Affordable Gold" },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", CNY: "¥", EUR: "€", JPY: "¥",
};

function fmt(n: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || "";
  return `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function GoldPurityCalculator({ market }: GoldPurityCalculatorProps) {
  const [weight, setWeight] = useState<string>("10");
  const [purity, setPurity] = useState<number>(0.916);
  const [makingCharge, setMakingCharge] = useState<string>("12");

  const goldPer10g = market.goldPrice;
  const goldPerGram = goldPer10g / 10;
  const weightNum = parseFloat(weight) || 0;
  const makingNum = parseFloat(makingCharge) || 0;

  const goldValue = goldPerGram * purity * weightNum;
  const makingCost = goldValue * (makingNum / 100);
  const gst = (goldValue + makingCost) * 0.03;
  const totalCost = goldValue + makingCost + gst;

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">💍</span>
        <div>
          <h3 className="text-lg font-bold">Gold Purity Calculator</h3>
          <p className="text-[10px] md:text-xs text-[var(--text-secondary)]">
            Sone ki Shudhta Calculator · Today&apos;s rate per gram &amp; jewellery cost
          </p>
        </div>
      </div>

      {/* Purity Price Table */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {PURITY_OPTIONS.map((p) => {
          const pricePerGram = goldPerGram * p.factor;
          const pricePer10g = pricePerGram * 10;
          return (
            <div
              key={p.label}
              className={`rounded-xl p-3 border text-center cursor-pointer transition-all ${
                purity === p.factor
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 bg-white hover:border-amber-200"
              }`}
              onClick={() => setPurity(p.factor)}
            >
              <p className="text-xs font-bold text-amber-700">{p.label}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{p.description}</p>
              <p className="text-sm font-extrabold mt-1">{fmt(pricePerGram, market.currency)}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">per gram</p>
              <p className="text-xs font-bold mt-0.5">{fmt(pricePer10g, market.currency)}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">per 10g</p>
            </div>
          );
        })}
      </div>

      {/* Jewellery Cost Estimator */}
      <div className="bg-amber-50/50 rounded-xl border border-amber-200/50 p-4">
        <h4 className="text-sm font-bold mb-3">Jewellery Cost Estimator</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Weight (grams)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Purity</label>
            <select
              value={purity}
              onChange={(e) => setPurity(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-amber-400 focus:outline-none"
            >
              {PURITY_OPTIONS.map((p) => (
                <option key={p.label} value={p.factor}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Making Charge %</label>
            <input
              type="number"
              value={makingCharge}
              onChange={(e) => setMakingCharge(e.target.value)}
              min="0"
              max="40"
              step="1"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Gold Value ({weightNum}g x {PURITY_OPTIONS.find(p => p.factor === purity)?.label})</span>
            <span className="font-semibold">{fmt(goldValue, market.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Making Charges ({makingNum}%)</span>
            <span className="font-semibold">{fmt(makingCost, market.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">GST (3%)</span>
            <span className="font-semibold">{fmt(gst, market.currency)}</span>
          </div>
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex justify-between text-base">
            <span className="font-bold">Estimated Total</span>
            <span className="font-extrabold text-amber-700">{fmt(totalCost, market.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
