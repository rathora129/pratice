"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import type { AdminFormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { can, isRole, roleKeys, roleLabel } from "@/lib/rbac";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Enter the team member's name."),
  email: z.string().trim().toLowerCase().email("Enter a valid work email."),
  role: z.enum(roleKeys),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(200, "That password is too long."),
});

export async function createUser(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireUser();

  if (!can(user.role, "users", "create")) {
    return { status: "error", message: "Your role cannot add users." };
  }

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "error",
      message: "An account with that email already exists.",
      fieldErrors: { email: "Email already in use." },
    };
  }

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  await recordAudit({
    actor: user,
    action: "user.create",
    entityType: "user",
    entityId: created.id,
    summary: `Invited ${created.name} as ${roleLabel(created.role)}`,
    metadata: { role: created.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function updateUserRole(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "users", "update")) {
    redirect("/admin?denied=users:update");
  }

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const target = await prisma.user.findUnique({ where: { id } });

  if (!target) redirect("/admin/users");
  if (!isRole(role)) redirect("/admin/users?error=role");
  if (target.id === user.id) redirect("/admin/users?error=self");
  if (target.role === role) redirect("/admin/users");

  await prisma.user.update({ where: { id }, data: { role } });

  await recordAudit({
    actor: user,
    action: "user.role",
    entityType: "user",
    entityId: id,
    summary: `Changed ${target.name} from ${roleLabel(target.role)} to ${roleLabel(role)}`,
    metadata: { from: target.role, to: role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function toggleUserStatus(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "users", "update")) {
    redirect("/admin?denied=users:update");
  }

  const id = String(formData.get("id") ?? "");
  const target = await prisma.user.findUnique({ where: { id } });

  if (!target) redirect("/admin/users");
  if (target.id === user.id) redirect("/admin/users?error=self");

  const next = target.status === "active" ? "inactive" : "active";

  await prisma.user.update({ where: { id }, data: { status: next } });

  await recordAudit({
    actor: user,
    action: next === "active" ? "user.activate" : "user.deactivate",
    entityType: "user",
    entityId: id,
    summary: `${next === "active" ? "Re-activated" : "Deactivated"} ${target.name} (${roleLabel(target.role)})`,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}
