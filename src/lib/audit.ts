import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

type AuditInput = {
  actor: SessionUser;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function recordAudit({
  actor,
  action,
  entityType,
  entityId,
  summary,
  metadata,
}: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action,
        entityType,
        entityId: entityId ?? null,
        summary,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
