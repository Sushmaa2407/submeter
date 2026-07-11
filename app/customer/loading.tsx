// ============================================================
// Shown automatically by Next.js while app/customer/page.tsx is
// fetching its data on the server. The moment the real data is
// ready, this is swapped out — no code needed to wire this up,
// the filename "loading.tsx" is what triggers it.
//
// Shape matters: this skeleton mirrors the real page's layout
// (a card, then a list) so nothing visually jumps when the real
// content pops in — that's the "prevent CLS" rule from the plan.
// ============================================================
function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className}`} />;
}

export default function CustomerLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Pulse className="mb-6 h-8 w-48" />
      <div className="rounded-lg border border-neutral-200 p-5">
        <Pulse className="mb-2 h-5 w-24" />
        <Pulse className="mb-2 h-4 w-32" />
        <Pulse className="h-3 w-40" />
      </div>
      <Pulse className="mb-4 mt-10 h-6 w-32" />
      <div className="flex flex-col gap-2">
        <Pulse className="h-14 w-full" />
        <Pulse className="h-14 w-full" />
      </div>
    </main>
  );
}
