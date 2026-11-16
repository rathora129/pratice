import Link from "next/link";
import type { Metadata } from "next";
import { Search, Scroll } from "@/components/icons";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/rbac";
import { formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit log",
};

type SearchParams = Promise<{ q?: string; entity?: string }>;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("audit", "read");
  const { q = "", entity = "" } = await searchParams;
  const search = q.trim();

  const [entries, total, entityGroups] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        ...(entity ? { entityType: entity } : {}),
        ...(search
          ? {
              OR: [
                { summary: { contains: search } },
                { action: { contains: search } },
                { actorName: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.auditLog.count(),
    prisma.auditLog.groupBy({
      by: ["entityType"],
      _count: { _all: true },
    }),
  ]);

  const entityCount = (value: string) =>
    entityGroups.find((group) => group.entityType === value)?._count._all ?? 0;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Audit log
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-ink-muted">
            {total} recorded events. Sensitive actions store the actor, role,
            entity and a human-readable summary. Entries are append-only from
            the application; database-level immutability is later-phase work.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-[10px] font-semibold text-ink-muted">
          <Scroll className="h-3.5 w-3.5" />
          Showing latest {entries.length}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/audit"
            className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
              !entity
                ? "border-ink bg-ink text-white"
                : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
            }`}
          >
            All · {total}
          </Link>
          {entityGroups.map((group) => (
            <Link
              key={group.entityType}
              href={`/admin/audit?entity=${group.entityType}`}
              className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold capitalize transition ${
                entity === group.entityType
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {group.entityType} · {entityCount(group.entityType)}
            </Link>
          ))}
        </div>

        <form method="get" className="flex gap-2">
          {entity && <input type="hidden" name="entity" value={entity} />}
          <label className="relative">
            <span className="sr-only">Search audit entries</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search action, actor or summary"
              className="input w-full pl-9 sm:w-[280px]"
            />
          </label>
          <button type="submit" className="btn-secondary py-2.5">
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        {entries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink">No audit events yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-ink-muted">
              Sign in, edit a product or move a lead, then return here. Every
              sensitive write is recorded.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-4 px-5 py-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-[10px] font-bold text-ink">
                  {initials(entry.actorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-[12px] text-ink">
                      <span className="font-semibold">{entry.actorName}</span>
                      <span className="ml-2 text-[10px] text-ink-muted">
                        {roleLabel(entry.actorRole)}
                      </span>
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-ink">
                    {entry.summary}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-ink/10 bg-[#faf9f6] px-2 py-0.5 font-mono text-[9px] text-ink-muted">
                      {entry.action}
                    </span>
                    <span className="rounded-full border border-ink/10 bg-white px-2 py-0.5 font-mono text-[9px] text-ink-muted">
                      {entry.entityType}
                      {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""}
                    </span>
                    {entry.metadata && (
                      <span className="max-w-[420px] truncate font-mono text-[9px] text-ink/35">
                        {entry.metadata}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-[10px] leading-5 text-ink-muted">
        Actions recorded in this phase: sign-in/out, product and variant
        changes, content publishing, lead stage and owner changes, customer
        create/update, role and status changes, and CSV exports.
      </p>
    </div>
  );
}
