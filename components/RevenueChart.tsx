"use client";

// ============================================================
// Charts need "use client" — recharts draws using browser APIs
// (measuring pixel sizes, animating), which can't run on the
// server. The PAGE stays a server component; only this small
// piece needs the browser.
// ============================================================
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { RevenuePoint } from "@/types";

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const chartData = data.map((point) => ({
    month: point.month,
    revenue: point.revenueCents / 100, // display in dollars, not cents
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#a3a3a3"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            contentStyle={{ fontSize: 13, borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#171717"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
