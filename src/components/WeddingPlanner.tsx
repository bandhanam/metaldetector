"use client";

import { useState, useEffect, useCallback } from "react";

interface JewelleryItem {
  name: string;
  weight: number;
  quantity: number;
}

const PRESET_ITEMS = [
  { name: "Necklace Set", defaultWeight: 50 },
  { name: "Bangles (set of 4)", defaultWeight: 30 },
  { name: "Earrings / Jhumka", defaultWeight: 10 },
  { name: "Maang Tikka", defaultWeight: 8 },
  { name: "Chain", defaultWeight: 15 },
  { name: "Ring", defaultWeight: 5 },
  { name: "Nose Pin", defaultWeight: 2 },
  { name: "Armlet / Bajuband", defaultWeight: 12 },
];

const PURITY_22K = 0.916;
const MAKING_CHARGE_PCT = 12;
const GST_PCT = 3;

interface PriceData {
  goldPer10g: number;
  prediction3m: number | null;
}

export default function WeddingPlanner() {
  const [items, setItems] = useState<JewelleryItem[]>([
    { name: "Necklace Set", weight: 50, quantity: 1 },
    { name: "Bangles (set of 4)", weight: 30, quantity: 1 },
    { name: "Earrings / Jhumka", weight: 10, quantity: 1 },
  ]);
  const [makingCharge, setMakingCharge] = useState(MAKING_CHARGE_PCT);
  const [priceData, setPriceData] = useState<PriceData>({ goldPer10g: 0, prediction3m: null });
  const [loading, setLoading] = useState(true);
  const [customName, setCustomName] = useState("");
  const [customWeight, setCustomWeight] = useState("");

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const result = await res.json();
      const indiaMarket = result.data?.markets?.find((m: { countryCode: string }) => m.countryCode === "IN");
      const goldPred = result.data?.predictions?.find((p: { metal: string }) => p.metal === "gold");
      const pred3m = goldPred?.predictions?.find((p: { label: string }) => p.label.includes("3"));
      setPriceData({
        goldPer10g: indiaMarket?.goldPrice || 0,
        prediction3m: pred3m?.predictedPrice || null,
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const goldPerGram = priceData.goldPer10g / 10;
  const goldValue = goldPerGram * PURITY_22K * totalWeight;
  const makingCost = goldValue * (makingCharge / 100);
  const gst = (goldValue + makingCost) * (GST_PCT / 100);
  const totalCost = goldValue + makingCost + gst;

  let futureTotal: number | null = null;
  let savingsOrLoss: number | null = null;
  if (priceData.prediction3m) {
    const futurePerGram = priceData.prediction3m / 10;
    const futureGoldValue = futurePerGram * PURITY_22K * totalWeight;
    const futureMaking = futureGoldValue * (makingCharge / 100);
    const futureGst = (futureGoldValue + futureMaking) * (GST_PCT / 100);
    futureTotal = futureGoldValue + futureMaking + futureGst;
    savingsOrLoss = futureTotal - totalCost;
  }

  const addItem = (name: string, weight: number) => {
    setItems([...items, { name, weight, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof JewelleryItem, value: string | number) => {
    const updated = [...items];
    if (field === "name") {
      updated[index] = { ...updated[index], name: value as string };
    } else {
      updated[index] = { ...updated[index], [field]: Math.max(0, Number(value)) };
    }
    setItems(updated);
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customWeight) return;
    addItem(customName.trim(), parseFloat(customWeight) || 10);
    setCustomName("");
    setCustomWeight("");
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 shimmer h-32" />
        <div className="glass-card p-6 shimmer h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Item List */}
      <div className="glass-card p-4 md:p-6">
        <h3 className="text-base font-bold mb-4">Your Jewellery List</h3>

        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg flex-wrap">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                className="flex-1 min-w-[120px] px-2 py-1 rounded border border-gray-200 text-sm"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => updateItem(i, "weight", e.target.value)}
                  className="w-16 px-2 py-1 rounded border border-gray-200 text-sm text-center"
                  min="0"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">grams</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--text-secondary)]">×</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  className="w-12 px-2 py-1 rounded border border-gray-200 text-sm text-center"
                  min="1"
                />
              </div>
              <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
            </div>
          ))}
        </div>

        {/* Quick add presets */}
        <div className="mb-3">
          <p className="text-[10px] text-[var(--text-secondary)] mb-1.5">Quick Add:</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ITEMS.filter(p => !items.some(i => i.name === p.name)).map((preset) => (
              <button
                key={preset.name}
                onClick={() => addItem(preset.name, preset.defaultWeight)}
                className="text-[10px] px-2 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom item */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Custom item name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
          />
          <input
            type="number"
            placeholder="Weight (g)"
            value={customWeight}
            onChange={(e) => setCustomWeight(e.target.value)}
            className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
          />
          <button
            onClick={addCustomItem}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium border border-gray-200"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Making Charge Slider */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Making Charges: {makingCharge}%</span>
          <span className="text-[10px] text-[var(--text-secondary)]">Typical: 8-25%</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={makingCharge}
          onChange={(e) => setMakingCharge(parseInt(e.target.value))}
          className="w-full accent-amber-600"
        />
      </div>

      {/* Cost Summary */}
      <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200">
        <h3 className="text-base font-bold mb-4">Cost Estimate at Today&apos;s Rate</h3>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="p-3 bg-white rounded-xl text-center">
            <p className="text-[10px] text-[var(--text-secondary)]">Total Gold Weight</p>
            <p className="text-xl font-extrabold">{totalWeight}g</p>
          </div>
          <div className="p-3 bg-white rounded-xl text-center">
            <p className="text-[10px] text-[var(--text-secondary)]">Today&apos;s 22K Rate</p>
            <p className="text-xl font-extrabold">{fmt(goldPerGram * PURITY_22K)}/g</p>
          </div>
        </div>

        <div className="space-y-1.5 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Gold Value (22K)</span>
            <span className="font-semibold">{fmt(goldValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Making Charges ({makingCharge}%)</span>
            <span className="font-semibold">{fmt(makingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">GST (3%)</span>
            <span className="font-semibold">{fmt(gst)}</span>
          </div>
          <div className="h-px bg-amber-200 my-1" />
          <div className="flex justify-between text-lg">
            <span className="font-bold">Total Estimated Cost</span>
            <span className="font-extrabold text-amber-700">{fmt(totalCost)}</span>
          </div>
        </div>

        {/* Buy Now vs Wait */}
        {futureTotal !== null && savingsOrLoss !== null && (
          <div className={`p-4 rounded-xl ${savingsOrLoss > 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
            <p className="text-sm font-bold mb-2">
              {savingsOrLoss > 0 ? "🟢 Buy Now & Save!" : "🔴 Prices May Drop — Consider Waiting"}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Buy Today</p>
                <p className="font-bold">{fmt(totalCost)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)]">Estimated in 3 Months</p>
                <p className="font-bold">{fmt(futureTotal)}</p>
              </div>
            </div>
            <p className={`text-xs font-semibold mt-2 ${savingsOrLoss > 0 ? "text-emerald-700" : "text-red-700"}`}>
              {savingsOrLoss > 0
                ? `You could save ${fmt(savingsOrLoss)} by buying today!`
                : `Prices may drop by ${fmt(Math.abs(savingsOrLoss))} in 3 months — consider waiting.`}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              Based on our AI price prediction. Actual prices may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
