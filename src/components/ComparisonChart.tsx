"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PricePrediction } from "@/types";

interface ComparisonChartProps {
  predictions: PricePrediction[];
}

export default function ComparisonChart({ predictions }: ComparisonChartProps) {
  const chartData = [
    { name: "Now", gold: 0, silver: 0, copper: 0 },
    ...predictions[0]?.predictions.map((_, i) => {
      const point: Record<string, unknown> = {
        name: predictions[0].predictions[i].label,
      };
      predictions.forEach((p) => {
        point[p.metal] = p.predictions[i]?.changePercent || 0;
      });
      return point;
    }) || [],
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="text-lg font-bold mb-4">
        Price Change Comparison (% from current)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#e8e8f0",
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(2)}%`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="gold"
            stroke="#FFD700"
            strokeWidth={2.5}
            dot={{ fill: "#FFD700", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="silver"
            stroke="#C0C0C0"
            strokeWidth={2.5}
            dot={{ fill: "#C0C0C0", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="copper"
            stroke="#B87333"
            strokeWidth={2.5}
            dot={{ fill: "#B87333", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
