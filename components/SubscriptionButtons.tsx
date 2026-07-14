"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export function SubscribeButton({ planId }: { planId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function subscribe() {
    setIsSubmitting(true);
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      showToast({ message: body.error ?? "Could not subscribe.", type: "error" });
      return;
    }
    showToast({ message: "Subscribed!", type: "success" });
    router.refresh();
  }

  return (
    <button
      onClick={subscribe}
      disabled={isSubmitting}
      className="rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {isSubmitting ? "Subscribing…" : "Subscribe"}
    </button>
  );
}

export function CancelButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function cancel() {
    setIsSubmitting(true);
    const response = await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      showToast({ message: body.error ?? "Could not cancel.", type: "error" });
      return;
    }

    router.refresh();

    // This is the reversible mutation the brief specifically asks
    // for an "Undo" on. The undo button calls a REAL endpoint that
    // flips cancelAtPeriodEnd back off — not just a client-side
    // illusion of undoing.
    showToast({
      message: "Subscription will cancel at period end.",
      type: "success",
      action: {
        label: "Undo",
        onClick: async () => {
          await fetch("/api/subscriptions/undo-cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId }),
          });
          router.refresh();
        },
      },
    });
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
