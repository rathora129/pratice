"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { activityTypes, isPipelineStage, stageLabel } from "@/lib/crm";
import { prisma } from "@/lib/prisma";
import { assignableRoles, can } from "@/lib/rbac";

function refreshLead(leadId: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
}

export async function updateLead(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "leads", "update")) {
    redirect("/admin?denied=leads:update");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const assignedToId = String(formData.get("assignedToId") ?? "").trim();
  const lostReason = String(formData.get("lostReason") ?? "").trim();

  if (!id || !isPipelineStage(status)) {
    redirect(`/admin/leads/${id || ""}?error=invalid`);
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: true },
  });

  if (!lead) {
    redirect("/admin/leads");
  }

  if (assignedToId !== (lead.assignedToId ?? "")) {
    if (!can(user.role, "leads", "assign")) {
      redirect(`/admin/leads/${id}?error=assign`);
    }

    if (assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          status: "active",
          role: { in: assignableRoles },
        },
      });

      if (!assignee) {
        redirect(`/admin/leads/${id}?error=assignee`);
      }
    }
  }

  if (status === "lost" && !lostReason) {
    redirect(`/admin/leads/${id}?error=lost-reason`);
  }

  await prisma.lead.update({
    where: { id },
    data: {
      status,
      lostReason: status === "lost" ? lostReason : null,
      assignedToId: assignedToId || null,
    },
  });

  const changes: string[] = [];
  if (lead.status !== status) {
    changes.push(`stage ${stageLabel(lead.status)} → ${stageLabel(status)}`);
  }
  if ((lead.assignedToId ?? "") !== assignedToId) {
    const nextOwner = assignedToId
      ? await prisma.user.findUnique({ where: { id: assignedToId } })
      : null;
    changes.push(
      `owner ${lead.assignedTo?.name ?? "unassigned"} → ${nextOwner?.name ?? "unassigned"}`,
    );
  }

  await recordAudit({
    actor: user,
    action: "lead.update",
    entityType: "lead",
    entityId: lead.id,
    summary: changes.length
      ? `Updated ${lead.leadNo}: ${changes.join("; ")}`
      : `Reviewed ${lead.leadNo} with no changes`,
    metadata: { status, assignedToId: assignedToId || null },
  });

  refreshLead(lead.id);
  redirect(`/admin/leads/${lead.id}?saved=1`);
}

export async function addLeadActivity(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "leads", "update")) {
    redirect("/admin?denied=leads:update");
  }

  const leadId = String(formData.get("leadId") ?? "");
  const type = String(formData.get("type") ?? "note");
  const note = String(formData.get("note") ?? "").trim();

  if (!leadId || note.length < 2) {
    redirect(`/admin/leads/${leadId}?error=activity`);
  }

  const validType = activityTypes.some((item) => item.value === type)
    ? type
    : "note";

  await prisma.leadActivity.create({
    data: {
      leadId,
      type: validType,
      note: note.slice(0, 2000),
      createdById: user.id,
    },
  });

  refreshLead(leadId);
  redirect(`/admin/leads/${leadId}?activity=1`);
}

export async function convertLead(formData: FormData) {
  const user = await requireUser();

  if (
    !can(user.role, "customers", "create") ||
    !can(user.role, "leads", "update")
  ) {
    redirect("/admin?denied=customers:create");
  }

  const id = String(formData.get("id") ?? "");
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    redirect("/admin/leads");
  }

  if (lead.customerId) {
    redirect(`/admin/customers/${lead.customerId}`);
  }

  const candidates = await prisma.customer.findMany({
    select: { id: true, code: true, company: true },
  });
  const existing = candidates.find(
    (customer) =>
      customer.company.trim().toLowerCase() === lead.company.trim().toLowerCase(),
  );

  if (existing) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { customerId: existing.id },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "note",
        note: `Linked to existing customer ${existing.code} (${existing.company}).`,
        createdById: user.id,
      },
    });

    await recordAudit({
      actor: user,
      action: "customer.link",
      entityType: "customer",
      entityId: existing.id,
      summary: `Linked ${lead.leadNo} to existing customer ${existing.code}`,
    });

    refreshLead(lead.id);
    redirect(`/admin/customers/${existing.id}?linked=1`);
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const code = `CUST-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;

  const customer = await prisma.customer.create({
    data: {
      code,
      company: lead.company,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      ownerId: lead.assignedToId ?? user.id,
    },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { customerId: customer.id },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "note",
      note: `Converted to customer ${customer.code}.`,
      createdById: user.id,
    },
  });

  await recordAudit({
    actor: user,
    action: "customer.create",
    entityType: "customer",
    entityId: customer.id,
    summary: `Converted ${lead.leadNo} to customer ${customer.code} — ${customer.company}`,
    metadata: { leadId: lead.id },
  });

  refreshLead(lead.id);
  redirect(`/admin/customers/${customer.id}?created=1`);
}
