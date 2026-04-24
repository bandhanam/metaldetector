"use client";

import { useState, useEffect, useCallback } from "react";
import { MarketData } from "@/types";

interface PriceAlertProps {
  market: MarketData;
}

interface AlertTarget {
  metal: "gold" | "silver" | "copper";
  targetPrice: number;
}

const STORAGE_KEY = "md_price_alerts";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", CNY: "¥", EUR: "€", JPY: "¥",
};

function getAlerts(): AlertTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: AlertTarget[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export default function PriceAlert({ market }: PriceAlertProps) {
  const [alerts, setAlerts] = useState<AlertTarget[]>([]);
  const [triggered, setTriggered] = useState<{ metal: string; target: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMetal, setFormMetal] = useState<"gold" | "silver" | "copper">("gold");
  const [formPrice, setFormPrice] = useState("");

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  const checkAlerts = useCallback(() => {
    const prices = { gold: market.goldPrice, silver: market.silverPrice, copper: market.copperPrice };
    const hits: { metal: string; target: number }[] = [];
    const remaining: AlertTarget[] = [];

    for (const a of alerts) {
      if (prices[a.metal] <= a.targetPrice) {
        hits.push({ metal: a.metal, target: a.targetPrice });
      } else {
        remaining.push(a);
      }
    }

    if (hits.length > 0) {
      setTriggered(hits);
      setAlerts(remaining);
      saveAlerts(remaining);
    }
  }, [alerts, market]);

  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  const addAlert = () => {
    const price = parseFloat(formPrice);
    if (!price || price <= 0) return;
    const updated = [...alerts, { metal: formMetal, targetPrice: price }];
    setAlerts(updated);
    saveAlerts(updated);
    setFormPrice("");
    setShowForm(false);
  };

  const removeAlert = (index: number) => {
    const updated = alerts.filter((_, i) => i !== index);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const sym = CURRENCY_SYMBOLS[market.currency] || "";

  return (
    <div className="glass-card p-4">
      {/* Triggered alerts */}
      {triggered.map((t, i) => (
        <div key={i} className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Price Alert Reached!
              </p>
              <p className="text-xs text-emerald-700">
                {t.metal.charAt(0).toUpperCase() + t.metal.slice(1)} has reached your target of {sym}{t.target.toLocaleString("en-IN")}
              </p>
            </div>
            <button onClick={() => setTriggered(triggered.filter((_, j) => j !== i))} className="ml-auto text-xs text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h4 className="text-sm font-bold">Price Alerts</h4>
          <span className="text-[10px] text-[var(--text-secondary)]">Set your target & get notified</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-medium transition-all"
        >
          {showForm ? "Cancel" : "+ Add Alert"}
        </button>
      </div>

      {showForm && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <select
            value={formMetal}
            onChange={(e) => setFormMetal(e.target.value as "gold" | "silver" | "copper")}
            className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium"
          >
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="copper">Copper</option>
          </select>
          <input
            type="number"
            placeholder={`Target price (${sym})`}
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium"
          />
          <button
            onClick={addAlert}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all"
          >
            Set Alert
          </button>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
              <span>
                <span className="font-semibold capitalize">{a.metal}</span> ≤ {sym}{a.targetPrice.toLocaleString("en-IN")}
              </span>
              <button onClick={() => removeAlert(i)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
            </div>
          ))}
        </div>
      )}

      {alerts.length === 0 && !showForm && (
        <p className="text-[10px] text-[var(--text-secondary)]">
          No alerts set. Add one to get notified when prices drop to your target!
        </p>
      )}
    </div>
  );
}
