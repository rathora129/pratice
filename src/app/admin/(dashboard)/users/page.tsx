import type { Metadata } from "next";
import { Check } from "@/components/icons";
import { UserForm } from "@/components/admin/user-form";
import { StatusBadge } from "@/components/status-badge";
import { toggleUserStatus, updateUserRole } from "@/app/actions/users";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  actionKeys,
  can,
  moduleKeys,
  permissionsFor,
  roleKeys,
  roleLabel,
} from "@/lib/rbac";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users & roles",
};

type SearchParams = Promise<{
  saved?: string;
  created?: string;
  error?: string;
}>;

const actionInitials: Record<string, string> = {
  read: "R",
  create: "C",
  update: "U",
  delete: "D",
  approve: "A",
  publish: "P",
  export: "E",
  assign: "S",
  configure: "F",
};

const roleShort: Record<string, string> = {
  super_admin: "Super",
  business_owner: "Owner",
  website_manager: "Web",
  marketing_manager: "Mktg",
  sales_manager: "Sales Mgr",
  sales_executive: "Sales Exec",
  production_manager: "Prod Mgr",
  production_operator: "Prod Op",
  inventory_manager: "Inv",
  procurement_manager: "Proc",
  quality_manager: "QA",
  accounts_manager: "Accts",
  finance_executive: "Fin",
  customer_support: "Support",
  customer_portal_user: "Portal",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePermission("users", "read");
  const query = await searchParams;
  const canUpdate = can(user.role, "users", "update");
  const canCreate = can(user.role, "users", "create");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { auditLogs: true, assignedLeads: true } } },
  });

  const activeCount = users.filter((member) => member.status === "active").length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Users & roles
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-ink-muted">
            {users.length} accounts · {activeCount} active. Role changes take
            effect on the next server request for that user.
          </p>
        </div>
      </div>

      {query.created && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Team member added. Share the temporary password securely.
        </p>
      )}
      {query.saved && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Access updated and recorded in the audit log.
        </p>
      )}
      {query.error === "self" && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          You cannot change your own role or deactivate your own account.
        </p>
      )}
      {query.error === "role" && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          That role is not part of the access matrix.
        </p>
      )}

      {canCreate && (
        <section className="admin-card mt-6">
          <div className="border-b border-ink/10 pb-4">
            <h2 className="text-sm font-semibold text-ink">Add a team member</h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              The account is active immediately. There is no email delivery in
              this build, so share the temporary password directly.
            </p>
          </div>
          <div className="mt-5">
            <UserForm />
          </div>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Workspace accounts</h2>
          <p className="mt-0.5 text-[10px] text-ink-muted">
            {canUpdate
              ? "Changing a role or status writes an audit entry."
              : "Read-only view for your role."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#faf9f6]">
              <tr>
                <th className="admin-th">Member</th>
                <th className="admin-th">Role</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Leads</th>
                <th className="admin-th">Audit events</th>
                <th className="admin-th">Joined</th>
                <th className="admin-th text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {users.map((member) => {
                const isSelf = member.id === user.id;
                const permissions = permissionsFor(member.role).length;

                return (
                  <tr key={member.id} className="align-top hover:bg-cream/50">
                    <td className="admin-td">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-[10px] font-bold text-ink">
                          {initials(member.name)}
                        </span>
                        <div>
                          <p className="text-[12px] font-semibold text-ink">
                            {member.name}
                            {isSelf && (
                              <span className="ml-2 rounded-full border border-ink/10 bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            {member.email}
                          </p>
                          <p className="mt-0.5 text-[9px] text-ink/40">
                            {permissions} permissions
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      {canUpdate && !isSelf ? (
                        <form
                          action={updateUserRole}
                          className="flex items-center gap-1.5"
                        >
                          <input type="hidden" name="id" value={member.id} />
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="input w-[180px] px-2 py-1.5 text-[11px]"
                            aria-label={`Role for ${member.name}`}
                          >
                            {roleKeys.map((role) => (
                              <option key={role} value={role}>
                                {roleLabel(role)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-[10px] font-semibold text-ink transition hover:border-ink/35"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <span className="text-[11px] text-ink">
                          {roleLabel(member.role)}
                        </span>
                      )}
                    </td>
                    <td className="admin-td">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {member._count.assignedLeads}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {member._count.auditLogs}
                    </td>
                    <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="admin-td text-right">
                      {canUpdate && !isSelf ? (
                        <form action={toggleUserStatus}>
                          <input type="hidden" name="id" value={member.id} />
                          <button
                            type="submit"
                            className="text-[10px] font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                          >
                            {member.status === "active"
                              ? "Deactivate"
                              : "Reactivate"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-ink/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Role-permission matrix</h2>
          <p className="mt-0.5 text-[10px] leading-5 text-ink-muted">
            Every cell is enforced on the server.{" "}
            {actionKeys.map((action) => `${actionInitials[action]} = ${action}`).join(" · ")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-[#faf9f6]">
              <tr>
                <th className="admin-th">Module</th>
                {roleKeys.map((role) => (
                  <th
                    key={role}
                    className="admin-th whitespace-nowrap text-center"
                    title={roleLabel(role)}
                  >
                    {roleShort[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {moduleKeys.map((module) => (
                <tr key={module}>
                  <td className="admin-td text-[11px] font-semibold capitalize text-ink">
                    {module}
                  </td>
                  {roleKeys.map((role) => {
                    const granted = permissionsFor(role)
                      .filter((permission) => permission.startsWith(`${module}:`))
                      .map(
                        (permission) =>
                          actionInitials[permission.split(":")[1] ?? ""] ?? "",
                      )
                      .join("");
                    return (
                      <td
                        key={role}
                        className="admin-td text-center font-mono text-[10px] text-ink-muted"
                      >
                        {granted || <span className="text-ink/15">·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="border-t border-ink/10 px-5 py-3 text-[10px] leading-5 text-ink-muted">
          The matrix is intentionally narrow in this phase: it covers the
          modules that exist in the build. Production, inventory, procurement,
          quality and finance permissions are drafted in the Phase 1 RBAC
          document and will be added with those modules.
        </p>
      </section>

      <p className="mt-4 text-[10px] text-ink-muted">
        Last activity shown here is a count of recorded audit events, not a
        sign-in history. Session listing and revocation are pending.
      </p>
    </div>
  );
}
