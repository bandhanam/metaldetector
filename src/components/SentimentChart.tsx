"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { PricePrediction } from "@/types";

interface SentimentChartProps {
  predictions: PricePrediction[];
}

export default function SentimentChart({ predictions }: SentimentChartProps) {
  const barData = predictions.map((p) => ({
    metal: p.metal.charAt(0).toUpperCase() + p.metal.slice(1),
    sentiment: Math.round(p.sentimentScore * 100),
    confidence: Math.round(p.confidence * 100),
  }));

  const radarData = predictions.flatMap((p) =>
    p.factors.map((f) => ({
      factor: f.name,
      [p.metal]: f.weight * 100 * (f.impact === "bearish" ? -1 : 1),
    }))
  );

  const mergedRadar = radarData.reduce(
    (acc, item) => {
      const existing = acc.find((a) => a.factor === item.factor);
      if (existing) {
        Object.assign(existing, item);
      } else {
        acc.push({ ...item });
      }
      return acc;
    },
    [] as Record<string, unknown>[]
  );

  const COLORS: Record<string, string> = {
    Gold: "#FFD700",
    Silver: "#C0C0C0",
    Copper: "#B87333",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card p-4 md:p-6">
        <h3 className="text-lg font-bold mb-4">Sentiment & Confidence</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis
              dataKey="metal"
              stroke="rgba(0,0,0,0.2)"
              tick={{ fill: "#2c3e50", fontSize: 12 }}
            />
            <YAxis
              stroke="rgba(0,0,0,0.2)"
              tick={{ fill: "#2c3e50", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #dce1e8",
                borderRadius: "12px",
                color: "#1a1a2e",
              }}
              formatter={(value, name) => [
                `${Number(value)}%`,
                String(name) === "sentiment" ? "Sentiment" : "Confidence",
              ]}
            />
            <Bar dataKey="sentiment" name="sentiment" radius={[6, 6, 0, 0]}>
              {barData.map((entry) => (
                <Cell
                  key={entry.metal}
                  fill={COLORS[entry.metal]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
            <Bar dataKey="confidence" name="confidence" radius={[6, 6, 0, 0]}>
              {barData.map((entry) => (
                <Cell
                  key={entry.metal}
                  fill={COLORS[entry.metal]}
                  fillOpacity={0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-4 md:p-6">
        <h3 className="text-lg font-bold mb-4">Factor Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={mergedRadar}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis
              dataKey="factor"
              tick={{ fill: "#2c3e50", fontSize: 10 }}
            />
            <PolarRadiusAxis
              tick={{ fill: "#2c3e50", fontSize: 9 }}
            />
            <Radar
              name="Gold"
              dataKey="gold"
              stroke="#FFD700"
              fill="#FFD700"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Silver"
              dataKey="silver"
              stroke="#C0C0C0"
              fill="#C0C0C0"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="Copper"
              dataKey="copper"
              stroke="#B87333"
              fill="#B87333"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #dce1e8",
                borderRadius: "12px",
                color: "#1a1a2e",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
