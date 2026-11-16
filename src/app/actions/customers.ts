"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import type { AdminFormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { assignableRoles, can } from "@/lib/rbac";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(500).nullable().optional(),
);

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().email("Enter a valid email.").nullable().optional(),
);

const optionalMoney = z.preprocess(
  (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) : value;
  },
  z.number().int().nonnegative().nullable(),
);

const customerSchema = z.object({
  id: z.string().trim().optional(),
  company: z.string().trim().min(2, "Enter the company name."),
  contactName: z.string().trim().min(2, "Enter a contact name."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,18}$/, "Enter a valid phone number."),
  email: optionalEmail,
  gstin: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z
      .string()
      .trim()
      .max(15, "GSTIN is 15 characters.")
      .transform((value) => value.toUpperCase())
      .nullable()
      .optional(),
  ),
  billingAddress: optionalText,
  shippingAddress: optionalText,
  city: optionalText,
  state: optionalText,
  pincode: optionalText,
  paymentTerms: optionalText,
  creditLimitPaise: optionalMoney,
  status: z.enum(["active", "on_hold", "inactive"]),
  ownerId: z.string().trim().optional(),
});

function fieldErrors(issues: z.ZodIssue[]) {
  const result: Record<string, string> = {};

  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    result[field] ??= issue.message;
  }

  return result;
}

function refreshCustomer(id: string) {
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin");
}

export async function saveCustomer(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireUser();
  const isCreate = !String(formData.get("id") ?? "").trim();
  const ownerSubmitted = formData.has("ownerId");

  if (!can(user.role, "customers", isCreate ? "create" : "update")) {
    return {
      status: "error",
      message: "Your role does not include customer editing.",
    };
  }

  const parsed = customerSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    company: formData.get("company"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    gstin: formData.get("gstin") ?? "",
    billingAddress: formData.get("billingAddress") ?? "",
    shippingAddress: formData.get("shippingAddress") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    pincode: formData.get("pincode") ?? "",
    paymentTerms: formData.get("paymentTerms") ?? "",
    creditLimitPaise: formData.get("creditLimit") ?? "",
    status: formData.get("status") || "active",
    ownerId: String(formData.get("ownerId") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  let ownerId: string | null | undefined;

  if (ownerSubmitted) {
    if (!can(user.role, "leads", "assign")) {
      return {
        status: "error",
        message: "Your role cannot assign customer ownership.",
        fieldErrors: { ownerId: "Ownership is assigned by a manager." },
      };
    }

    if (data.ownerId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: data.ownerId,
          status: "active",
          role: { in: assignableRoles },
        },
      });

      if (!owner) {
        return {
          status: "error",
          message: "That owner is not an active CRM user.",
          fieldErrors: { ownerId: "Choose an active CRM user." },
        };
      }

      ownerId = owner.id;
    } else {
      ownerId = null;
    }
  }

  if (isCreate) {
    const sameCompany = await prisma.customer.findMany({
      select: { id: true, company: true, phone: true },
    });
    const duplicate = sameCompany.find(
      (customer) =>
        customer.company.trim().toLowerCase() ===
          data.company.trim().toLowerCase() &&
        customer.phone.replace(/\s/g, "") === data.phone.replace(/\s/g, ""),
    );

    if (duplicate) {
      return {
        status: "error",
        message:
          "A customer with this company and phone already exists. Open the existing record instead of creating a duplicate.",
        fieldErrors: { company: "Possible duplicate customer." },
      };
    }
  }

  let customerId = data.id ?? "";

  try {
    if (data.id) {
      const existing = await prisma.customer.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        return { status: "error", message: "This customer no longer exists." };
      }

      const saved = await prisma.customer.update({
        where: { id: data.id },
        data: {
          company: data.company,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email ?? null,
          gstin: data.gstin ?? null,
          billingAddress: data.billingAddress ?? null,
          shippingAddress: data.shippingAddress ?? null,
          city: data.city ?? null,
          state: data.state ?? null,
          pincode: data.pincode ?? null,
          paymentTerms: data.paymentTerms ?? null,
          creditLimitPaise: data.creditLimitPaise ?? null,
          status: data.status,
          ownerId: ownerId === undefined ? existing.ownerId : ownerId,
        },
      });

      customerId = saved.id;

      await recordAudit({
        actor: user,
        action: "customer.update",
        entityType: "customer",
        entityId: saved.id,
        summary: `Updated customer ${saved.code} — ${saved.company}`,
        metadata: { status: saved.status },
      });
    } else {
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const code = `CUST-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;

      const saved = await prisma.customer.create({
        data: {
          code,
          company: data.company,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email ?? null,
          gstin: data.gstin ?? null,
          billingAddress: data.billingAddress ?? null,
          shippingAddress: data.shippingAddress ?? null,
          city: data.city ?? null,
          state: data.state ?? null,
          pincode: data.pincode ?? null,
          paymentTerms: data.paymentTerms ?? null,
          creditLimitPaise: data.creditLimitPaise ?? null,
          status: data.status,
          ownerId,
        },
      });

      customerId = saved.id;

      await recordAudit({
        actor: user,
        action: "customer.create",
        entityType: "customer",
        entityId: saved.id,
        summary: `Created customer ${saved.code} — ${saved.company}`,
        metadata: { status: saved.status },
      });
    }
  } catch (error) {
    console.error("Failed to save customer", error);
    return {
      status: "error",
      message: "The customer could not be saved. Please try again.",
    };
  }

  refreshCustomer(customerId);
  redirect(`/admin/customers/${customerId}?saved=1`);
}
