function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className}`} />;
}

export default function AdminPlansLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Pulse className="mb-6 h-8 w-24" />
      <Pulse className="h-20 w-full" />
      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Pulse key={i} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
