import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Layers,
  Mail,
  Pencil,
  Plus,
  Scroll,
  Users,
} from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { can, roleDescription, roleLabel } from "@/lib/rbac";
import { requireUser } from "@/lib/auth";
import { formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ denied?: string }>;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { denied } = await searchParams;
  const user = await requireUser();

  const [
    productCount,
    publishedCount,
    variantCount,
    leadCount,
    newLeadCount,
    customerCount,
    teamCount,
    contentCount,
    auditCount,
    recentLeads,
    recentProducts,
    recentCustomers,
    recentAudit,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.variant.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.customer.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.contentBlock.count(),
    prisma.auditLog.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { assignedTo: true, customer: true },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        category: true,
        _count: { select: { variants: true } },
      },
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { owner: true, _count: { select: { leads: true } } },
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const allStats = [
    can(user.role, "products", "read")
      ? {
          label: "Live products",
          value: publishedCount,
          detail: `${productCount} total records`,
          href: "/admin/products",
          icon: Box,
        }
      : null,
    can(user.role, "leads", "read")
      ? {
          label: "Open leads",
          value: newLeadCount,
          detail: `${leadCount} total enquiries`,
          href: "/admin/leads",
          icon: Mail,
        }
      : null,
    can(user.role, "customers", "read")
      ? {
          label: "Customers",
          value: customerCount,
          detail: "Converted accounts",
          href: "/admin/customers",
          icon: Users,
        }
      : null,
    can(user.role, "users", "read")
      ? {
          label: "Active users",
          value: teamCount,
          detail: "With workspace access",
          href: "/admin/users",
          icon: Users,
        }
      : null,
    can(user.role, "content", "read")
      ? {
          label: "Website blocks",
          value: contentCount,
          detail: "Editable without code",
          href: "/admin/content",
          icon: Pencil,
        }
      : null,
    can(user.role, "products", "read")
      ? {
          label: "Variants",
          value: variantCount,
          detail: "Across all products",
          href: "/admin/products",
          icon: Layers,
        }
      : null,
  ].filter((stat): stat is NonNullable<typeof stat> => stat !== null);

  const stats = allStats.slice(0, 4);
  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-ink-muted">
            You are signed in as{" "}
            <span className="font-semibold text-ink">
              {roleLabel(user.role)}
            </span>
            . {roleDescription(user.role)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" target="_blank" className="btn-secondary py-2.5">
            View website
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {can(user.role, "products", "create") && (
            <Link href="/admin/products/new" className="btn-primary py-2.5">
              <Plus className="h-4 w-4" />
              New product
            </Link>
          )}
        </div>
      </div>

      {denied && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">
          Your role does not include{" "}
          <span className="font-mono">{denied.replace(":", " · ")}</span>. Ask a
          Super Admin or Business Owner to change your access.
        </p>
      )}

      {stats.length > 0 && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-2xl border border-ink/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream text-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink/20 transition group-hover:text-ink" />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-ink">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">{stat.detail}</p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
        {can(user.role, "leads", "read") ? (
          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Recent leads</h2>
                <p className="mt-0.5 text-[10px] text-ink-muted">
                  Newest website enquiries first.
                </p>
              </div>
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
              >
                Open inbox
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-ink">No enquiries yet.</p>
                <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-ink-muted">
                  Submit the public quote form to see a lead appear here with
                  its reference number.
                </p>
                <Link
                  href="/request-a-quote"
                  target="_blank"
                  className="btn-secondary mt-4 py-2 text-[11px]"
                >
                  Open quote form
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-[#faf9f6]">
                    <tr>
                      <th className="admin-th">Contact</th>
                      <th className="admin-th">Interest</th>
                      <th className="admin-th">Owner</th>
                      <th className="admin-th">Received</th>
                      <th className="admin-th">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="admin-td">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-[10px] font-bold text-ink">
                              {initials(lead.contactName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-semibold text-ink">
                                {lead.contactName}
                              </p>
                              <p className="truncate text-[10px] text-ink-muted">
                                {lead.company}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="admin-td text-[11px] text-ink-muted">
                          {lead.productInterest ?? "General"}
                        </td>
                        <td className="admin-td text-[11px] text-ink-muted">
                          {lead.assignedTo?.name ?? "Unassigned"}
                        </td>
                        <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                          {formatDateTime(lead.createdAt)}
                        </td>
                        <td className="admin-td">
                          <StatusBadge status={lead.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Your workspace</h2>
            <p className="mt-1 text-[11px] leading-5 text-ink-muted">
              This account does not include the enquiry inbox. The modules
              below are enabled for{" "}
              <span className="font-semibold text-ink">{roleLabel(user.role)}</span>.
            </p>
          </section>
        )}

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink/10 bg-ink p-5 text-white shadow-soft">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              Access model
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
              {roleLabel(user.role)}
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-white/55">
              {roleDescription(user.role)}
            </p>
            <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
              {[
                can(user.role, "products", "read") && "Product master (read)",
                can(user.role, "products", "update") && "Product editing",
                can(user.role, "products", "publish") && "Product publishing",
                can(user.role, "content", "update") && "Website content editing",
                can(user.role, "leads", "assign") && "Lead assignment",
                can(user.role, "customers", "update") && "Customer records",
                can(user.role, "users", "read") && "Users & roles",
                can(user.role, "audit", "read") && "Audit log",
              ]
                .filter(Boolean)
                .slice(0, 5)
                .map((item) => (
                  <li
                    key={String(item)}
                    className="flex items-start gap-2 text-[11px] leading-5 text-white/60"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
            </ul>
            <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-5 text-white/35">
              Permissions are checked on the server for pages, forms and data
              changes — hiding a menu item is not the control.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {can(user.role, "products", "create") && (
              <Link
                href="/admin/products/new"
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Plus className="h-4 w-4 text-brand-700" />
                <p className="mt-3 text-[12px] font-semibold text-ink">
                  Add product
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">Spec + variant</p>
              </Link>
            )}
            {can(user.role, "content", "update") && (
              <Link
                href="/admin/content"
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Pencil className="h-4 w-4 text-brand-700" />
                <p className="mt-3 text-[12px] font-semibold text-ink">
                  Edit content
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">Hero + contact</p>
              </Link>
            )}
            {can(user.role, "customers", "create") && (
              <Link
                href="/admin/customers/new"
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Users className="h-4 w-4 text-brand-700" />
                <p className="mt-3 text-[12px] font-semibold text-ink">
                  Add customer
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">Billing master</p>
              </Link>
            )}
            {can(user.role, "audit", "read") && (
              <Link
                href="/admin/audit"
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Scroll className="h-4 w-4 text-brand-700" />
                <p className="mt-3 text-[12px] font-semibold text-ink">
                  Audit log
                </p>
                <p className="mt-0.5 text-[10px] text-ink-muted">
                  {auditCount} events
                </p>
              </Link>
            )}
          </section>
        </div>
      </div>

      {can(user.role, "products", "read") && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Recently updated</h2>
              <p className="mt-0.5 text-[10px] text-ink-muted">
                Changes here are reflected on the public site.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
            >
              All products
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="admin-th">Product</th>
                  <th className="admin-th">Category</th>
                  <th className="admin-th">Variants</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Updated</th>
                  <th className="admin-th sr-only">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-cream/50">
                    <td className="admin-td">
                      <p className="text-[12px] font-semibold text-ink">
                        {product.name}
                      </p>
                      <p className="font-mono text-[9px] text-ink-muted">
                        {product.code}
                      </p>
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {product.category.name}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {product._count.variants}
                    </td>
                    <td className="admin-td">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                      {formatDateTime(product.updatedAt)}
                    </td>
                    <td className="admin-td text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-[11px] font-semibold text-brand-700"
                      >
                        {can(user.role, "products", "update") ? "Edit" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {can(user.role, "customers", "read") && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Newest customers</h2>
              <p className="mt-0.5 text-[10px] text-ink-muted">
                Customer master records created from converted leads.
              </p>
            </div>
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
            >
              All customers
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <p className="px-5 py-8 text-[11px] text-ink-muted">
              No customers yet. Convert a qualified lead from its detail page.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead className="bg-[#faf9f6]">
                  <tr>
                    <th className="admin-th">Customer</th>
                    <th className="admin-th">Contact</th>
                    <th className="admin-th">Owner</th>
                    <th className="admin-th">Leads</th>
                    <th className="admin-th">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-cream/50">
                      <td className="admin-td">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-[12px] font-semibold text-ink hover:text-brand-700"
                        >
                          {customer.company}
                        </Link>
                        <p className="font-mono text-[9px] text-ink-muted">
                          {customer.code}
                        </p>
                      </td>
                      <td className="admin-td">
                        <p className="text-[11px] text-ink">{customer.contactName}</p>
                        <p className="text-[10px] text-ink-muted">{customer.phone}</p>
                      </td>
                      <td className="admin-td text-[11px] text-ink-muted">
                        {customer.owner?.name ?? "Unassigned"}
                      </td>
                      <td className="admin-td text-[11px] text-ink-muted">
                        {customer._count.leads}
                      </td>
                      <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                        {formatDateTime(customer.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {can(user.role, "audit", "read") && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Latest audit events</h2>
              <p className="mt-0.5 text-[10px] text-ink-muted">
                Sensitive changes are recorded with actor and timestamp.
              </p>
            </div>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
            >
              Open log
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-ink/10">
            {recentAudit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-ink">
                    <span className="font-semibold">{entry.actorName}</span> ·{" "}
                    {entry.summary}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-ink/40">
                    {entry.action} · {entry.entityType}
                  </p>
                </div>
                <span className="text-[10px] text-ink-muted">
                  {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
