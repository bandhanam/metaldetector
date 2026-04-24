"use client";

import { useState, useEffect, useCallback } from "react";
import { MarketData } from "@/types";

interface PushNotificationProps {
  market: MarketData;
}

interface PriceSnapshot {
  gold: number;
  silver: number;
  platinum: number;
  timestamp: number;
}

const STORAGE_KEY = "md_push_prefs";
const SNAPSHOT_KEY = "md_price_snapshot";
const THRESHOLD_PERCENT = 2;

export default function PushNotification({ market }: PushNotificationProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true" && Notification.permission === "granted") {
      setEnabled(true);
    }
  }, []);

  const checkPriceChange = useCallback(() => {
    if (!enabled || !market) return;

    const raw = localStorage.getItem(SNAPSHOT_KEY);
    const now: PriceSnapshot = {
      gold: market.goldPrice,
      silver: market.silverPrice,
      platinum: market.platinumPrice,
      timestamp: Date.now(),
    };

    if (raw) {
      try {
        const prev: PriceSnapshot = JSON.parse(raw);
        const hoursSince = (Date.now() - prev.timestamp) / (1000 * 60 * 60);
        if (hoursSince < 1) return;

        const changes = [
          { metal: "Gold 🥇", prev: prev.gold, now: now.gold },
          { metal: "Silver 🥈", prev: prev.silver, now: now.silver },
          { metal: "Platinum 💎", prev: prev.platinum, now: now.platinum },
        ];

        const alerts: string[] = [];
        for (const c of changes) {
          if (c.prev === 0) continue;
          const pct = ((c.now - c.prev) / c.prev) * 100;
          if (Math.abs(pct) >= THRESHOLD_PERCENT) {
            const dir = pct > 0 ? "📈 UP" : "📉 DOWN";
            alerts.push(`${c.metal}: ${dir} ${Math.abs(pct).toFixed(1)}%`);
          }
        }

        if (alerts.length > 0 && Notification.permission === "granted") {
          const sw = navigator.serviceWorker?.controller;
          if (sw) {
            sw.postMessage({
              type: "SHOW_NOTIFICATION",
              title: "⚡ Price Alert!",
              body: alerts.join(" | "),
            });
          } else {
            new Notification("⚡ Metal Price Alert!", {
              body: alerts.join("\n"),
              icon: "/icons/icon-192.png",
            });
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(now));
  }, [enabled, market]);

  useEffect(() => {
    checkPriceChange();
  }, [checkPriceChange]);

  const handleToggle = async () => {
    if (!("Notification" in window)) return;

    if (!enabled) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY, "true");
        const snap: PriceSnapshot = {
          gold: market.goldPrice,
          silver: market.silverPrice,
          platinum: market.platinumPrice,
          timestamp: Date.now(),
        };
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));

        new Notification("🔔 Notifications Enabled!", {
          body: "You'll get alerts when prices move ±2% or more.",
          icon: "/icons/icon-192.png",
        });
      }
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
    }
  };

  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (permission === "denied") return null;

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
        enabled
          ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      }`}
      title={enabled ? "Price alerts ON — tap to disable" : "Enable price drop/rise notifications"}
    >
      <span>{enabled ? "🔔" : "🔕"}</span>
      <span className="hidden sm:inline">{enabled ? "Alerts ON" : "Enable Alerts"}</span>
    </button>
  );
}
