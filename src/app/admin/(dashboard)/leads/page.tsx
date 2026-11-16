import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mail, Search } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requirePermission } from "@/lib/auth";
import { pipelineStages } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lead inbox",
};

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePermission("leads", "read");
  const { status = "", q = "" } = await searchParams;
  const search = q.trim();

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { leadNo: { contains: search } },
              { company: { contains: search } },
              { contactName: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: { assignedTo: true, customer: true, _count: { select: { activities: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const counts = await prisma.lead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const total = counts.reduce((sum, row) => sum + row._count._all, 0);
  const countFor = (value: string) =>
    counts.find((row) => row.status === value)?._count._all ?? 0;

  const stats = [
    { label: "Total leads", value: total },
    { label: "New", value: countFor("new") },
    { label: "Qualified", value: countFor("qualified") },
    { label: "Won", value: countFor("won") },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">CRM</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Lead inbox
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-ink-muted">
            Website quote, sample and contact forms create leads here with a
            reference number, ready for assignment and follow-up.
          </p>
        </div>
        <a
          href="/request-a-quote"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary py-2.5"
        >
          Open public form
        </a>
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
          <Link
            href="/admin/leads"
            className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
              !status
                ? "border-ink bg-ink text-white"
                : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
            }`}
          >
            All · {total}
          </Link>
          {pipelineStages.map((item) => (
            <Link
              key={item.value}
              href={`/admin/leads?status=${item.value}`}
              className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
                status === item.value
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {item.label}
              {countFor(item.value) > 0 ? ` · ${countFor(item.value)}` : ""}
            </Link>
          ))}
        </div>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="relative">
            <span className="sr-only">Search leads</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search reference, company or phone"
              className="input w-full pl-9 sm:w-[280px]"
            />
          </label>
          <button type="submit" className="btn-secondary py-2.5">
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cream text-ink-muted">
              <Mail className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink">
              {total === 0
                ? "The inbox is empty."
                : "No leads match this view."}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-ink-muted">
              {total === 0
                ? "Submit the public quote form to test the website-to-CRM flow."
                : "Clear the search or choose another pipeline stage."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link href="/admin/leads" className="btn-secondary py-2 text-[11px]">
                Clear filters
              </Link>
              <a
                href="/request-a-quote"
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 text-[11px]"
              >
                Create test lead
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="admin-th">Lead</th>
                  <th className="admin-th">Requirement</th>
                  <th className="admin-th">Contact</th>
                  <th className="admin-th">Owner</th>
                  <th className="admin-th">Received</th>
                  <th className="admin-th">Stage</th>
                  <th className="admin-th text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {leads.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-cream/50">
                    <td className="admin-td">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-start gap-2.5"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-[10px] font-bold text-ink">
                          {initials(lead.contactName)}
                        </span>
                        <span>
                          <span className="block text-[12px] font-semibold text-ink">
                            {lead.contactName}
                          </span>
                          <span className="block text-[10px] text-ink-muted">
                            {lead.company}
                          </span>
                          <span className="mt-1 block font-mono text-[9px] text-ink/40">
                            {lead.leadNo}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-td">
                      <p className="max-w-[200px] text-[11px] font-medium text-ink">
                        {lead.productInterest ?? "General enquiry"}
                      </p>
                      {lead.quantity && (
                        <p className="mt-0.5 text-[10px] text-ink-muted">
                          Qty · {lead.quantity}
                        </p>
                      )}
                      <p className="mt-1 text-[9px] text-ink/40">
                        {lead._count.activities} activities
                      </p>
                    </td>
                    <td className="admin-td">
                      <a
                        href={`tel:${lead.phone.replace(/\s/g, "")}`}
                        className="block text-[11px] text-ink hover:text-brand-700"
                      >
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="mt-0.5 block max-w-[170px] truncate text-[10px] text-ink-muted hover:text-ink"
                        >
                          {lead.email}
                        </a>
                      )}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {lead.assignedTo?.name ?? "Unassigned"}
                      {lead.customer && (
                        <p className="mt-0.5 font-mono text-[9px] text-emerald-700">
                          {lead.customer.code}
                        </p>
                      )}
                    </td>
                    <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="admin-td">
                      <StatusBadge status={lead.status} />
                      {lead.lostReason && (
                        <p className="mt-1 max-w-[150px] text-[9px] leading-4 text-rose-700">
                          {lead.lostReason}
                        </p>
                      )}
                    </td>
                    <td className="admin-td text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700"
                      >
                        {can(user.role, "leads", "update") ? "Work lead" : "View"}
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

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <StatusBadge status="new" /> New website enquiries
        </span>
        <span>Stages follow the CRM pipeline defined in the Phase 1 docs.</span>
        <span>Showing up to 200 most recent leads.</span>
      </div>
    </div>
  );
}
