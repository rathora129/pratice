import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

function cell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!can(user.role, "leads", "export")) {
    return NextResponse.json(
      { error: "Your role cannot export lead data." },
      { status: 403 },
    );
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "asc" },
    include: { assignedTo: true },
  });

  const header = [
    "Lead no",
    "Company",
    "Contact",
    "Phone",
    "Email",
    "Interest",
    "Quantity",
    "Source",
    "Stage",
    "Lost reason",
    "Owner",
    "Received",
  ];

  const rows = leads.map((lead) =>
    [
      lead.leadNo,
      lead.company,
      lead.contactName,
      lead.phone,
      lead.email,
      lead.productInterest,
      lead.quantity,
      lead.source,
      lead.status,
      lead.lostReason,
      lead.assignedTo?.name,
      lead.createdAt.toISOString(),
    ]
      .map(cell)
      .join(","),
  );

  await recordAudit({
    actor: user,
    action: "leads.export",
    entityType: "lead",
    summary: `Exported ${leads.length} leads to CSV`,
    metadata: { rows: leads.length },
  });

  const body = [header.map(cell).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${stamp}.csv"`,
    },
  });
}
