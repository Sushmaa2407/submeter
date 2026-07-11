"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UsageSummary } from "@/types";

export default function UsageTracker({
  subscriptionId,
  summary,
}: {
  subscriptionId: string;
  summary: UsageSummary;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, quantity: parseInt(quantity, 10) }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not log usage.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-medium text-neutral-700">Usage this period</p>
        <p className="text-sm text-neutral-500">
          {summary.used} {summary.limit ? `/ ${summary.limit}` : "(unlimited)"}
        </p>
      </div>

      {/* Only show a progress bar when there's an actual limit to
          measure against — a bar with no ceiling means nothing. */}
      {summary.limit !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all ${
              summary.isNearLimit ? "bg-amber-500" : "bg-neutral-900"
            }`}
            style={{ width: `${Math.min(summary.percentUsed ?? 0, 100)}%` }}
          />
        </div>
      )}

      {summary.isNearLimit && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          You're close to your plan's usage limit. Consider upgrading.
        </p>
      )}

      <form onSubmit={handleLog} className="mt-4 flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">
            Log usage (demo)
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
        >
          {isSubmitting ? "Logging…" : "Log usage"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
