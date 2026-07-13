"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscribeButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Could not subscribe.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={subscribe}
        disabled={isSubmitting}
        className="rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Subscribing…" : "Subscribe"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function CancelButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function cancel() {
    setIsSubmitting(true);
    await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <button
      onClick={cancel}
      disabled={isSubmitting}
      className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
    >
      {isSubmitting ? "…" : "Cancel subscription"}
    </button>
  );
}
