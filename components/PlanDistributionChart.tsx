"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PlanDistributionSlice } from "@/types";

// A small, restrained palette — matches the "one accent, neutral
// grays" design guidance rather than reaching for a rainbow.
const COLORS = ["#171717", "#525252", "#a3a3a3", "#d4d4d4"];

export default function PlanDistributionChart({
  data,
}: {
  data: PlanDistributionSlice[];
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-neutral-400">
        No active subscribers yet.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="subscriberCount"
            nameKey="planName"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) => `${entry.planName} (${entry.subscriberCount})`}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
