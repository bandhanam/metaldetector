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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis
            dataKey="name"
            stroke="rgba(0,0,0,0.2)"
            tick={{ fill: "#2c3e50", fontSize: 11 }}
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
              `${Number(value).toFixed(2)}%`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
          <Legend
            wrapperStyle={{ color: "#2c3e50", fontSize: "12px" }}
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
