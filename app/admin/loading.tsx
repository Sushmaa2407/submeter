function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className}`} />;
}

export default function AdminDashboardLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Pulse className="mb-8 h-8 w-40" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Pulse className="h-64 w-full" />
        <Pulse className="h-64 w-full" />
      </div>
    </main>
  );
}
