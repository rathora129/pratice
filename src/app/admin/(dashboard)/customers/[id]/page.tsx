import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, Mail, Phone } from "@/components/icons";
import { CustomerForm } from "@/components/admin/customer-form";
import { StatusBadge } from "@/components/status-badge";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignableRoles, can } from "@/lib/rbac";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer detail",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string; created?: string; linked?: string }>;

const statusLabels: Record<string, string> = {
  active: "Active",
  on_hold: "On hold",
  inactive: "Inactive",
};

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await requirePermission("customers", "read");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const canUpdate = can(user.role, "customers", "update");
  const canAssignOwner = can(user.role, "leads", "assign");

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      owner: true,
      leads: {
        orderBy: { createdAt: "desc" },
        include: { assignedTo: true },
      },
    },
  });

  if (!customer) notFound();

  const owners =
    canUpdate && canAssignOwner
      ? await prisma.user.findMany({
          where: { status: "active", role: { in: assignableRoles } },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : [];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/customers"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40 hover:text-ink"
          >
            ← Customer master
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">
            {customer.company}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
            <span className="font-mono text-[10px] text-ink/40">
              {customer.code}
            </span>
            <StatusBadge status={customer.status} />
            <span>Owner · {customer.owner?.name ?? "Unassigned"}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${customer.phone.replace(/\s/g, "")}`}
            className="btn-secondary py-2.5"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="btn-primary py-2.5">
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>
      </div>

      {query.saved && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Customer saved. The change was written to the audit log.
        </p>
      )}
      {query.created && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Lead converted into a new customer record.
        </p>
      )}
      {query.linked && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Lead linked to this existing customer instead of creating a duplicate.
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {canUpdate ? (
            <>
              <p className="text-[11px] leading-5 text-ink-muted">
                Editing a customer updates billing and shipping details used by
                quotations and invoices once those modules are built.
              </p>
              <CustomerForm
                owners={owners}
                canAssignOwner={canAssignOwner}
                customer={{
                  id: customer.id,
                  code: customer.code,
                  company: customer.company,
                  contactName: customer.contactName,
                  phone: customer.phone,
                  email: customer.email,
                  gstin: customer.gstin,
                  billingAddress: customer.billingAddress,
                  shippingAddress: customer.shippingAddress,
                  city: customer.city,
                  state: customer.state,
                  pincode: customer.pincode,
                  paymentTerms: customer.paymentTerms,
                  creditLimitPaise: customer.creditLimitPaise,
                  status: customer.status,
                  ownerId: customer.ownerId,
                }}
              />
            </>
          ) : (
            <section className="admin-card">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h2 className="text-sm font-semibold text-ink">
                  Customer record
                </h2>
                <span className="rounded-full border border-ink/10 bg-cream px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Read only
                </span>
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Contact", customer.contactName],
                  ["Phone", customer.phone],
                  ["Email", customer.email ?? "Not provided"],
                  ["GSTIN", customer.gstin ?? "Not provided"],
                  ["Status", statusLabels[customer.status] ?? customer.status],
                  ["Owner", customer.owner?.name ?? "Unassigned"],
                  [
                    "Credit limit",
                    customer.creditLimitPaise === null
                      ? "Not set"
                      : formatPrice(customer.creditLimitPaise),
                  ],
                  ["Payment terms", customer.paymentTerms ?? "Not set"],
                  ["City", customer.city ?? "—"],
                  ["State", customer.state ?? "—"],
                  ["Pincode", customer.pincode ?? "—"],
                  ["Created", formatDateTime(customer.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="field-label">{label}</dt>
                    <dd className="text-[12px] text-ink">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="field-label">Billing address</dt>
                  <dd className="whitespace-pre-line text-[12px] leading-5 text-ink">
                    {customer.billingAddress ?? "Not provided"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="field-label">Shipping address</dt>
                  <dd className="whitespace-pre-line text-[12px] leading-5 text-ink">
                    {customer.shippingAddress ?? "Not provided"}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] leading-5 text-amber-900">
                Your role has read-only access to the customer master. Ask a
                Sales Manager or Business Owner to make changes.
              </p>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Linked leads</h2>
                <p className="mt-0.5 text-[10px] text-ink-muted">
                  Every enquiry converted into or matched to this customer.
                </p>
              </div>
              <span className="text-[10px] text-ink/40">
                {customer.leads.length} records
              </span>
            </div>

            {customer.leads.length === 0 ? (
              <p className="px-5 py-8 text-[11px] text-ink-muted">
                No leads linked yet. Convert a qualified lead from the CRM
                inbox.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="bg-[#faf9f6]">
                    <tr>
                      <th className="admin-th">Lead</th>
                      <th className="admin-th">Interest</th>
                      <th className="admin-th">Owner</th>
                      <th className="admin-th">Stage</th>
                      <th className="admin-th">Received</th>
                      <th className="admin-th sr-only">Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {customer.leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-cream/50">
                        <td className="admin-td">
                          <p className="text-[12px] font-semibold text-ink">
                            {lead.contactName}
                          </p>
                          <p className="font-mono text-[9px] text-ink/40">
                            {lead.leadNo}
                          </p>
                        </td>
                        <td className="admin-td text-[11px] text-ink-muted">
                          {lead.productInterest ?? "General"}
                        </td>
                        <td className="admin-td text-[11px] text-ink-muted">
                          {lead.assignedTo?.name ?? "Unassigned"}
                        </td>
                        <td className="admin-td">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                          {formatDateTime(lead.createdAt)}
                        </td>
                        <td className="admin-td text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
                          >
                            Open
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="admin-card">
            <h2 className="text-sm font-semibold text-ink">Record</h2>
            <dl className="mt-3 space-y-3 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Customer code</dt>
                <dd className="font-mono text-[10px] text-ink">{customer.code}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Status</dt>
                <dd className="text-ink">
                  {statusLabels[customer.status] ?? customer.status}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Credit limit</dt>
                <dd className="text-ink">
                  {customer.creditLimitPaise === null
                    ? "Not set"
                    : formatPrice(customer.creditLimitPaise)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Created</dt>
                <dd className="text-ink">{formatDateTime(customer.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Updated</dt>
                <dd className="text-ink">{formatDateTime(customer.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-ink p-5 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-300">
              Data scope
            </p>
            <p className="mt-2 text-[11px] leading-5 text-white/55">
              Customer records are only visible to the CRM and finance roles in
              the RBAC matrix. The customer portal, with its own scoped login,
              is delivered in a later phase.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
