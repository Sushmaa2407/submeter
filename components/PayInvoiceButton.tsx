"use client";

import { useState } from "react";

export default function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not start checkout.");
      setIsSubmitting(false);
      return;
    }

    const { url } = await response.json();
    // Full redirect to Stripe's own hosted page — this isn't our
    // UI anymore, it's Stripe's real, secure payment form.
    window.location.href = url;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handlePay}
        disabled={isSubmitting}
        className="rounded-md bg-teal-700 hover:bg-teal-800 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Redirecting…" : "Pay now"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
