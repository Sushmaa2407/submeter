import { prisma } from "@/lib/db";
import InvoiceActions from "@/components/InvoiceActions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: "PENDING" | "PAID" | "FAILED" }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-green-50 text-green-700",
    FAILED: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { subscription: { include: { plan: true, user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
        Invoices
      </h1>

      {invoices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No invoices yet — they&rsquo;re created automatically when a
          subscription&rsquo;s billing period ends.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="py-2">Customer</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Due</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-neutral-100">
                <td className="py-3 text-neutral-700">
                  {invoice.subscription.user.email}
                </td>
                <td className="py-3 text-neutral-700">
                  {invoice.subscription.plan.name}
                </td>
                <td className="py-3 font-medium text-neutral-900">
                  ${(invoice.amountCents / 100).toFixed(2)}
                </td>
                <td className="py-3 text-neutral-500">
                  {invoice.dueDate.toLocaleDateString()}
                </td>
                <td className="py-3">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="py-3 text-right">
                  <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
