import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plus, Search, Users } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customers",
};

type SearchParams = Promise<{ q?: string; status?: string }>;

const statusOptions = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "inactive", label: "Inactive" },
];

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePermission("customers", "read");
  const { q = "", status = "" } = await searchParams;
  const search = q.trim();

  const [customers, total, activeCount, customerCount] = await Promise.all([
    prisma.customer.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search } },
                { company: { contains: search } },
                { contactName: { contains: search } },
                { phone: { contains: search } },
                { gstin: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        owner: true,
        _count: { select: { leads: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "active" } }),
    prisma.customer.count({ where: { status: "on_hold" } }),
  ]);

  const stats = [
    { label: "Customers", value: total },
    { label: "Active", value: activeCount },
    { label: "On hold", value: customerCount },
    { label: "Showing", value: customers.length },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">CRM</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Customer master
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-ink-muted">
            Billing, shipping and account ownership for converted leads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can(user.role, "customers", "export") && (
            <a href="/admin/customers/export" className="btn-secondary py-2.5">
              Export CSV
            </a>
          )}
          {can(user.role, "customers", "create") && (
            <Link href="/admin/customers/new" className="btn-primary py-2.5">
              <Plus className="h-4 w-4" />
              New customer
            </Link>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft"
          >
            <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((item) => (
            <Link
              key={item.value || "all"}
              href={
                item.value
                  ? `/admin/customers?status=${item.value}`
                  : "/admin/customers"
              }
              className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
                status === item.value
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="relative">
            <span className="sr-only">Search customers</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search code, company, phone or GSTIN"
              className="input w-full pl-9 sm:w-[300px]"
            />
          </label>
          <button type="submit" className="btn-secondary py-2.5">
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cream text-ink-muted">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink">
              {total === 0 ? "No customers yet." : "No customers match this view."}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-ink-muted">
              {total === 0
                ? "Convert a qualified lead or create a customer record directly."
                : "Clear the search or choose another status."}
            </p>
            {can(user.role, "customers", "create") && (
              <Link
                href="/admin/customers/new"
                className="btn-primary mt-5 py-2 text-[11px]"
              >
                New customer
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="admin-th">Customer</th>
                  <th className="admin-th">Contact</th>
                  <th className="admin-th">GSTIN</th>
                  <th className="admin-th">Owner</th>
                  <th className="admin-th">Leads</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Updated</th>
                  <th className="admin-th text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream/50">
                    <td className="admin-td">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-[12px] font-semibold text-ink hover:text-brand-700"
                      >
                        {customer.company}
                      </Link>
                      <p className="font-mono text-[9px] text-ink/40">
                        {customer.code}
                      </p>
                    </td>
                    <td className="admin-td">
                      <p className="text-[11px] text-ink">{customer.contactName}</p>
                      <p className="text-[10px] text-ink-muted">{customer.phone}</p>
                    </td>
                    <td className="admin-td font-mono text-[10px] text-ink-muted">
                      {customer.gstin ?? "—"}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {customer.owner?.name ?? "Unassigned"}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {customer._count.leads}
                    </td>
                    <td className="admin-td">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                      {formatDateTime(customer.updatedAt)}
                    </td>
                    <td className="admin-td text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
                      >
                        {can(user.role, "customers", "update") ? "Edit" : "View"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[10px] leading-5 text-ink-muted">
        Customer records are scoped to the sales and finance roles that need
        them. Customer portal accounts are not created from this screen yet.
      </p>
    </div>
  );
}
