"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: "PENDING" | "PAID" | "FAILED";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function markAs(newStatus: "PAID" | "FAILED") {
    setIsSubmitting(true);
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      showToast({ message: "Could not update invoice.", type: "error" });
      return;
    }
    showToast({
      message: newStatus === "PAID" ? "Invoice marked paid." : "Invoice marked failed.",
      type: "success",
    });
    router.refresh();
  }

  if (status !== "PENDING") {
    return <span className="text-xs text-neutral-400">No action needed</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => markAs("PAID")}
        disabled={isSubmitting}
        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        Mark paid
      </button>
      <button
        onClick={() => markAs("FAILED")}
        disabled={isSubmitting}
        className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 disabled:opacity-50"
      >
        Mark failed
      </button>
    </div>
  );
}
