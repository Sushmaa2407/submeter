"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function ArchiveButton({
  planId,
  isArchived,
}: {
  planId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggle() {
    setIsSubmitting(true);
    const response = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !isArchived }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      showToast({ message: "Could not update plan.", type: "error" });
      return;
    }
    showToast({ message: isArchived ? "Plan unarchived." : "Plan archived.", type: "success" });
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={isSubmitting}
      className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 disabled:opacity-50"
    >
      {isSubmitting ? "…" : isArchived ? "Unarchive" : "Archive"}
    </button>
  );
}
