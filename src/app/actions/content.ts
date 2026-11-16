"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { editableContentFields } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

export async function updateContent(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "content", "update")) {
    redirect("/admin?denied=content:update");
  }

  const values = editableContentFields.map((field) => ({
    key: field.key,
    value: String(formData.get(field.key) ?? "").trim(),
  }));

  const heroTitle = values.find((item) => item.key === "hero.title")?.value;
  const heroSubtitle = values.find(
    (item) => item.key === "hero.subtitle",
  )?.value;

  if (!heroTitle || !heroSubtitle) {
    redirect("/admin/content?error=required");
  }

  const existing = await prisma.contentBlock.findMany({
    select: { key: true, value: true },
  });
  const previous = new Map(existing.map((row) => [row.key, row.value]));

  for (const item of values) {
    await prisma.contentBlock.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    });
  }

  const changedKeys = values
    .filter((item) => previous.get(item.key) !== item.value)
    .map((item) => item.key);

  await recordAudit({
    actor: user,
    action: "content.publish",
    entityType: "content",
    entityId: "homepage",
    summary: `Published ${changedKeys.length} website content change${changedKeys.length === 1 ? "" : "s"}`,
    metadata: { changedKeys },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}
