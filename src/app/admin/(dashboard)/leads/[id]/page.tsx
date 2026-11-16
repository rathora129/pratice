import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, Clock, Mail, Phone, Users } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import {
  addLeadActivity,
  convertLead,
  updateLead,
} from "@/app/actions/leads-admin";
import { requirePermission } from "@/lib/auth";
import {
  activityTypeLabel,
  activityTypes,
  pipelineStages,
  stageLabel,
} from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { assignableRoles, can } from "@/lib/rbac";
import { formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lead detail",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
  saved?: string;
  activity?: string;
  created?: string;
  error?: string;
}>;

const errorMessages: Record<string, string> = {
  invalid: "That stage is not part of the pipeline.",
  assign: "Your role cannot change the lead owner.",
  assignee: "Choose an active CRM user.",
  "lost-reason": "A lost lead needs a reason before it can be saved.",
  activity: "Write at least two characters for the activity note.",
};

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await requirePermission("leads", "read");
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const [lead, owners] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        customer: true,
        activities: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { status: "active", role: { in: assignableRoles } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!lead) notFound();

  const canUpdate = can(user.role, "leads", "update");
  const canAssign = can(user.role, "leads", "assign");
  const canConvert =
    can(user.role, "customers", "create") && can(user.role, "leads", "update");
  const error = query.error ? errorMessages[query.error] : undefined;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/leads"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40 hover:text-ink"
          >
            ← Lead inbox
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">
            {lead.contactName}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
            {lead.company}
            <span className="font-mono text-[10px] text-ink/40">{lead.leadNo}</span>
            <StatusBadge status={lead.status} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.customer && (
            <Link
              href={`/admin/customers/${lead.customer.id}`}
              className="btn-secondary py-2.5"
            >
              <Users className="h-4 w-4" />
              {lead.customer.code}
            </Link>
          )}
          <a
            href={`tel:${lead.phone.replace(/\s/g, "")}`}
            className="btn-secondary py-2.5"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="btn-primary py-2.5">
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>
      </div>

      {query.saved && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Lead saved. The stage change and owner were recorded in the audit log.
        </p>
      )}
      {query.activity && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Activity added to the timeline.
        </p>
      )}
      {error && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="admin-card">
            <h2 className="text-sm font-semibold text-ink">Enquiry</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="field-label">Product interest</dt>
                <dd className="text-[12px] text-ink">
                  {lead.productInterest ?? "General enquiry"}
                </dd>
              </div>
              <div>
                <dt className="field-label">Quantity</dt>
                <dd className="text-[12px] text-ink">
                  {lead.quantity ?? "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="field-label">Source</dt>
                <dd className="text-[12px] capitalize text-ink">{lead.source}</dd>
              </div>
              <div>
                <dt className="field-label">Received</dt>
                <dd className="text-[12px] text-ink">
                  {formatDateTime(lead.createdAt)}
                </dd>
              </div>
            </dl>
            {lead.message && (
              <div className="mt-4 rounded-xl border border-ink/10 bg-cream/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                  Message
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[12px] leading-6 text-ink">
                  {lead.message}
                </p>
              </div>
            )}
          </section>

          <section className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Activity timeline</h2>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Calls, emails and internal notes attached to this lead.
                </p>
              </div>
              <span className="text-[10px] text-ink/40">
                {lead.activities.length} entries
              </span>
            </div>

            {lead.activities.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-[11px] text-ink-muted">
                No activity yet. Log the first follow-up below.
              </p>
            ) : (
              <ol className="mt-5 space-y-4">
                {lead.activities.map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-[9px] font-bold uppercase text-ink">
                      {activityTypeLabel(activity.type).slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-ink/5 pb-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                        {activityTypeLabel(activity.type)} ·{" "}
                        {activity.createdBy?.name ?? "System"}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-ink">
                        {activity.note}
                      </p>
                      <p className="mt-1 text-[9px] text-ink/40">
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {canUpdate && (
              <form
                action={addLeadActivity}
                className="mt-4 space-y-3 border-t border-ink/10 pt-4"
              >
                <input type="hidden" name="leadId" value={lead.id} />
                <div className="flex flex-wrap gap-2">
                  <select
                    name="type"
                    defaultValue="note"
                    aria-label="Activity type"
                    className="input w-[140px] px-2.5 py-2 text-[11px]"
                  >
                    {activityTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="note"
                    required
                    minLength={2}
                    maxLength={2000}
                    placeholder="What happened with this lead?"
                    className="input min-w-[220px] flex-1"
                  />
                  <button type="submit" className="btn-secondary py-2.5">
                    Log activity
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="admin-card">
            <h2 className="text-sm font-semibold text-ink">
              {canUpdate ? "Pipeline controls" : "Pipeline"}
            </h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {canUpdate
                ? "Moving the stage or owner writes an audit entry."
                : "Read-only access for your role."}
            </p>

            {canUpdate ? (
              <form action={updateLead} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={lead.id} />
                <div>
                  <label className="field-label" htmlFor="status">
                    Stage
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={lead.status}
                    className="input"
                  >
                    {pipelineStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="assignedToId">
                    Owner
                  </label>
                  {canAssign ? (
                    <select
                      id="assignedToId"
                      name="assignedToId"
                      defaultValue={lead.assignedToId ?? ""}
                      className="input"
                    >
                      <option value="">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="hidden"
                        name="assignedToId"
                        value={lead.assignedToId ?? ""}
                      />
                      <p className="rounded-lg border border-ink/10 bg-cream/60 px-3 py-2 text-[12px] text-ink">
                        {lead.assignedTo?.name ?? "Unassigned"}
                      </p>
                      <p className="hint">
                        Only managers and owners can reassign leads.
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <label className="field-label" htmlFor="lostReason">
                    Lost reason
                  </label>
                  <input
                    id="lostReason"
                    name="lostReason"
                    defaultValue={lead.lostReason ?? ""}
                    placeholder="Required when the stage is Lost"
                    className="input"
                  />
                </div>

                <button type="submit" className="btn-brand w-full">
                  Save lead
                </button>
              </form>
            ) : (
              <dl className="mt-4 space-y-3 text-[12px]">
                <div>
                  <dt className="field-label">Stage</dt>
                  <dd className="text-ink">{stageLabel(lead.status)}</dd>
                </div>
                <div>
                  <dt className="field-label">Owner</dt>
                  <dd className="text-ink">
                    {lead.assignedTo?.name ?? "Unassigned"}
                  </dd>
                </div>
                {lead.lostReason && (
                  <div>
                    <dt className="field-label">Lost reason</dt>
                    <dd className="text-ink">{lead.lostReason}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>

          <section className="admin-card">
            <h2 className="text-sm font-semibold text-ink">Contact</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-[11px] font-bold text-ink">
                {initials(lead.contactName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-ink">
                  {lead.contactName}
                </p>
                <p className="truncate text-[10px] text-ink-muted">{lead.company}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[11px]">
              <p className="flex items-center gap-2 text-ink">
                <Phone className="h-3.5 w-3.5 text-ink/40" />
                {lead.phone}
              </p>
              {lead.email && (
                <p className="flex items-center gap-2 text-ink">
                  <Mail className="h-3.5 w-3.5 text-ink/40" />
                  <span className="truncate">{lead.email}</span>
                </p>
              )}
              <p className="flex items-center gap-2 text-ink-muted">
                <Clock className="h-3.5 w-3.5 text-ink/40" />
                Updated {formatDateTime(lead.updatedAt)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-ink p-5 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-300">
              Customer master
            </p>
            {lead.customer ? (
              <>
                <p className="mt-2 text-[12px] leading-5 text-white/65">
                  This lead is linked to customer{" "}
                  <span className="font-mono text-white">{lead.customer.code}</span>.
                  Billing and shipping details live on the customer record.
                </p>
                <Link
                  href={`/admin/customers/${lead.customer.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-300 hover:text-white"
                >
                  Open customer
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : canConvert ? (
              <>
                <p className="mt-2 text-[12px] leading-5 text-white/65">
                  Convert once the lead reaches Qualified. An existing customer
                  with the same company name is linked instead of duplicated.
                </p>
                <form action={convertLead} className="mt-4">
                  <input type="hidden" name="id" value={lead.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold text-ink transition hover:bg-brand-100"
                  >
                    Convert to customer
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-2 text-[12px] leading-5 text-white/55">
                Your role cannot convert leads. A sales manager or website owner
                can create the customer record.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
