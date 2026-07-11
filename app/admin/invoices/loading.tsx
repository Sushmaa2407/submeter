function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className}`} />;
}

export default function AdminInvoicesLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Pulse className="mb-6 h-8 w-28" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
