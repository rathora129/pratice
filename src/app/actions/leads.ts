"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { LeadFormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  contactName: z.string().trim().min(2, "Enter your full name."),
  company: z.string().trim().min(2, "Enter your company name."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,18}$/, "Enter a valid phone number."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  productInterest: z.string().trim().optional(),
  quantity: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
});

function reference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LEAD-${date}-${suffix}`;
}

export async function submitLead(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    return {
      status: "success",
      message: "Thanks — your brief has been received.",
      reference: reference(),
    };
  }

  const parsed = leadSchema.safeParse({
    contactName: formData.get("contactName"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    productInterest: formData.get("productInterest") ?? "",
    quantity: formData.get("quantity") ?? "",
    message: formData.get("message") ?? "",
    source: formData.get("source") ?? "website",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }

    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        leadNo: reference(),
        contactName: parsed.data.contactName,
        company: parsed.data.company,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        productInterest: parsed.data.productInterest || null,
        quantity: parsed.data.quantity || null,
        message: parsed.data.message || null,
        source: parsed.data.source || "website",
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return {
      status: "success",
      message:
        "Your brief is with our team. We aim to respond within one business day.",
      reference: lead.leadNo,
    };
  } catch (error) {
    console.error("Failed to create lead", error);

    return {
      status: "error",
      message:
        "We could not save your enquiry right now. Please call us on +91 97170 23662.",
    };
  }
}
