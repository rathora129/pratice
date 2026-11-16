import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "@/components/icons";
import { CustomerForm } from "@/components/admin/customer-form";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignableRoles, can } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New customer",
};

export default async function NewCustomerPage() {
  const user = await requirePermission("customers", "create");
  const canAssignOwner = can(user.role, "leads", "assign");

  const owners = canAssignOwner
    ? await prisma.user.findMany({
        where: { status: "active", role: { in: assignableRoles } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-[900px]">
      <nav
        className="flex items-center gap-2 text-[11px] text-ink-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/admin" className="hover:text-ink">
          Admin
        </Link>
        <span className="text-ink/25">/</span>
        <Link href="/admin/customers" className="hover:text-ink">
          Customers
        </Link>
        <span className="text-ink/25">/</span>
        <span className="font-medium text-ink">New</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
            Create a customer
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-ink-muted">
            Customer codes are generated automatically. The company and phone
            pair is checked for duplicates before the record is saved.
          </p>
        </div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-ink"
        >
          Back to list
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        <CustomerForm owners={owners} canAssignOwner={canAssignOwner} />
      </div>
    </div>
  );
}
