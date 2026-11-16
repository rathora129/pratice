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

  if (!can(user.role, "customers", "export")) {
    return NextResponse.json(
      { error: "Your role cannot export customer data." },
      { status: 403 },
    );
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "asc" },
    include: { owner: true },
  });

  const header = [
    "Code",
    "Company",
    "Contact",
    "Phone",
    "Email",
    "GSTIN",
    "City",
    "State",
    "Pincode",
    "Payment terms",
    "Credit limit (INR)",
    "Status",
    "Owner",
    "Created",
  ];

  const rows = customers.map((customer) =>
    [
      customer.code,
      customer.company,
      customer.contactName,
      customer.phone,
      customer.email,
      customer.gstin,
      customer.city,
      customer.state,
      customer.pincode,
      customer.paymentTerms,
      customer.creditLimitPaise === null
        ? ""
        : (customer.creditLimitPaise / 100).toFixed(2),
      customer.status,
      customer.owner?.name,
      customer.createdAt.toISOString(),
    ]
      .map(cell)
      .join(","),
  );

  await recordAudit({
    actor: user,
    action: "customers.export",
    entityType: "customer",
    summary: `Exported ${customers.length} customer records to CSV`,
    metadata: { rows: customers.length },
  });

  const body = [header.map(cell).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${stamp}.csv"`,
    },
  });
}
