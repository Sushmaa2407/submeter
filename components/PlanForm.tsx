"use client";

// ============================================================
// Small client component: the "create a new plan" form.
// It's separate from the page itself because the page is a
// SERVER component (it fetches data directly from the database
// with no loading spinner needed) — but a form with typing and
// clicking needs to run in the browser, so it gets its own
// "use client" file.
// ============================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function PlanForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // dollars, as typed by the human
  const [interval, setInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Humans type dollars ("10.00"); our database stores cents (1000).
    // Converting here, once, keeps every downstream calculation as
    // clean integer math with no floating-point rounding surprises.
    const priceCents = Math.round(parseFloat(price) * 100);

    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        priceCents,
        billingInterval: interval,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not create plan.");
      showToast({ message: body.error ?? "Could not create plan.", type: "error" });
      return;
    }

    setName("");
    setPrice("");
    setUsageLimit("");
    showToast({ message: "Plan created.", type: "success" });
    router.refresh(); // re-fetches the server component's data, so the new plan appears in the list immediately
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pro"
          className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">Price (USD)</label>
        <input
          required
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="10.00"
          className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">Billing</label>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value as "MONTHLY" | "YEARLY")}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        >
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">
          Usage limit <span className="text-neutral-400">(blank = unlimited)</span>
        </label>
        <input
          type="number"
          min="1"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          placeholder="1000"
          className="w-28 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Creating…" : "Add plan"}
      </button>

      {error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
