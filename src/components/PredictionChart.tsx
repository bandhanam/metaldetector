"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PricePrediction, MarketData } from "@/types";

interface PredictionChartProps {
  prediction: PricePrediction;
  market: MarketData;
}

const METAL_CHART_COLORS: Record<
  string,
  { main: string; gradient1: string; gradient2: string }
> = {
  gold: { main: "#FFD700", gradient1: "#FFD700", gradient2: "#B8860B" },
  silver: { main: "#C0C0C0", gradient1: "#E8E8E8", gradient2: "#808080" },
  copper: { main: "#B87333", gradient1: "#D4956A", gradient2: "#8B4513" },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  CNY: "¥",
  EUR: "€",
  JPY: "¥",
};

export default function PredictionChart({ prediction, market }: PredictionChartProps) {
  const colors = METAL_CHART_COLORS[prediction.metal];
  const sym = CURRENCY_SYMBOLS[market.currency] || "";

  const localPrice =
    prediction.metal === "gold"
      ? market.goldPrice
      : prediction.metal === "silver"
        ? market.silverPrice
        : market.copperPrice;

  const chartData = [
    {
      name: "Now",
      price: localPrice,
      low: localPrice,
      high: localPrice,
    },
    ...prediction.predictions.map((p) => {
      const predicted = localPrice * (1 + p.changePercent / 100);
      const ratio = p.predictedPrice > 0 ? p.low / p.predictedPrice : 0.97;
      const ratioHigh = p.predictedPrice > 0 ? p.high / p.predictedPrice : 1.03;
      return {
        name: p.label,
        price: Math.round(predicted * 100) / 100,
        low: Math.round(predicted * ratio * 100) / 100,
        high: Math.round(predicted * ratioHigh * 100) / 100,
      };
    }),
  ];

  const allValues = chartData.flatMap((d) => [d.low, d.high, d.price]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.15;

  const formatValue = (v: number) => {
    if (v >= 100000) return `${sym}${(v / 1000).toFixed(0)}K`;
    if (v >= 10000) return `${sym}${(v / 1000).toFixed(1)}K`;
    if (v >= 1000) return `${sym}${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return `${sym}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold capitalize">
          {prediction.metal} Price Forecast ({market.currency})
        </h3>
        <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: colors.main }}
            />
            Predicted
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded opacity-20"
              style={{ backgroundColor: colors.main }}
            />
            Range
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${prediction.metal}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.gradient2} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`range-${prediction.metal}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.main} stopOpacity={0.1} />
              <stop offset="95%" stopColor={colors.main} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis
            dataKey="name"
            stroke="rgba(0,0,0,0.2)"
            tick={{ fill: "#2c3e50", fontSize: 11 }}
            axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
          />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            stroke="rgba(0,0,0,0.2)"
            tick={{ fill: "#2c3e50", fontSize: 11 }}
            axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #dce1e8",
              borderRadius: "12px",
              color: "#1a1a2e",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              `${sym}${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              String(name) === "price" ? "Predicted" : String(name) === "high" ? "High" : "Low",
            ]}
          />
          <ReferenceLine
            y={localPrice}
            stroke="rgba(0,0,0,0.2)"
            strokeDasharray="5 5"
            label={{
              value: "Current",
              fill: "#2c3e50",
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="high"
            stroke="transparent"
            fill={`url(#range-${prediction.metal})`}
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="transparent"
            fill="var(--bg-primary)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.main}
            strokeWidth={2.5}
            fill={`url(#grad-${prediction.metal})`}
            fillOpacity={1}
            dot={{ fill: colors.main, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: colors.main, strokeWidth: 2, fill: "var(--bg-primary)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
