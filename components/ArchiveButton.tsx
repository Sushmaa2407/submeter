"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveButton({
  planId,
  isArchived,
}: {
  planId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggle() {
    setIsSubmitting(true);
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !isArchived }),
    });
    setIsSubmitting(false);
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
